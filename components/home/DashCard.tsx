import Image from 'next/image'

interface DashCardProps {
  nome: string
  descricao: string
  href: string
  icone: string
}

export default function DashCard({ nome, descricao, href, icone }: DashCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 bg-white border border-[#CECFD1] rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
    >
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
        <Image
          src={icone}
          alt={nome}
          width={32}
          height={32}
          className="object-contain"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{nome}</p>
        <p className="text-xs text-gray-400">{descricao}</p>
      </div>
    </a>
  )
}
