interface MetricCardProps {
  valor: string
  nome: string
  variacao: string
  positivo: boolean
  constante: string
}

export default function MetricCard({ valor, nome, variacao, positivo, constante }: MetricCardProps) {
  return (
    <div className="bg-white border border-[#CECFD1] rounded-xl p-6">
      <p className="text-4xl font-medium text-[#000000] mb-1">{valor}</p>
      <p className="text-sm text-[#788089] mb-2">{nome}</p>
      <p className="text-[0.6rem] font-medium">
        <span className={positivo ? 'text-green-600' : 'text-red-500'}>{variacao}</span>
        <span className="text-[#788089]">{constante}</span>
      </p>
    </div>
  )
}
