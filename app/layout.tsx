import type { Metadata } from "next";
import localFont from 'next/font/local';
import 'katex/dist/katex.min.css';
import "./globals.css";

const magaluFont = localFont({
  src: [
    {
      path: '../public/fonts/MagaluUIText-Regular.ttf',  
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/MagaluUIText-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/MagaluUIText-Bold.ttf', 
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-magalu',
})

export const metadata: Metadata = {
  title: "Painel Executivo",
  description: "Created by Squad Dados - Magalog",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="pt-BR" className={magaluFont.variable}>
      <body className="font-[family-name:var(--font-magalu)]">
        {children}
      </body>
    </html>
  )
}
