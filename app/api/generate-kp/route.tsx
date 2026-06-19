import React from 'react'
import path from 'path'
import { readFileSync, statSync } from 'fs'
import { NextResponse } from 'next/server'
import { renderToBuffer, Font, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const C = {
  primary:      '#1A4A8A',
  primaryDark:  '#0A1E3A',
  primaryLight: '#EBF2FB',
  accent:       '#0284C7',
  text:         '#1C2833',
  gray:         '#5D6D7E',
  lightGray:    '#F5F7FA',
  border:       '#D0DFF0',
  white:        '#FFFFFF',
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 9,
    color: C.text,
    paddingTop: 32,
    paddingBottom: 56,
    paddingHorizontal: 40,
    backgroundColor: C.white,
  },

  // ── Header ──
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logoBox: {
    width: 52, height: 52,
    backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 4,
    marginRight: 14,
  },
  logoText: { fontSize: 18, fontWeight: 'bold', color: C.white },
  logoSub:  { fontSize: 5, color: 'rgba(255,255,255,0.7)', letterSpacing: 2 },
  headerInfo: { flex: 1 },
  companyName:    { fontSize: 13, fontWeight: 'bold', color: C.primary, marginBottom: 2 },
  companyTagline: { fontSize: 7.5, color: C.gray, marginBottom: 2 },
  companyContact: { fontSize: 7, color: C.gray },

  // ── Dividers ──
  dividerBlue: { height: 2, backgroundColor: C.primary, marginVertical: 10 },
  dividerThin: { height: 0.5, backgroundColor: C.border, marginVertical: 8 },

  // ── Title banner ──
  titleBanner: {
    backgroundColor: C.primary,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleMain: { fontSize: 12, fontWeight: 'bold', color: C.white, letterSpacing: 0.5 },
  titleNum:  { fontSize: 8, color: 'rgba(255,255,255,0.7)' },

  // ── Parties ──
  parties: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  partyBox: {
    flex: 1,
    backgroundColor: C.lightGray,
    padding: 9,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    borderRadius: 2,
  },
  partyLabel: { fontSize: 6.5, fontWeight: 'bold', color: C.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  partyName:   { fontSize: 9, fontWeight: 'bold', color: C.primaryDark, marginBottom: 2 },
  partyDetail: { fontSize: 7.5, color: C.gray, marginBottom: 1.5 },

  // ── Section title ──
  sectionTitle: {
    fontSize: 7.5, fontWeight: 'bold', color: C.primary,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 4, marginTop: 6,
  },

  // ── Product table ──
  tableWrap: { marginBottom: 10, borderWidth: 0.5, borderColor: C.border },
  tableHead: { flexDirection: 'row', backgroundColor: C.primary, paddingVertical: 5, paddingHorizontal: 6 },
  tableRow:  { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: C.border },
  tableRowAlt: { backgroundColor: C.lightGray },
  tableTotalRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 6, backgroundColor: C.primaryLight, borderTopWidth: 1, borderTopColor: C.primary },

  thN:     { width: 16, fontSize: 7, fontWeight: 'bold', color: C.white },
  thName:  { flex: 3,   fontSize: 7, fontWeight: 'bold', color: C.white },
  thModel: { flex: 1.2, fontSize: 7, fontWeight: 'bold', color: C.white },
  thQty:   { width: 30, fontSize: 7, fontWeight: 'bold', color: C.white, textAlign: 'center' },
  thUnit:  { width: 26, fontSize: 7, fontWeight: 'bold', color: C.white, textAlign: 'center' },
  thPrice: { width: 78, fontSize: 7, fontWeight: 'bold', color: C.white, textAlign: 'right' },

  tdN:     { width: 16, fontSize: 8, color: C.gray },
  tdName:  { flex: 3,   fontSize: 8, fontWeight: 'bold', color: C.primaryDark },
  tdModel: { flex: 1.2, fontSize: 7.5, color: C.gray },
  tdQty:   { width: 30, fontSize: 8, textAlign: 'center', color: C.text },
  tdUnit:  { width: 26, fontSize: 8, textAlign: 'center', color: C.gray },
  tdPrice: { width: 78, fontSize: 8, fontWeight: 'bold', textAlign: 'right', color: C.primary },
  tdTotalLabel: { flex: 1, fontSize: 8.5, fontWeight: 'bold', color: C.primaryDark },
  tdTotalValue: { width: 78, fontSize: 8.5, fontWeight: 'bold', textAlign: 'right', color: C.primary },

  // ── Description ──
  descSection: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  descText:    { flex: 1 },
  descLine:    { fontSize: 8, color: C.text, marginBottom: 2, lineHeight: 1.4 },
  descHeading: { fontSize: 8.5, fontWeight: 'bold', color: C.primaryDark, marginBottom: 2, marginTop: 4 },
  descProductImg: { width: 110, height: 110, objectFit: 'contain', borderWidth: 0.5, borderColor: C.border, borderRadius: 2 },

  // ── Specs ──
  specsBox:    { borderWidth: 0.5, borderColor: C.border, marginBottom: 8 },
  specRow:     { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: C.border },
  specRowLast: { borderBottomWidth: 0 },
  specRowAlt:  { backgroundColor: C.lightGray },
  specKey: { width: '44%', fontSize: 7.5, color: C.gray },
  specVal: { flex: 1, fontSize: 8, fontWeight: 'bold', color: C.primaryDark },

  // ── Conditions ──
  condRow:    { flexDirection: 'row', marginBottom: 3.5, alignItems: 'flex-start' },
  condBullet: { width: 10, fontSize: 8, color: C.primary },
  condLabel:  { width: 130, fontSize: 7.5, color: C.gray },
  condValue:  { flex: 1, fontSize: 7.5, fontWeight: 'bold', color: C.primaryDark },

  // ── Bank ──
  bankBox: {
    backgroundColor: C.primaryLight,
    borderWidth: 0.5, borderColor: C.border,
    padding: 9, marginBottom: 10,
    borderRadius: 2,
  },
  bankTitle: { fontSize: 7, fontWeight: 'bold', color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  bankGrid:  { flexDirection: 'row', flexWrap: 'wrap' },
  bankRow:   { width: '50%', flexDirection: 'row', marginBottom: 3 },
  bankLabel: { width: 68, fontSize: 7, color: C.gray },
  bankValue: { flex: 1, fontSize: 7.5, fontWeight: 'bold', color: C.primaryDark },

  // ── Signature ──
  sigSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 },
  sigBox:  { flex: 1 },
  sigRole: { fontSize: 7.5, color: C.gray, marginBottom: 3 },
  sigOrg:  { fontSize: 8, fontWeight: 'bold', color: C.primaryDark, marginBottom: 18 },
  sigLine: { borderBottomWidth: 0.5, borderBottomColor: '#888', marginBottom: 4, marginRight: 60 },
  sigName: { fontSize: 8.5, fontWeight: 'bold', color: C.primaryDark },
  sigDate: { fontSize: 7, color: C.gray, marginTop: 2 },
  stampBox: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center' },

  // ── Watermark ──
  watermarkWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkText: {
    fontSize: 52,
    fontWeight: 'bold',
    color: 'rgba(26,74,138,0.05)',
    transform: 'rotate(-45deg)',
    letterSpacing: 3,
  },

  // ── Footer ──
  footer: {
    position: 'absolute', bottom: 18, left: 40, right: 40,
    borderTopWidth: 0.5, borderTopColor: C.border,
    paddingTop: 5,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  footerText: { fontSize: 6, color: '#999' },
})

interface ClientInfo {
  name: string
  company?: string
  phone?: string
  email?: string
  quantity: number
  note?: string
}

interface ProductData {
  id?: string
  name_ru: string
  name_kk?: string
  name_en?: string
  description_ru?: string
  description_kk?: string
  description_en?: string
  model?: string
  specs?: Record<string, string>
  price?: number
  slug: string
  availability?: string
  images?: string[]
}

function getConditions(availability?: string): [string, string][] {
  const inStock = availability === 'in_stock'
  return [
    ['Срок поставки:',   inStock ? 'Товар в наличии на складе — отгрузка в течение 1–3 рабочих дней' : 'По согласованию, в зависимости от наличия на складе'],
    ['Гарантия:',        '12 месяцев с момента поставки'],
    ['Условия оплаты:',  inStock ? 'Оплата 100% по факту выставления счёта' : 'Предоплата 50%, остаток — по факту готовности товара'],
    ['Действие КП:',     '30 календарных дней с даты выставления'],
  ]
}

const BANK_ROWS = [
  ['Наименование:', 'ТОО «Bes Saiman Group»'],
  ['БИН:',         '210440034775'],
  ['Банк:',        'АО «Банк ЦентрКредит»'],
  ['БИК:',         'KCJBKZKX'],
  ['КБЕ:',         '17'],
  ['ИИК (KZT):',   'KZ128562203117832934'],
  ['ИИК (USD):',   'KZ318562203231984520'],
]

function parseDescriptionLines(text: string): { type: 'heading' | 'bullet' | 'text'; content: string }[] {
  return text.split('\n').map(line => {
    const t = line.trim()
    if (!t) return { type: 'text', content: '' }
    if (t.endsWith(':')) return { type: 'heading', content: t }
    if (/^[•*\-]\s/.test(t)) return { type: 'bullet', content: t.replace(/^[•*\-]\s/, '') }
    return { type: 'text', content: t }
  })
}

function KPDocument({
  product, clientInfo, lang, kpNumber, dateStr, stampDataUri, signatureDataUri, productImageDataUri,
}: {
  product: ProductData
  clientInfo: ClientInfo
  lang: string
  kpNumber: string
  dateStr: string
  stampDataUri: string | null
  signatureDataUri: string | null
  productImageDataUri: string | null
}) {
  const productName =
    (lang === 'kk' ? product.name_kk : lang === 'en' ? product.name_en : null) || product.name_ru
  const specs = product.specs ? Object.entries(product.specs).slice(0, 16) : []
  const description =
    (lang === 'kk' ? product.description_kk : lang === 'en' ? product.description_en : null) ||
    product.description_ru
  const descLines = description ? parseDescriptionLines(description) : []

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* WATERMARK */}
        <View style={s.watermarkWrap} fixed>
          <Text style={s.watermarkText}>BES SAIMAN GROUP</Text>
        </View>

        {/* HEADER */}
        <View style={s.header}>
          <View style={s.logoBox}>
            <Text style={s.logoText}>BS</Text>
            <Text style={s.logoSub}>GROUP</Text>
          </View>
          <View style={s.headerInfo}>
            <Text style={s.companyName}>ТОО «Bes Saiman Group»</Text>
            <Text style={s.companyTagline}>Научно-производственная компания</Text>
            <Text style={s.companyContact}>
              +7 (701) 101-34-33  ·  bessaimangroup1@gmail.com  ·  г. Алматы, ул. Тулебаева 38/61
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 7, color: C.gray }}>БИН: 210440034775</Text>
          </View>
        </View>

        <View style={s.dividerBlue} />

        {/* TITLE BANNER */}
        <View style={s.titleBanner}>
          <Text style={s.titleMain}>КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</Text>
          <Text style={s.titleNum}>№ {kpNumber}  |  {dateStr}</Text>
        </View>

        {/* PARTIES */}
        <View style={s.parties}>
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Поставщик</Text>
            <Text style={s.partyName}>ТОО «Bes Saiman Group»</Text>
            <Text style={s.partyDetail}>БИН: 210440034775</Text>
            <Text style={s.partyDetail}>РК, г. Алматы, ул. Тулебаева 38/61</Text>
            <Text style={s.partyDetail}>Тел: +7 (701) 101-34-33</Text>
          </View>
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Покупатель</Text>
            {clientInfo.company ? (
              <>
                <Text style={s.partyName}>{clientInfo.company}</Text>
                <Text style={s.partyDetail}>{clientInfo.name}</Text>
              </>
            ) : (
              <Text style={s.partyName}>{clientInfo.name}</Text>
            )}
            {clientInfo.phone ? <Text style={s.partyDetail}>Тел: {clientInfo.phone}</Text> : null}
            {clientInfo.email ? <Text style={s.partyDetail}>Email: {clientInfo.email}</Text> : null}
          </View>
        </View>

        <View style={s.dividerThin} />

        {/* PRODUCT TABLE */}
        <Text style={s.sectionTitle}>Предмет коммерческого предложения</Text>
        <View style={s.tableWrap}>
          <View style={s.tableHead}>
            <Text style={s.thN}>№</Text>
            <Text style={s.thName}>Наименование товара</Text>
            <Text style={s.thModel}>Модель</Text>
            <Text style={s.thQty}>Кол.</Text>
            <Text style={s.thUnit}>Ед.</Text>
            <Text style={s.thPrice}>Стоимость</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={s.tdN}>1</Text>
            <Text style={s.tdName}>{productName}</Text>
            <Text style={s.tdModel}>{product.model || '—'}</Text>
            <Text style={s.tdQty}>{clientInfo.quantity}</Text>
            <Text style={s.tdUnit}>шт.</Text>
            <Text style={s.tdPrice}>
              {product.price
                ? `${(product.price * clientInfo.quantity).toLocaleString('ru-RU')} T`
                : 'По запросу'}
            </Text>
          </View>
          <View style={s.tableTotalRow}>
            <Text style={s.tdTotalLabel}>ИТОГО (с НДС 16%):</Text>
            <Text style={s.tdTotalValue}>
              {product.price
                ? `${(product.price * clientInfo.quantity).toLocaleString('ru-RU')} T`
                : 'По запросу'}
            </Text>
          </View>
          {product.price && (
            <View style={{ flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 6, backgroundColor: C.lightGray }}>
              <Text style={{ flex: 1, fontSize: 7, color: C.gray }}>в т.ч. НДС (16%):</Text>
              <Text style={{ width: 78, fontSize: 7, color: C.gray, textAlign: 'right' }}>
                {`${Math.round(product.price * clientInfo.quantity * 16 / 116).toLocaleString('ru-RU')} T`}
              </Text>
            </View>
          )}
        </View>

        {/* DESCRIPTION + PRODUCT IMAGE */}
        {(descLines.length > 0 || productImageDataUri) && (
          <>
            <Text style={s.sectionTitle}>Описание товара</Text>
            <View style={s.descSection}>
              {descLines.length > 0 && (
                <View style={s.descText}>
                  {descLines.map((line, i) => {
                    if (!line.content) return <View key={i} style={{ height: 3 }} />
                    if (line.type === 'heading') return <Text key={i} style={s.descHeading}>{line.content}</Text>
                    if (line.type === 'bullet') return (
                      <View key={i} style={{ flexDirection: 'row', marginBottom: 1.5 }}>
                        <Text style={{ width: 10, fontSize: 8, color: C.primary }}>•</Text>
                        <Text style={s.descLine}>{line.content}</Text>
                      </View>
                    )
                    return <Text key={i} style={s.descLine}>{line.content}</Text>
                  })}
                </View>
              )}
              {productImageDataUri && (
                <Image src={productImageDataUri} style={s.descProductImg} />
              )}
            </View>
          </>
        )}

        {/* SPECS */}
        {specs.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Технические характеристики</Text>
            <View style={s.specsBox}>
              {specs.map(([key, val], i) => (
                <View key={key} style={[
                  s.specRow,
                  i % 2 === 1 ? s.specRowAlt : {},
                  i === specs.length - 1 ? s.specRowLast : {},
                ]}>
                  <Text style={s.specKey}>{key}</Text>
                  <Text style={s.specVal}>{String(val)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* NOTE */}
        {clientInfo.note ? (
          <>
            <Text style={s.sectionTitle}>Особые условия</Text>
            <Text style={{ fontSize: 8, color: C.text, marginBottom: 8 }}>{clientInfo.note}</Text>
          </>
        ) : null}

        {/* CONDITIONS */}
        <Text style={s.sectionTitle}>Условия поставки</Text>
        <View style={{ marginBottom: 8 }}>
          {getConditions(product.availability).map(([label, value]: [string, string]) => (
            <View key={label} style={s.condRow}>
              <Text style={s.condBullet}>•</Text>
              <Text style={s.condLabel}>{label}</Text>
              <Text style={s.condValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={s.dividerThin} />

        {/* BANK */}
        <View style={s.bankBox}>
          <Text style={s.bankTitle}>Банковские реквизиты</Text>
          <View style={s.bankGrid}>
            {BANK_ROWS.map(([label, value]) => (
              <View key={label} style={s.bankRow}>
                <Text style={s.bankLabel}>{label}</Text>
                <Text style={s.bankValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* SIGNATURE + STAMP */}
        <View style={s.sigSection}>
          <View style={s.sigBox}>
            <Text style={s.sigRole}>Генеральный директор</Text>
            <Text style={s.sigOrg}>ТОО «Bes Saiman Group»</Text>
            {signatureDataUri ? (
              <Image src={signatureDataUri} style={{ width: 90, height: 36, marginBottom: 4 }} />
            ) : (
              <View style={s.sigLine} />
            )}
            <Text style={s.sigName}>Елеуов М.А.</Text>
            <Text style={s.sigDate}>{dateStr}</Text>
          </View>
          {stampDataUri && (
            <View style={s.stampBox}>
              <Image src={stampDataUri} style={{ width: 105, height: 105 }} />
            </View>
          )}
        </View>

        {/* FOOTER */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            ТОО «Bes Saiman Group»  ·  БИН 210440034775  ·  +7 (701) 101-34-33  ·  bessaimangroup1@gmail.com
          </Text>
          <Text style={s.footerText}
            render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>

      </Page>
    </Document>
  )
}

function formatDate(d: Date): string {
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} г.`
}

function generateKPNumber(): string {
  const year = new Date().getFullYear()
  const num = String(Date.now()).slice(-5)
  return `КП-${year}-${num}`
}

let fontsRegistered = false

function ensureFontsRegistered() {
  if (fontsRegistered) return
  const fontsDir = path.join(process.cwd(), 'public', 'fonts')
  Font.register({
    family: 'Roboto',
    fonts: [
      { src: path.join(fontsDir, 'Roboto-Regular.ttf') },
      { src: path.join(fontsDir, 'Roboto-Bold.ttf'), fontWeight: 'bold' },
    ],
  })
  fontsRegistered = true
}

function loadStampDataUri(): string | null {
  try {
    const brandDir = path.join(process.cwd(), 'public', 'brand')
    const pngPath = path.join(brandDir, 'stamp.png')
    try {
      return `data:image/png;base64,${readFileSync(pngPath).toString('base64')}`
    } catch {
      return `data:image/jpeg;base64,${readFileSync(path.join(brandDir, 'stamp.jpg')).toString('base64')}`
    }
  } catch {
    return null
  }
}

function loadSignatureDataUri(): string | null {
  try {
    const sigPath = path.join(process.cwd(), 'public', 'brand', 'signature.jpg')
    return `data:image/jpeg;base64,${readFileSync(sigPath).toString('base64')}`
  } catch {
    return null
  }
}

async function loadProductImageDataUri(imageUrl: string | undefined): Promise<string | null> {
  if (!imageUrl) return null
  try {
    if (imageUrl.startsWith('/')) {
      const filePath = path.join(process.cwd(), 'public', imageUrl)
      if (statSync(filePath).size > 2 * 1024 * 1024) return null
      const ext = path.extname(imageUrl).toLowerCase()
      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
      return `data:${mime};base64,${readFileSync(filePath).toString('base64')}`
    }
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    if (buf.byteLength > 2 * 1024 * 1024) return null
    const mime = res.headers.get('content-type')?.split(';')[0] || 'image/jpeg'
    return `data:${mime};base64,${Buffer.from(buf).toString('base64')}`
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { product, clientInfo, lang = 'ru' } = body as {
      product: ProductData
      clientInfo: ClientInfo
      lang: string
    }

    ensureFontsRegistered()
    const stampDataUri = loadStampDataUri()
    const signatureDataUri = loadSignatureDataUri()
    const productImageDataUri = await loadProductImageDataUri(product.images?.[0])

    const kpNumber = generateKPNumber()
    const dateStr = formatDate(new Date())

    query(
      `INSERT INTO kp_requests (product_id, product_model, product_name, kp_number, client_name, client_company, client_email, client_phone, quantity, note, lang)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [product.id ?? null, product.model ?? null, product.name_ru, kpNumber,
       clientInfo.name, clientInfo.company ?? null, clientInfo.email ?? null,
       clientInfo.phone ?? null, clientInfo.quantity, clientInfo.note ?? null, lang],
    ).catch(err => console.error('kp_requests insert failed:', err))

    const buffer = await renderToBuffer(
      <KPDocument
        product={product}
        clientInfo={clientInfo}
        lang={lang}
        kpNumber={kpNumber}
        dateStr={dateStr}
        stampDataUri={stampDataUri}
        signatureDataUri={signatureDataUri}
        productImageDataUri={productImageDataUri}
      />
    )

    const filename = `КП_BesS_${product.model || product.slug}_${new Date().getFullYear()}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (err) {
    console.error('KP generation error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'PDF generation failed', detail: message }, { status: 500 })
  }
}
