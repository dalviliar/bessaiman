import type { Metadata } from 'next'
import { queryOne } from '@/lib/db'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const product = await queryOne<{
    name_ru: string
    description_ru: string | null
    images: string[] | null
    model: string | null
  }>(
    `SELECT name_ru, description_ru, images, model FROM products WHERE slug = $1`,
    [slug],
  ).catch(() => null)

  if (!product) {
    return { title: 'Товар не найден — Bes Saiman Group' }
  }

  const title = product.model
    ? `${product.name_ru} (${product.model}) — Bes Saiman Group`
    : `${product.name_ru} — Bes Saiman Group`

  const raw = product.description_ru ?? ''
  const desc = raw.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) ||
    'Лабораторное и промышленное оборудование от Bes Saiman Group — поставки по Казахстану'

  const imageUrl = product.images?.[0]
    ? `https://bes-saiman.kz${product.images[0]}`
    : 'https://bes-saiman.kz/og-default.jpg'

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `https://bes-saiman.kz/catalog/${slug}`,
      siteName: 'Bes Saiman Group',
      images: [{ url: imageUrl, width: 800, height: 800, alt: product.name_ru }],
      type: 'website',
      locale: 'ru_RU',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [imageUrl],
    },
  }
}

export default function ProductSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
