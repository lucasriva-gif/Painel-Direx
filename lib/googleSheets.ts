import { GoogleAuth } from 'google-auth-library';
import { LinhaPlanilha } from './metricas'; 
import credentials from '../credentials.json';

// Função auxiliar usando as credenciais importadas do JSON
async function getAuthToken(scopes: string[]): Promise<string> {
  const auth = new GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
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

// Substitui fetchUltimaAtualizacaoPlanilha inteiramente
export async function fetchUltimaAtualizacaoPlanilha(dados: LinhaPlanilha[]): Promise<string> {
  if (!dados || dados.length === 0) return 'Data indisponível';

  // Pega todas as datas válidas da coluna C (data_entrega_prevista_cliente)
  const datas = dados
    .map((linha) => {
      const raw = linha.data_entrega_prevista_cliente;
      if (!raw) return null;

      if (raw.includes('/')) {
        const [dia, mes, ano] = raw.split('/').map(Number);
        return new Date(Date.UTC(ano, mes - 1, dia));
      }
      return new Date(raw + 'T00:00:00Z');
    })
    .filter((d): d is Date => d !== null && !isNaN(d.getTime()));

  if (datas.length === 0) return 'Data indisponível';

  const dataMaxima = new Date(Math.max(...datas.map((d) => d.getTime())));

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dataMaxima);
}