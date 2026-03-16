'use client'

import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">

      {/* CAMADA 1: Vídeo de fundo em loop */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/login-bg.mp4" type="video/mp4" />
      </video>

      {/* CAMADA 2: Overlay escuro para contraste */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* CAMADA 3: Card de login */}
      <div className="relative z-20 bg-white rounded-2xl shadow-xl px-10 py-12 w-full max-w-xs text-center">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/images/magalog-logo.svg" alt="MagaLog" className="h-8" />
        </div>

        {/* Título */}
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          Acesse sua conta
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Centralize a gestão da sua operação com o Magalog.
        </p>

        {/* Botão Google */}
        <button
          onClick={() => router.push('/home')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Entrar com Google
        </button>

        {/* Termos */}
        <p className="text-xs text-gray-400 mt-6 leading-relaxed">
          Ao continuar, você concorda com os{' '} <br />
          <a href="#" className="text-blue-500 hover:underline">Termos de Uso</a>
          {' '}e a{' '}
          <a href="#" className="text-blue-500 hover:underline">Política de <br /> Privacidade</a>.
        </p>

      </div>
    </div>
  )
}
