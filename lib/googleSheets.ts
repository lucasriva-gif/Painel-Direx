import { GoogleAuth } from 'google-auth-library';
import { LinhaPlanilha } from './metricas'; 

// Função auxiliar para centralizar a geração do token e evitar repetição de código
async function getAuthToken(scopes: string[]): Promise<string> {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      // O replace garante que as quebras de linha (\n) do .env sejam lidas corretamente
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), 
    },
    scopes: scopes,
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  if (!token.token) {
    throw new Error('Não foi possível gerar o token de acesso.');
  }

  return token.token;
}

export async function fetchDadosPlanilha(): Promise<LinhaPlanilha[]> {
  const sheetId = process.env.SPREADSHEET_ID;
  const nomeDaAba = 'Tab_geral'; 
  const intervalo = 'A:E';

  try {
    // 1. Gera o token passando o escopo do Google Sheets
    const token = await getAuthToken(['https://www.googleapis.com/auth/spreadsheets.readonly']);

    // 2. Faz o fetch usando o Token no Header
    const range = encodeURIComponent(`${nomeDaAba}!${intervalo}`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
      next: { revalidate: 3600 } 
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("🚨 Detalhes do erro Google Sheets:", errorBody);
      throw new Error(`Erro ao buscar dados: ${res.statusText}`);
    }

    const data = await res.json();
    const rows = data.values;

    if (!rows || rows.length === 0) { return []; }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Mapeia os arrays de strings para o nosso formato de objeto
    const linhasFormatadas: LinhaPlanilha[] = dataRows.map((row: string[]) => {
      return {
        Empresa: row[headers.indexOf('Empresa')] || '',
        MODAL: row[headers.indexOf('MODAL')] || '',
        data_entrega_prevista_cliente: row[headers.indexOf('data_entrega_prevista_cliente')] || '',
        'sum Qtd Dentro': Number(row[headers.indexOf('sum Qtd Dentro')]) || 0,
        'sum Qtd Pedido': Number(row[headers.indexOf('sum Qtd Pedido')]) || 0,
      };
    });

    return linhasFormatadas;

  } catch (error) {
    console.error("Falha na conexão com o Sheets:", error);
    return []; // Retorna vazio em caso de falha para não quebrar a tela
  }
}

export async function fetchUltimaAtualizacaoPlanilha(): Promise<string> {
  const sheetId = process.env.SPREADSHEET_ID;
  // Note que removemos o ?key= da URL, pois agora usamos o token no header
  const url2 = `https://www.googleapis.com/drive/v3/files/${sheetId}?fields=modifiedTime`;

  try {
    // 1. Gera o token passando o escopo do Google Drive
    const token = await getAuthToken(['https://www.googleapis.com/auth/drive.metadata.readonly']);

    // 2. Faz o fetch usando o Token no Header
    const res = await fetch(url2, { 
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 3600 } 
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("🚨 Detalhes do erro Google Drive:", errorBody);
      throw new Error('Falha ao buscar metadados do Drive');
    }

    const data = await res.json();
    
    if (data.modifiedTime) {
      const dataAtualizacao = new Date(data.modifiedTime);
      
      return new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dataAtualizacao);
    }
    
    return 'Data indisponível';
  } catch (error) {
    console.error("Erro ao buscar data de atualização:", error);
    return 'Data indisponível'; 
  }
}