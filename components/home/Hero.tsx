import Image from 'next/image'

export default function Hero() {
  return (
    <section
      id="inicio"
      className="scroll-mt-16 relative w-full overflow-visible"
      style={{
        height: '200px',
        background: 'linear-gradient(to bottom left, #cefdff, #ffffff 40%)',
      }}
    >
      {/* Texto — lado esquerdo */}
      <div className="absolute left-[12%] top-1/2 -translate-y-1/2 max-w-xl z-10">
        <h1 className="text-5xl font-bold text-[#0086FF] leading-tight mb-6">
          Indicadores Diretoria
        </h1>
      </div>

      {/* Ilustração — ancorada na base da section */}
      <div className="absolute bottom-0 right-[12%] z-10">
        <Image
          src="/images/hero-illustration.png"
          alt="Ilustração painel Magalog"
          width={940}
          height={668}
          priority
          className="object-contain h-[170px] w-auto"
        />
      </div>

    </section>
  )
}
