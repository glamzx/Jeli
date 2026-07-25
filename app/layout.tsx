import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jeli — AI-платформа инфлюенс-маркетинга в Казахстане',
  description: 'Реклама через инфлюенсеров — без хаоса и посредников. Умный AI-мэтчинг бизнеса и блогеров, безопасность через escrow.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
