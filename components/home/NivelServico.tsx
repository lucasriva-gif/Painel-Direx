import MetricCard from './MetricCard'
import DashCard from './DashCard'
import { processarMetricas } from '@/lib/metricas'
import { fetchDadosPlanilha, fetchUltimaAtualizacaoPlanilha } from '@/lib/googleSheets' 

const dashboards = [
  { nome: 'Qualidade Operações Leves', descricao: 'Descrição em 1 linha', href: 'https://bi.luizalabs.com/#/site/rede/views/Psvenda-PerfomanceQualidadeGFL/PerformanceResumo?:iid=1', icone: '/images/icones/dash-1.jpg' },
  { nome: 'Cliente Retira Loja', descricao: 'Descrição em 1 linha', href: 'https://bi.luizalabs.com/#/site/rede/views/PsVenda-NveldeServioRetiraLoja/Geral?:iid=1', icone: '/images/icones/dash-1.jpg' },
  { nome: '3P Magalu Entregas', descricao: 'Descrição em 1 linha', href: 'https://bi.luizalabs.com/#/site/rede/views/NveldeServio3P-MagaluEntregaseRetiraLoja/NveldeServio3P-Geral?:iid=1', icone: '/images/icones/dash-1.jpg' },
  { nome: 'CD - 1P + 3P Full', descricao: 'Descrição em 1 linha', href: 'https://bi.luizalabs.com/#/site/rede/views/NS_CD/NivelServioCD?:iid=1', icone: '/images/icones/dash-1.jpg' },
  { nome: 'Ship From Store', descricao: 'Descrição em 1 linha', href: 'https://bi.luizalabs.com/#/site/rede/views/NveldeServio-ShipFromStore/NveldeServioSFS?:iid=2', icone: '/images/icones/dash-1.jpg' },
  { nome: 'Época 1P', descricao: 'Descrição em 1 linha', href: 'https://bi.luizalabs.com/#/site/rede/views/PsVendas-NveldeServiopoca1P/EpocaGeral?:iid=2 Pós Venda - Nível de Serviço HUB GFL -', icone: '/images/icones/dash-1.jpg' },
  { nome: 'Netshoes 1P', descricao: 'Descrição em 1 linha', href: 'https://bi.luizalabs.com/#/site/rede/views/NveldeServio-Netshoes/NveldeServio-Netshoes?:iid=3', icone: '/images/icones/dash-1.jpg' },
  { nome: '1P Saída CD Entrega a Domicílio', descricao: 'Descrição em 1 linha', href: 'https://bi.luizalabs.com/#/site/rede/views/NveldeservioDEZ2023-PILOTO/PerformanceGeral?:iid=2', icone: '/images/icones/dash-1.jpg' },
  { nome: 'Consta Entregue', descricao: '(Acesse PPT ou Dash)', href: 'https://docs.google.com/presentation/d/1PJbPKD39CybxiL9TJF68B92fh4pwFCmirkpkPqfozI8/edit?slide=id.g3af52249f21_2_31#slide=id.g3af52249f21_2_31', icone: '/images/icones/dash-3.svg' },
]

export default async function NivelServico() {
  // 1. Busca os dados reais e transformados em objetos
  const dadosBrutos = await fetchDadosPlanilha();
  const dataAtualizacaoFormatada = await fetchUltimaAtualizacaoPlanilha(dadosBrutos);
  // 2. Passa os dados brutos pela regra de negócio (cálculos de porcentagem e variação)
  const metricas = processarMetricas(dadosBrutos);

  return (
    <section id="nivel-servico" className="scroll-mt-14 w-full px-6 py-10 border-1 border-[#CECFD1]" style={{ background: 'linear-gradient(to top right, #e9f5ff, #ffffff 80%)' }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-[#0086FF] mb-1">Nível de serviço</h2>
        <p className="text-sm text-[#788089] mb-8 capitalize">
          Atualizado {dataAtualizacaoFormatada}
        </p>

        {/* Cards de métricas — linha 1: 3 cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {metricas.slice(0, 2).map((m, i) => (
            <MetricCard key={i} {...m} />
          ))}
        </div>

        {/* Cards de métricas — linha 2: 2 cards */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {metricas.slice(2, 4).map((m, i) => (
            <MetricCard key={i} {...m} />
          ))}
        </div>

        {/* DashCards — grade 3 colunas */}
        <div className="grid grid-cols-3 gap-4">
          {dashboards.map((d, i) => (
            <DashCard key={i} {...d} />
          ))}
        </div>

      </div>
    </section>
  )
}
