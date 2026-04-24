import Image from 'next/image'

export default function Hero() {
  return (
    <section
      id="inicio"
      className="scroll-mt-16 w-full overflow-hidden"
      style={{
        height: '200px',
        background: 'linear-gradient(to bottom left, #cefdff, #ffffff 40%)',
      }}
    >
      {/* Usa o mesmo wrapper que o restante da página usa abaixo do Hero.
          Ajuste maxWidth e padding para bater exatamente com o layout abaixo. */}
      <div
        className="mx-auto h-full flex items-center justify-between"
        style={{ maxWidth: '68rem', padding: '0 1.5rem' }}
      >
        {/* Texto centralizado verticalmente */}
        <h1 className="text-5xl font-bold text-[#0086FF] leading-tight">
          Indicadores Diretoria
        </h1>

        {/* Ilustração encostada na base, dentro do container */}
        <div className="flex-shrink-0 self-end">
          <Image
            src="/images/hero-illustration.png"
            alt="Ilustração painel Magalog"
            width={940}
            height={668}
            priority
            className="object-contain h-[185px] w-auto"
          />
        </div>
      </div>
    </section>
  )
}