import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Каталог оборудования',
  description: 'Муфельные и трубчатые печи, шаровые мельницы, установки электроспиннинга, вакуумные камеры, лабораторная мебель. Поставки по Казахстану.',
  openGraph: {
    title: 'Каталог — Bes Saiman Group',
    description: 'Высокотемпературные печи, шаровые мельницы и лабораторное оборудование. Поставки по Казахстану.',
    url: 'https://bes-saiman.kz/catalog',
  },
}

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
