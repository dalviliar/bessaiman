import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import { CartProvider } from '@/context/CartContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'

export const metadata: Metadata = {
  title: {
    default: 'Bes Saiman Group — Лабораторное оборудование Казахстан',
    template: '%s — Bes Saiman Group',
  },
  description: 'Поставки высокотемпературных печей, шаровых мельниц, вакуумных камер и лабораторного оборудования в Казахстане. Алматы.',
  keywords: 'лабораторное оборудование, муфельные печи, трубчатые печи, шаровые мельницы, электроспиннинг, Казахстан, Алматы, Bes Saiman',
  metadataBase: new URL('https://bes-saiman.kz'),
  openGraph: {
    siteName: 'Bes Saiman Group',
    locale: 'ru_RU',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-steel-dark text-text-primary min-h-screen flex flex-col">
        <LanguageProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppFloat />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
