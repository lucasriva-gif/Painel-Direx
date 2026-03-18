export async function POST(req: Request) {
  const { model, messages, stream } = await req.json();

  // Faz a requisição para a sua VM (se a API estiver na VM, use localhost)
  const ollamaResponse = await fetch('http://127.0.0.1:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream }),
  });

  // Criamos um fluxo de leitura limpo para mandar ao Front-end
  const readableStream = new ReadableStream({
    async start(controller) {
      const reader = ollamaResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return controller.close();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        
        // O Ollama devolve vários JSONs separados por quebra de linha. 
        // Lemos cada um e extraímos apenas o texto gerado.
        const lines = chunk.split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              // Envia APENAS o texto puro para o seu React (ex: "A", " capital", " é")
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