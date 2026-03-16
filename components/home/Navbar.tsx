'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const navLinks = [
  { label: 'Início',           href: '#inicio'         },
  { label: 'Relatório',        href: '#resumo'         },
  { label: 'Nível de Serviço', href: '#nivel-servico'  },
  { label: 'Produtividade',    href: '#produtividade'  },
]

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('inicio')

  // Detecta qual seção está visível e marca o link ativo
  useEffect(() => {
    const sections = navLinks.map(link => link.href.replace('#', ''))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-50% 0px -50% 0px' }
    )

    sections.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault()
    const target = document.getElementById(href.replace('#', ''))
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">

      {/* Conteúdo da navbar */}
      <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">

        {/* Logo */}
        <Image
          src="/images/magalog-logo-blue.svg"
          alt="MagaLog"
          width={132}
          height={35.2}
          priority
        />

        {/* Links de navegação */}
        <ul className="flex items-center gap-8 h-full">
          {navLinks.map(link => {
            const isActive = activeSection === link.href.replace('#', '')
            return (
            <li key={link.href} className="relative flex items-center h-full py-3">
                <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'text-[#788089]' : 'text-[#788089] hover:text-blue-600'
                }`}
                >
                {link.label}
                </a>

                {/* Barra azul embaixo */}
                {isActive && (
                <span className="absolute bottom-0 -left-4 w-[calc(100%+2rem)] h-1 bg-blue-600" />
                )}
            </li>
            )
          })}

          {/* Botão Sair */}
          <li>
            <a
              href="/login"
              className="text-sm font-medium text-[#788089] hover:text-red-500 transition-colors duration-200"
            >
              Sair
            </a>
          </li>
        </ul>

      </nav>
            {/* Barra colorida abaixo */}
      <div
        className="h-0.5 w-full"
        style={{
          background: 'linear-gradient(to right, #fee164, #fa5a72, #b744e2, #2396fe,  #1ce0f4, #1bc250)'
        }}
      />

    </header>
  )
}
