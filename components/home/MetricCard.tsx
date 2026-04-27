interface MetricCardProps {
  valor: string
  nome: string
  variacao: string
  positivo: boolean
  constante: string
  corFarol?: 'roxo' | 'vermelho' | 'verde' | 'azul' | 'default'
}

export default function MetricCard({ valor, nome, variacao, positivo, constante, corFarol = 'default' }: MetricCardProps) {
  // Dicionário de estilos para o farol das metas
  const estilosFarol = {
    roxo: { border: 'border-purple-600', text: 'text-purple-600' },
    vermelho: { border: 'border-red-500', text: 'text-red-500' },
    verde: { border: 'border-green-500', text: 'text-green-500' },
    azul: { border: 'border-blue-500', text: 'text-blue-500' },
    default: { border: 'border-gray-400', text: 'text-[#000000]' },
  };

  const corSelecionada = estilosFarol[corFarol] || estilosFarol.default;

  return (
    // Substituímos a borda fixa pelas propriedades do dicionário
    <div className={`bg-white border rounded-xl p-6 ${corSelecionada.border}`}>
      {/* Substituímos o text-[#000000] pelas propriedades do dicionário */}
      <p className={`text-4xl font-medium mb-1 ${corSelecionada.text}`}>{valor}</p>
      
      <p className="text-sm text-[#788089] mb-2">{nome}</p>
      
      <p className="text-[0.6rem] font-medium">
        <span className={positivo ? 'text-green-600' : 'text-red-500'}>{variacao}</span>
        <span className="text-[#788089]">{constante}</span>
      </p>
    </div>
  )
}
