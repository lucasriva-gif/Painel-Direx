import Navbar from '@/components/home/Navbar'
import Hero from '@/components/home/Hero'
import ResumoCard from '@/components/home/ResumoCard'

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <main>
        {/* seções */}
        <Hero />     
        <ResumoCard />                                   

        <section id="nivel-servico" className="min-h-screen bg-gray-100">
          <p className="p-10">Nível de Serviço aqui</p>
        </section>
        <section id="produtividade" className="min-h-screen bg-gray-50">
          <p className="p-10">Produtividade aqui</p>
        </section>
      </main>
    </div>
  )
}
