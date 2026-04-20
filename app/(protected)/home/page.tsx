import Navbar from '@/components/home/Navbar'
import Hero from '@/components/home/Hero'
import ResumoCard from '@/components/home/ResumoCard'
import NivelServico from '@/components/home/NivelServico'
import Produtividade from '@/components/home/Produtividade'
import Footer from '@/components/home/Footer'
import ChatBot from '@/components/home/ChatBot'

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <main>
        {/* seções */}
        <Hero />                                       
        <NivelServico />
        <Produtividade />
        <ResumoCard />       
      </main>
      <ChatBot />
      <Footer />
    </div>
  )
}
