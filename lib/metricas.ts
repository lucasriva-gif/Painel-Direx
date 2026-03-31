// lib/metricas.ts

// 1. Tipagem dos dados brutos vindos da planilha
export type LinhaPlanilha = {
  Empresa: string;
  MODAL: string;
  data_entrega_prevista_cliente: string; // Formato esperado: YYYY-MM-DD ou ISO
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

// Funções auxiliares de data (simplificadas)
const isMesAtual = (data: Date, hoje: Date) => {
  return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
};

const getSemanaDoAno = (data: Date) => {
  const primeiroDiaAno = new Date(data.getFullYear(), 0, 1);
  const diasPassados = Math.floor((data.getTime() - primeiroDiaAno.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((data.getDay() + 1 + diasPassados) / 7);
};

export function processarMetricas(dadosBrutos: LinhaPlanilha[]): MetricaCard[] {
  const empresas = ['3P MAGALU', 'EPOCA', 'NETSHOES', 'SAIDA CD'];
  const hoje = new Date();
  const semanaAtual = getSemanaDoAno(hoje);
  const semanaAnterior = semanaAtual - 1;

  return empresas.map((empresa) => {
    // Filtra apenas os dados da empresa atual do loop
    const dadosEmpresa = dadosBrutos.filter((linha) => linha.Empresa === empresa);

    // Variáveis para acumular as somas
    let somaDentroMes = 0;
    let somaPedidoMes = 0;
    
    let somaDentroSemanaAtual = 0;
    let somaPedidoSemanaAtual = 0;
    
    let somaDentroSemanaAnterior = 0;
    let somaPedidoSemanaAnterior = 0;

    // Itera sobre as linhas para somar os valores de acordo com o período
    dadosEmpresa.forEach((linha) => {
      const dataEntrega = new Date(linha.data_entrega_prevista_cliente);
      const qtdDentro = Number(linha['sum Qtd Dentro']) || 0;
      const qtdPedido = Number(linha['sum Qtd Pedido']) || 0;
      const semanaDaLinha = getSemanaDoAno(dataEntrega);

      // Agregação do Mês Atual (para o valor principal)
      if (isMesAtual(dataEntrega, hoje)) {
        somaDentroMes += qtdDentro;
        somaPedidoMes += qtdPedido;
      }

      // Agregação da Semana Atual
      if (semanaDaLinha === semanaAtual && dataEntrega.getFullYear() === hoje.getFullYear()) {
        somaDentroSemanaAtual += qtdDentro;
        somaPedidoSemanaAtual += qtdPedido;
      }

      // Agregação da Semana Anterior
      if (semanaDaLinha === semanaAnterior && dataEntrega.getFullYear() === hoje.getFullYear()) {
        somaDentroSemanaAnterior += qtdDentro;
        somaPedidoSemanaAnterior += qtdPedido;
      }
    });

    // Cálculos finais de porcentagem (evitando divisão por zero)
    const valorMes = somaPedidoMes > 0 ? somaDentroMes / somaPedidoMes : 0;
    const valorSemanaAtual = somaPedidoSemanaAtual > 0 ? somaDentroSemanaAtual / somaPedidoSemanaAtual : 0;
    const valorSemanaAnterior = somaPedidoSemanaAnterior > 0 ? somaDentroSemanaAnterior / somaPedidoSemanaAnterior : 0;

    // Variação percentual entre semanas
    const variacaoCalculada = (valorSemanaAtual - valorSemanaAnterior) * 100;

    return {
      nome: empresa,
      valor: `${(valorMes * 100).toFixed(1).replace('.', ',')}%`,
      variacao: `${variacaoCalculada > 0 ? '+' : ''}${variacaoCalculada.toFixed(1).replace('.', ',')}%`,
      positivo: variacaoCalculada >= 0,
      constante: " em relação à semana anterior",
    };
  });
}