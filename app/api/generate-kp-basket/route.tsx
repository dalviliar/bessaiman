import React from 'react'
import path from 'path'
import { readFileSync } from 'fs'
import { NextResponse } from 'next/server'
import { renderToBuffer, Font, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const C = {
  primary:      '#1A4A8A',
  primaryDark:  '#0A1E3A',
  primaryLight: '#EBF2FB',
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

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logoBox: { width: 52, height: 52, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginRight: 14 },
  logoMain: { fontSize: 18, fontWeight: 'bold', color: C.white },
  logoSub:  { fontSize: 5, color: 'rgba(255,255,255,0.7)', letterSpacing: 2 },
  headerInfo: { flex: 1 },
  companyName:    { fontSize: 13, fontWeight: 'bold', color: C.primary, marginBottom: 2 },
  companyTagline: { fontSize: 7.5, color: C.gray, marginBottom: 2 },
  companyContact: { fontSize: 7, color: C.gray },

  dividerBlue: { height: 2, backgroundColor: C.primary, marginVertical: 10 },
  dividerThin: { height: 0.5, backgroundColor: C.border, marginVertical: 8 },

  titleBanner: {
    backgroundColor: C.primary,
    paddingVertical: 9, paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  titleMain: { fontSize: 12, fontWeight: 'bold', color: C.white, letterSpacing: 0.5 },
  titleNum:  { fontSize: 8, color: 'rgba(255,255,255,0.7)' },

  parties: { flexDirection: 'row', marginBottom: 10 },
  partyBox: {
    flex: 1, backgroundColor: C.lightGray, padding: 9,
    borderLeftWidth: 3, borderLeftColor: C.primary, borderRadius: 2, marginRight: 8,
  },
  partyBoxLast: {
    flex: 1, backgroundColor: C.lightGray, padding: 9,
    borderLeftWidth: 3, borderLeftColor: C.primary, borderRadius: 2,
  },
  partyLabel:  { fontSize: 6.5, fontWeight: 'bold', color: C.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  partyName:   { fontSize: 9, fontWeight: 'bold', color: C.primaryDark, marginBottom: 2 },
  partyDetail: { fontSize: 7.5, color: C.gray, marginBottom: 1.5 },

  sectionTitle: {
    fontSize: 7.5, fontWeight: 'bold', color: C.primary,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 4, marginTop: 6,
  },

  tableWrap: { marginBottom: 10, borderWidth: 0.5, borderColor: C.border },
  tableHead: { flexDirection: 'row', backgroundColor: C.primary, paddingVertical: 5, paddingHorizontal: 6 },
  tableRow:  { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: C.border },
  tableRowAlt: { backgroundColor: C.lightGray },
  tableTotalRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 6, backgroundColor: C.primaryLight, borderTopWidth: 1, borderTopColor: C.primary },

  thN:     { width: 16, fontSize: 7, fontWeight: 'bold', color: C.white },
  thName:  { flex: 2.5, fontSize: 7, fontWeight: 'bold', color: C.white },
  thModel: { flex: 1.2, fontSize: 7, fontWeight: 'bold', color: C.white },
  thQty:   { width: 30, fontSize: 7, fontWeight: 'bold', color: C.white, textAlign: 'center' },
  thUnit:  { width: 26, fontSize: 7, fontWeight: 'bold', color: C.white, textAlign: 'center' },
  thPrice: { width: 72, fontSize: 7, fontWeight: 'bold', color: C.white, textAlign: 'right' },
  thTotal: { width: 78, fontSize: 7, fontWeight: 'bold', color: C.white, textAlign: 'right' },

  tdN:     { width: 16, fontSize: 8, color: C.gray },
  tdName:  { flex: 2.5, fontSize: 8, fontWeight: 'bold', color: C.primaryDark },
  tdModel: { flex: 1.2, fontSize: 7.5, color: C.gray },
  tdQty:   { width: 30, fontSize: 8, textAlign: 'center', color: C.text },
  tdUnit:  { width: 26, fontSize: 8, textAlign: 'center', color: C.gray },
  tdPrice: { width: 72, fontSize: 8, textAlign: 'right', color: C.gray },
  tdTotal: { width: 78, fontSize: 8, fontWeight: 'bold', textAlign: 'right', color: C.primary },
  tdTotalLabel: { flex: 1, fontSize: 8.5, fontWeight: 'bold', color: C.primaryDark },
  tdTotalValue: { width: 78, fontSize: 8.5, fontWeight: 'bold', textAlign: 'right', color: C.primary },

  // Per-product name row (subtle, between sections)
  productNameRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 10, marginBottom: 4,
  },
  productNameLabel: { fontSize: 7, color: C.gray, marginRight: 6 },
  productNameText:  { fontSize: 9, fontWeight: 'bold', color: C.primaryDark },
  productModelText: { fontSize: 7.5, color: C.gray, marginLeft: 6 },

  // Description (same as single KP)
  descSection: { flexDirection: 'row', marginBottom: 8 },
  descText:    { flex: 1, marginRight: 10 },
  descLine:    { fontSize: 8, color: C.text, marginBottom: 2, lineHeight: 1.4 },
  descHeading: { fontSize: 8.5, fontWeight: 'bold', color: C.primaryDark, marginBottom: 2, marginTop: 4 },
  descProductImg: { width: 110, height: 110, objectFit: 'contain', borderWidth: 0.5, borderColor: C.border, borderRadius: 2 },

  // Specs (same as single KP)
  specsBox:    { borderWidth: 0.5, borderColor: C.border, marginBottom: 8 },
  specRow:     { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: C.border },
  specRowLast: { borderBottomWidth: 0 },
  specRowAlt:  { backgroundColor: C.lightGray },
  specKey: { width: '44%', fontSize: 7.5, color: C.gray },
  specVal: { flex: 1, fontSize: 8, fontWeight: 'bold', color: C.primaryDark },

  condRow:    { flexDirection: 'row', marginBottom: 3.5, alignItems: 'flex-start' },
  condBullet: { width: 10, fontSize: 8, color: C.primary },
  condLabel:  { width: 130, fontSize: 7.5, color: C.gray },
  condValue:  { flex: 1, fontSize: 7.5, fontWeight: 'bold', color: C.primaryDark },

  bankBox: { backgroundColor: C.primaryLight, borderWidth: 0.5, borderColor: C.border, padding: 9, marginBottom: 10, borderRadius: 2 },
  bankTitle: { fontSize: 7, fontWeight: 'bold', color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  bankGrid:  { flexDirection: 'row', flexWrap: 'wrap' },
  bankRow:   { width: '50%', flexDirection: 'row', marginBottom: 3 },
  bankLabel: { width: 68, fontSize: 7, color: C.gray },
  bankValue: { flex: 1, fontSize: 7.5, fontWeight: 'bold', color: C.primaryDark },

  sigSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 },
  sigBox:  { flex: 1 },
  sigRole: { fontSize: 7.5, color: C.gray, marginBottom: 3 },
  sigOrg:  { fontSize: 8, fontWeight: 'bold', color: C.primaryDark, marginBottom: 18 },
  sigLine: { borderBottomWidth: 0.5, borderBottomColor: '#888', marginBottom: 4, marginRight: 60 },
  sigName: { fontSize: 8.5, fontWeight: 'bold', color: C.primaryDark },
  sigDate: { fontSize: 7, color: C.gray, marginTop: 2 },
  stampBox: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center' },

  footer: {
    position: 'absolute', bottom: 18, left: 40, right: 40,
    borderTopWidth: 0.5, borderTopColor: C.border,
    paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between',
  },
  footerText: { fontSize: 6, color: '#999' },

  watermarkWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  watermarkText: { fontSize: 52, fontWeight: 'bold', color: 'rgba(26,74,138,0.05)', transform: 'rotate(-45deg)', letterSpacing: 3 },
})

interface CartItem {
  id?: string
  name_ru: string
  model?: string
  price?: number
  slug: string
  quantity: number
  description_ru?: string
  specs?: Record<string, string>
  imageDataUri?: string | null
}

interface ClientInfo {
  name: string
  company?: string
  phone?: string
  email?: string
  note?: string
}

const CONDITIONS = [
  ['Срок поставки:',  'По согласованию, в зависимости от наличия на складе'],
  ['Гарантия:',       '12 месяцев с момента поставки'],
  ['Условия оплаты:', 'Предоплата 50%, остаток — по факту готовности товара'],
  ['Действие КП:',    '30 календарных дней с даты выставления'],
]

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

function KPBasketDocument({
  items, clientInfo, kpNumber, dateStr, stampDataUri, signatureDataUri,
}: {
  items: CartItem[]
  clientInfo: ClientInfo
  kpNumber: string
  dateStr: string
  stampDataUri: string | null
  signatureDataUri: string | null
}) {
  const totalKnown = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0)
  const hasUnknown = items.some(i => !i.price)
  const hasDetails = items.some(
    i => i.description_ru || (i.specs && Object.keys(i.specs).length > 0) || i.imageDataUri
  )

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
            <Text style={s.logoMain}>BS</Text>
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
          <View style={s.partyBoxLast}>
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
        <Text style={s.sectionTitle}>Перечень товаров</Text>
        <View style={s.tableWrap}>
          <View style={s.tableHead}>
            <Text style={s.thN}>№</Text>
            <Text style={s.thName}>Наименование товара</Text>
            <Text style={s.thModel}>Модель</Text>
            <Text style={s.thQty}>Кол.</Text>
            <Text style={s.thUnit}>Ед.</Text>
            <Text style={s.thPrice}>Цена ед.</Text>
            <Text style={s.thTotal}>Сумма</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={s.tdN}>{i + 1}</Text>
              <Text style={s.tdName}>{item.name_ru}</Text>
              <Text style={s.tdModel}>{item.model || '—'}</Text>
              <Text style={s.tdQty}>{item.quantity}</Text>
              <Text style={s.tdUnit}>шт.</Text>
              <Text style={s.tdPrice}>
                {item.price ? `${item.price.toLocaleString('ru-RU')} T` : 'По запросу'}
              </Text>
              <Text style={s.tdTotal}>
                {item.price ? `${(item.price * item.quantity).toLocaleString('ru-RU')} T` : '—'}
              </Text>
            </View>
          ))}
          <View style={s.tableTotalRow}>
            <Text style={s.tdTotalLabel}>
              ИТОГО (с НДС 12%){hasUnknown ? ' (без позиций «По запросу»)' : ''}:
            </Text>
            <Text style={s.tdTotalValue}>
              {totalKnown > 0 ? `${totalKnown.toLocaleString('ru-RU')} T` : 'По запросу'}
            </Text>
          </View>
          {totalKnown > 0 && (
            <View style={{ flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 6, backgroundColor: C.lightGray }}>
              <Text style={{ flex: 1, fontSize: 7, color: C.gray }}>в т.ч. НДС (12%):</Text>
              <Text style={{ width: 78, fontSize: 7, color: C.gray, textAlign: 'right' }}>
                {`${Math.round(totalKnown * 12 / 112).toLocaleString('ru-RU')} T`}
              </Text>
            </View>
          )}
        </View>

        {/* PER-PRODUCT DETAILS — same layout as single KP, no new page */}
        {hasDetails && (
          <>
            <Text style={s.sectionTitle}>Описание товаров</Text>
            {items.map((item, idx) => {
              const specs = item.specs ? Object.entries(item.specs).slice(0, 16) : []
              const descLines = item.description_ru ? parseDescriptionLines(item.description_ru) : []
              const hasContent = item.imageDataUri || descLines.length > 0 || specs.length > 0
              if (!hasContent) return null

              return (
                <View key={idx}>
                  {/* Product name row — only if more than one product */}
                  {items.length > 1 && (
                    <View style={s.productNameRow}>
                      <Text style={s.productNameLabel}>{idx + 1}.</Text>
                      <Text style={s.productNameText}>{item.name_ru}</Text>
                      {item.model ? <Text style={s.productModelText}>/ {item.model}</Text> : null}
                    </View>
                  )}

                  {/* Description + image (identical to single KP) */}
                  {(descLines.length > 0 || item.imageDataUri) && (
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
                      {item.imageDataUri && (
                        <Image src={item.imageDataUri} style={s.descProductImg} />
                      )}
                    </View>
                  )}

                  {/* Specs (identical to single KP) */}
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

                  {/* Thin divider between products (not after last) */}
                  {items.length > 1 && idx < items.length - 1 && (
                    <View style={s.dividerThin} />
                  )}
                </View>
              )
            })}
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
          {CONDITIONS.map(([label, value]) => (
            <View key={label} style={s.condRow}>
              <Text style={s.condBullet}>•</Text>
              <Text style={s.condLabel}>{label}</Text>
              <Text style={s.condValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* BANK + SIGNATURE: wrap={false} keeps them always together on same page */}
        <View wrap={false}>
          <View style={s.dividerThin} />

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
    try {
      return `data:image/png;base64,${readFileSync(path.join(brandDir, 'stamp.png')).toString('base64')}`
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
      const ext = path.extname(imageUrl).toLowerCase()
      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
      return `data:${mime};base64,${readFileSync(filePath).toString('base64')}`
    }
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const mime = res.headers.get('content-type')?.split(';')[0] || 'image/jpeg'
    return `data:${mime};base64,${Buffer.from(buf).toString('base64')}`
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, clientInfo, lang = 'ru' } = body as {
      items: CartItem[]
      clientInfo: ClientInfo
      lang?: string
    }

    if (!items?.length) {
      return NextResponse.json({ error: 'Нет товаров' }, { status: 400 })
    }

    ensureFontsRegistered()
    const stampDataUri = loadStampDataUri()
    const signatureDataUri = loadSignatureDataUri()

    const kpNumber = generateKPNumber()
    const dateStr = formatDate(new Date())

    const enrichedItems: CartItem[] = await Promise.all(
      items.map(async (item) => {
        try {
          const rows = await query<{
            description_ru: string | null
            specs: Record<string, string> | null
            images: string[] | null
          }>(
            `SELECT description_ru, specs, images FROM products WHERE id = $1 OR slug = $2 LIMIT 1`,
            [item.id ?? null, item.slug],
          )
          const row = rows[0]
          const imageDataUri = row?.images?.[0]
            ? await loadProductImageDataUri(row.images[0])
            : null
          return {
            ...item,
            description_ru: row?.description_ru ?? undefined,
            specs: row?.specs ?? undefined,
            imageDataUri,
          }
        } catch {
          return item
        }
      })
    )

    for (const item of enrichedItems) {
      query(
        `INSERT INTO kp_requests (product_id, product_model, product_name, kp_number, client_name, client_company, client_email, client_phone, quantity, note, lang)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [item.id ?? null, item.model ?? null, item.name_ru, kpNumber, clientInfo.name, clientInfo.company ?? null, clientInfo.email ?? null, clientInfo.phone ?? null, item.quantity, clientInfo.note ?? null, lang],
      ).catch(err => console.error('kp_requests insert failed:', err))
    }

    const buffer = await renderToBuffer(
      <KPBasketDocument
        items={enrichedItems}
        clientInfo={clientInfo}
        kpNumber={kpNumber}
        dateStr={dateStr}
        stampDataUri={stampDataUri}
        signatureDataUri={signatureDataUri}
      />
    )

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="KP_BesS_${kpNumber}.pdf"`,
      },
    })
  } catch (err) {
    console.error('generate-kp-basket error:', err)
    return NextResponse.json({ error: 'Ошибка генерации PDF' }, { status: 500 })
  }
}
