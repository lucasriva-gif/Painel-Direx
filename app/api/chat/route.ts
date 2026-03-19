// Exemplo: import { executarQuerySQL } from '@/lib/db';
import { executarQuerySQL } from '../../../lib/db'; 

export async function POST(req: Request) {
  const { model, messages } = await req.json();

  // 1. O PROMPT DE SISTEMA (O Mapa da Tabela)
const systemPrompt = {
    role: 'system',
    content: `Você é um assistente de dados especializado na view MySQL 'impactados_performance'.
    
    COLUNAS DISPONÍVEIS:
    - dt_maxima (DATE)
    - unidade (VARCHAR)
    - legenda (VARCHAR)
    - qtd_pedidos (DECIMAL)
    - pedidos_impactados (DECIMAL)

    REGRAS CRÍTICAS DE CÁLCULO (PERFORMANCE):
    1. A Performance NUNCA deve ser calculada linha a linha ou por média simples.
    2. Protocolo Obrigatório: 
       a) Execute SUM(pedidos_impactados).
       b) Execute SUM(qtd_pedidos).
       c) Aplique a fórmula: (1 - (Soma_Impactados / Soma_Total)) * 100.
    3. Sempre apresente o resultado final em formato de porcentagem (ex: 95,5%).

    DIRETRIZES DE CONSULTA (STOP & ASK):
    - FILTRO DE TEMPO: O banco possui dados de vários anos. Se o usuário não especificar o ANO ou o MÊS na pergunta, você está PROIBIDO de gerar a query. Responda educadamente perguntando qual o período de referência.
    - AMBIGUIDADE: Não suponha unidades ou legendas. Se a pergunta for vaga, peça especificações antes de chamar a ferramenta 'executar_sql'.
    - SEGURANÇA: Bloqueio total para comandos INSERT, UPDATE, DELETE ou DROP. Nunca invente dados.

    MAPEAMENTO DE UNIDADES:
    - Unidades iniciadas com 'H' (ex: HJUN, HOSA): 'Hubs'.
    - Unidades iniciadas com 'PA' ou 'P.A': 'PAs' ou 'Posto Avançado'.
    - Demais unidades: 'Parceiras'.

    VALORES DA COLUNA LEGENDA (Literais):
    'ATRASO NA TRANSFERÊNCIA', 'ENTREGA FEITA PELOS CORREIOS', 'ENTREGA FEITA PELA UNIDADE QUE RECEBEU', 'ERRO DE PROCESSO - TRANSFERIU SEM RECEBER', 'ENVIADO VOANDO'.

    COMPORTAMENTO DA FERRAMENTA:
    - Use a função 'executar_sql' para buscar os dados brutos. 
    - Não realize cálculos complexos dentro do SQL se puder processá-los com precisão após receber os valores das somas.
    - Responda de forma educada, formal e resumida.`
  };

  // Injetamos o mapa da tabela sempre no início da conversa
  const messagesWithSystem = [systemPrompt, ...messages];

  // 2. A DEFINIÇÃO DA FERRAMENTA (Tool)
  const tools = [
    {
      type: 'function',
      function: {
        name: 'executar_sql',
        description: 'Executa uma consulta SELECT no MySQL para buscar dados reais.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'A query SQL (apenas SELECT) válida para extrair os dados.'
            }
          },
          required: ['query']
        }
      }
    }
  ];

  try {
    // 3. PRIMEIRA CHAMADA AO OLLAMA (stream: false)
    // Pedimos a resposta de uma vez para podermos ler se ele quer usar a ferramenta.
    const firstResponse = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model: model || 'qwen3:30b', 
        messages: messagesWithSystem, 
        stream: false, // Desativado temporariamente para ler o JSON inteiro
        tools: tools 
      }),
    });

    const firstData = await firstResponse.json();
    const responseMessage = firstData.message;

    // 4. A IA QUER EXECUTAR UMA QUERY SQL?
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      
      const toolCall = responseMessage.tool_calls[0];
      const query = toolCall.function.arguments.query;
      
      console.log("IA gerou a query SQL:", query);

      // Rodamos a query no seu banco de dados usando a sua função do db.ts
      const dbResult = await executarQuerySQL(query);

      // Atualizamos o histórico para a IA saber o que aconteceu
      messagesWithSystem.push(responseMessage); // Adiciona o registro de que ela chamou a tool
      messagesWithSystem.push({
        role: 'tool',
        content: JSON.stringify(dbResult), // Injeta o resultado bruto do banco (JSON)
      });

      // 5. SEGUNDA CHAMADA AO OLLAMA (stream: true)
      // Agora a IA tem os dados do banco e vai formular a resposta humanizada via streaming
      const finalResponse = await fetch('http://127.0.0.1:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model: model || 'qwen3:30b', 
          messages: messagesWithSystem, 
          stream: true // Reativamos o streaming para o Front-end!
        }),
      });

      // Retornamos o stream para o React (O mesmo código que você já tinha)
      return createStreamResponse(finalResponse);

    } else {
      // 6. A IA RESPONDEU NORMALMENTE (Não precisou de banco de dados)
      // Ex: O usuário só disse "Oi, tudo bem?". 
      // Criamos um fluxo artificial rápido apenas para o Front-end ler sem quebrar.
      const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(responseMessage.content));
          controller.close();
        }
      });
      return new Response(readableStream, { headers: { 'Content-Type': 'text/plain' } });
    }

  } catch (error) {
    console.error("Erro na comunicação com a VM:", error);
    return new Response("Erro interno no servidor.", { status: 500 });
  }
}

// Função auxiliar com o seu código de leitura do Ollama para manter tudo organizado
function createStreamResponse(ollamaResponse: Response) {
  const readableStream = new ReadableStream({
    async start(controller) {
      const reader = ollamaResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return controller.close();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              controller.enqueue(new TextEncoder().encode(data.message.content));
            }
          } catch (e) {
            console.error("Erro lendo chunk do Ollama", e);
          }
        }
      }
      controller.close();
    }
  });

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/plain' }
  });
}