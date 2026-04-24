// 1. Tipagem dos dados brutos vindos da planilha
export type LinhaPlanilha = {
  Empresa: string;
  MODAL: string;
  data_entrega_prevista_cliente: string; 
  'sum Qtd Dentro': number;
  'sum Qtd Pedido': number;
};

// 2. Tipagem do dado formatado para o componente
export type MetricaCard = {
  valor: string;
  nome: string;
  variacao: string;
  positivo: boolean;
  constante: string;
};

// Funções auxiliares de data

const isMesAtual = (data: Date, hoje: Date) => {
  return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
};

const getSemanaDoAno = (data: Date): number => {
  // Clona a data e move para a quinta-feira da semana (padrão ISO 8601)
  const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));
  // Dia da semana: segunda = 1 ... domingo = 7
  const diaSemana = d.getUTCDay() || 7;
  // Move para a quinta-feira da mesma semana ISO
  d.setUTCDate(d.getUTCDate() + 4 - diaSemana);
  // Primeiro dia do ano dessa quinta-feira
  const primeiroDiaAno = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Número de semanas completas entre o primeiro dia do ano e a quinta-feira
  return Math.ceil(((d.getTime() - primeiroDiaAno.getTime()) / 86_400_000 + 1) / 7);
};

export function processarMetricas(dadosBrutos: LinhaPlanilha[]): MetricaCard[] {
  const empresas = ['3P MAGALU', 'EPOCA', 'NETSHOES', 'SAIDA CD'];
  const empresas_nome = ['3P MAGALU ENTREGAS', '1P ÉPOCA', '1P NETSHOES', '1P MAGALU']
  const hoje = new Date();
  const semanaAtual = getSemanaDoAno(hoje);
  const semanaAnterior = semanaAtual - 1;

  return empresas.map((empresa, index) => { 
    const dadosEmpresa = dadosBrutos.filter((linha) => linha.Empresa === empresa);

    let somaDentroMes = 0;
    let somaPedidoMes = 0;

    let somaDentroSemanaAtual = 0;
    let somaPedidoSemanaAtual = 0;

    let somaDentroSemanaAnterior = 0;
    let somaPedidoSemanaAnterior = 0;

    dadosEmpresa.forEach((linha) => {
      // Garante que a data seja interpretada em UTC para evitar
      // off-by-one causado por fuso horário local
    const rawDate = linha.data_entrega_prevista_cliente;
    let dataEntrega: Date;

    if (rawDate.includes('/')) {
      // Formato DD/MM/YYYY vindo do Google Sheets
      const [dia, mes, ano] = rawDate.split('/').map(Number);
      dataEntrega = new Date(Date.UTC(ano, mes - 1, dia));
    } else {
      // Formato ISO YYYY-MM-DD
      dataEntrega = new Date(rawDate + 'T00:00:00Z');
    }

      const qtdDentro = Number(linha['sum Qtd Dentro']) || 0;
      const qtdPedido = Number(linha['sum Qtd Pedido']) || 0;
      const semanaDaLinha = getSemanaDoAno(dataEntrega);

      // Mês atual → valor principal do card
      if (isMesAtual(dataEntrega, hoje)) {
        somaDentroMes += qtdDentro;
        somaPedidoMes += qtdPedido;
      }

      // Semana atual
      if (
        semanaDaLinha === semanaAtual &&
        dataEntrega.getUTCFullYear() === hoje.getFullYear()
      ) {
        somaDentroSemanaAtual += qtdDentro;
        somaPedidoSemanaAtual += qtdPedido;
      }

      // Semana anterior
      if (
        semanaDaLinha === semanaAnterior &&
        dataEntrega.getUTCFullYear() === hoje.getFullYear()
      ) {
        somaDentroSemanaAnterior += qtdDentro;
        somaPedidoSemanaAnterior += qtdPedido;
      }
    });

    // NS como percentual (0–100)
    const nsMes = somaPedidoMes > 0 ? (somaDentroMes / somaPedidoMes) * 100 : 0;
    const nsSemanaAtual =
      somaPedidoSemanaAtual > 0 ? (somaDentroSemanaAtual / somaPedidoSemanaAtual) * 100 : null;
    const nsSemanaAnterior =
      somaPedidoSemanaAnterior > 0
        ? (somaDentroSemanaAnterior / somaPedidoSemanaAnterior) * 100
        : null;

    let variacaoStr: string;
    let positivo: boolean;

    if (nsSemanaAtual !== null && nsSemanaAnterior !== null) {
      const delta = nsSemanaAtual - nsSemanaAnterior; // diferença em %
      variacaoStr = `${delta > 0 ? '+' : ''}${delta.toFixed(1).replace('.', ',')} %`;
      positivo = delta >= 0;
    } else {
      // Sem dados suficientes para comparar semanas
      variacaoStr = '—';
      positivo = true;
    }

    return {
      nome: empresas_nome[index],
      valor: `${nsMes.toFixed(1).replace('.', ',')}%`,
      variacao: variacaoStr,
      positivo,
      constante: ' em relação à semana anterior',
    };
  });
}