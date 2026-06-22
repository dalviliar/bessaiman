import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Свяжитесь с Bes Saiman Group — Алматы, Казахстан. Телефон, WhatsApp, email. Оставьте заявку и мы ответим в течение дня.',
  openGraph: {
    title: 'Контакты — Bes Saiman Group',
    description: 'Свяжитесь с нами в Алматы. Телефон, WhatsApp, email.',
    url: 'https://bes-saiman.kz/contacts',
  },
}

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
