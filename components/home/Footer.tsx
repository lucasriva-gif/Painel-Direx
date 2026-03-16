import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0086FF] py-6 px-6 md:px-16 lg:px-24 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Lado Esquerdo: Logo do Magalog */}
        <div className="flex-shrink-0 flex items-center h-full">
          <img 
            src="/images/magalog-logo-white.svg" 
            alt="Logo Magalog" 
            className="h-[18px] w-auto object-contain"
          />
        </div>

        {/* Lado Direito: Texto de Copyright */}
        <div className="text-white text-sm md:text-[14px] font-normal tracking-wide text-center md:text-right">
          <p>
            Copyright © <span className="font-bold">Magalog</span> — Todos os direitos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;