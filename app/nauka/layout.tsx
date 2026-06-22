import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Наука и инновации',
  description: 'Bes Saiman Group — электроспиннинг, наноматериалы, зелёный водород, лабораторное термооборудование. Сотрудничество с университетами Казахстана.',
  openGraph: {
    title: 'Наука и инновации — Bes Saiman Group',
    description: 'Электроспиннинг, наноматериалы, зелёный водород и научные партнёрства в Казахстане.',
    url: 'https://bes-saiman.kz/nauka',
  },
}

export default function NaukaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
