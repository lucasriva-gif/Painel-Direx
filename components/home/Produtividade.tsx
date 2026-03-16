import MetricCard from './MetricCardProd'
import DashCard from './DashCardProd'

const metricas = [
  { valor: '98,7%', nome: 'Nome do índice', variacao: '+0,3%', positivo: true, constante: " em relação à semana anterior"},
  { valor: '98,7%', nome: 'Nome do índice', variacao: '-0,3%', positivo: false, constante: " em relação à semana anterior"},
  { valor: '98,7%', nome: 'Nome do índice', variacao: '+0,3%', positivo: true, constante: " em relação à semana anterior"},
  { valor: '98,7%', nome: 'Nome do índice', variacao: '+0,3%', positivo: true, constante: " em relação à semana anterior"},
]

const dashboards = [
  { nome: 'Carteira CDs', descricao: 'Descrição em 1 linha', href: 'https://lookerstudio.google.com/u/0/reporting/767e51a9-f613-4f6d-9eb5-20ee385d5c5d/page/p_x8qfw2rvmd', icone: '/images/icones/dash-2.svg' },
  { nome: 'Aderência PMT CDs', descricao: 'Descrição em 1 linha', href: 'https://bi.luizalabs.com/#/site/rede/views/AcompanhamentoEntradasRealTime/CockPit_CDs_CurrentDate?:iid=1', icone: '/images/icones/dash-1.jpg' },
  { nome: 'Avaria Transporte', descricao: '(Acesse PPT ou Dash)', href: 'https://google.com/', icone: '/images/icones/dash-1.jpg' },
]

export default function Produtividade() {
  return (
    <section
      id="produtividade"
      className="scroll-mt-14 w-full px-6 py-10 border-1 border-[#CECFD1]"
      style={{
        background: 'linear-gradient(135deg, #e9f5ff 0%, #ffffff 50%, #e9f5ff 100%)'
      }}
    >
      <div className="max-w-5xl mx-auto">

        {/* Cabeçalho */}
        <h2 className="text-2xl font-bold text-[#0086FF] mb-1">Produtividade</h2>
        <p className="text-sm text-[#788089] mb-8">
          Atualizado segunda-feira, 9 de março de 2025
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
