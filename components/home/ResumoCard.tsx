'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const RESUMO_TEXTO = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel arcu mattis, tempor ex sed, fringilla risus. Vivamus elementum, sapien a interdum sagittis, arcu purus iaculis elit, vel efficitur lacus massa eget risus.
Vivamus id leo et tortor gravida facilisis vel sed libero. Mauris aliquet est dapibus, tincidunt risus eget, sollicitudin felis. Morbi at pellentesque eros. Aenean ac nisl dapibus, tincidunt arcu vitae, molestie diam.
Quisque ultrices, velit eu vehicula ullamcorper, sem purus porttitor ipsum, vitae tristique felis lectus commodo enim. Proin ac ligula hendrerit, consequat tortor eu, ultrices tellus.`

function getDataAtual() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ResumoCard() {
  const [expandido, setExpandido] = useState(false)

  return (
    <section id="resumo" style={{ backgroundColor: '#0086FF' }} className="scroll-mt-14 w-full pt-28 pb-0">
      <div className="w-full max-w-3xl mx-auto px-6">
        <div className="bg-white rounded-t-2xl shadow-lg p-10">

          {/* Título e data */}
          <h2 className="text-2xl font-bold text-[#0086FF] mb-1">Resumo</h2>
          <p className="text-sm text-[#788089] mb-6 capitalize">
            Atualizado {getDataAtual()}
          </p>

          {/* Texto — truncado ou expandido */}
          <div className="relative">
          <div
            className={`text-[#424A52] text-base leading-relaxed whitespace-pre-line transition-all duration-300 overflow-hidden ${
            expandido ? 'max-h-[1000px]' : 'max-h-[96px]'
            }`}
          >
            {RESUMO_TEXTO}
          </div>

          {/* Gradiente de fade — só aparece quando recolhido */}
          {!expandido && (
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
          </div>

          {/* Botão expandir/recolher */}
          <button
            onClick={() => setExpandido(!expandido)}
            className="mt-6 flex items-center gap-1 text-sm text-[#0086FF] hover:text-[#0086FF] font-medium transition-colors"
          >
            {expandido ? (
              <>
                <ChevronUp size={16} />
                Recolher resumo
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Expandir resumo
              </>
            )}
          </button>

        </div>
      </div>
    </section>
  )
}
