import React from 'react'
import path from 'path'
import { NextResponse } from 'next/server'
import { pdf, Font, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Register fonts once at module load (not per-request — react-pdf v4 caches by family name)
const fontsDir = path.join(process.cwd(), 'public', 'fonts')
const stampPath = path.join(process.cwd(), 'public', 'brand', 'stamp.jpg')
Font.register({
  family: 'Roboto',
  fonts: [
    { src: path.join(fontsDir, 'Roboto-Regular.ttf') },
    { src: path.join(fontsDir, 'Roboto-Bold.ttf'), fontWeight: 'bold' },
  ],
})

const C = {
  primary: '#1A4A8A',
  primaryDark: '#0A1E3A',
  primaryLight: '#E8EFF8',
  text: '#1C2833',
  gray: '#5D6D7E',
  lightGray: '#F4F6F8',
  border: '#C8D8E8',
  white: '#FFFFFF',
}

const s = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 9, color: C.text, paddingTop: 36, paddingBottom: 52, paddingHorizontal: 44 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  logoBox: { width: 68, height: 42, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  logoMain: { fontSize: 16, fontWeight: 'bold', color: C.primary },
  logoSub: { fontSize: 5.5, color: C.gray, letterSpacing: 1.5 },
  headerInfo: { flex: 1, paddingLeft: 14 },
  companyName: { fontSize: 14, fontWeight: 'bold', color: C.primary, marginBottom: 2 },
  companyTagline: { fontSize: 8, color: C.gray, marginBottom: 3 },
  companyContact: { fontSize: 7.5, color: C.gray },

  dividerBlue: { borderBottomWidth: 2, borderBottomColor: C.primary, marginVertical: 10 },
  dividerThin: { borderBottomWidth: 0.5, borderBottomColor: C.border, marginVertical: 8 },

  // Title banner
  titleBanner: { backgroundColor: C.primary, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleMain: { fontSize: 13, fontWeight: 'bold', color: C.white, letterSpacing: 0.5 },
  titleNum: { fontSize: 8, color: 'rgba(255,255,255,0.75)' },

  // Parties
  parties: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  partyBox: { flex: 1, backgroundColor: C.lightGray, padding: 10, borderLeftWidth: 3, borderLeftColor: C.primary },
  partyLabel: { fontSize: 7, fontWeight: 'bold', color: C.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  partyName: { fontSize: 9.5, fontWeight: 'bold', color: C.primaryDark, marginBottom: 3 },
  partyDetail: { fontSize: 8, color: C.gray, marginBottom: 2 },

  sectionTitle: { fontSize: 8.5, fontWeight: 'bold', color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5, marginTop: 4 },

  // Product table
  tableHead: { flexDirection: 'row', backgroundColor: C.primary, paddingVertical: 6, paddingHorizontal: 6 },
  tableRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: C.border },
  tableRowAlt: { backgroundColor: C.lightGray },
  thN: { width: 18, fontSize: 7.5, fontWeight: 'bold', color: C.white },
  thName: { flex: 2.5, fontSize: 7.5, fontWeight: 'bold', color: C.white },
  thModel: { flex: 1.2, fontSize: 7.5, fontWeight: 'bold', color: C.white },
  thQty: { width: 32, fontSize: 7.5, fontWeight: 'bold', color: C.white, textAlign: 'center' },
  thUnit: { width: 28, fontSize: 7.5, fontWeight: 'bold', color: C.white, textAlign: 'center' },
  thPrice: { width: 76, fontSize: 7.5, fontWeight: 'bold', color: C.white, textAlign: 'right' },
  tdN: { width: 18, fontSize: 8.5, color: C.gray },
  tdName: { flex: 2.5, fontSize: 8.5, fontWeight: 'bold', color: C.primaryDark },
  tdModel: { flex: 1.2, fontSize: 7.5, color: C.gray },
  tdQty: { width: 32, fontSize: 8.5, textAlign: 'center', color: C.text },
  tdUnit: { width: 28, fontSize: 8.5, textAlign: 'center', color: C.gray },
  tdPrice: { width: 76, fontSize: 8.5, fontWeight: 'bold', textAlign: 'right', color: C.primary },

  // Specs
  specsBox: { borderWidth: 0.5, borderColor: C.border, marginBottom: 10 },
  specRow: { flexDirection: 'row', paddingVertical: 4.5, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: C.border },
  specRowAlt: { backgroundColor: C.lightGray },
  specKey: { width: '46%', fontSize: 8, color: C.gray },
  specVal: { flex: 1, fontSize: 8.5, fontWeight: 'bold', color: C.primaryDark },

  // Conditions
  condRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-start' },
  condBullet: { width: 10, fontSize: 8, color: C.primary },
  condLabel: { width: 128, fontSize: 8, color: C.gray },
  condValue: { flex: 1, fontSize: 8, fontWeight: 'bold', color: C.primaryDark },

  // Bank
  bankBox: { backgroundColor: C.primaryLight, borderWidth: 0.5, borderColor: C.border, padding: 10, marginBottom: 12 },
  bankTitle: { fontSize: 7.5, fontWeight: 'bold', color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 },
  bankRow: { flexDirection: 'row', marginBottom: 3.5 },
  bankLabel: { width: 90, fontSize: 7.5, color: C.gray },
  bankValue: { flex: 1, fontSize: 8, fontWeight: 'bold', color: C.primaryDark },

  // Signature
  sigSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 },
  sigBox: { width: 200 },
  sigRole: { fontSize: 8, color: C.gray, marginBottom: 4 },
  sigTitle: { fontSize: 8, fontWeight: 'bold', color: C.primaryDark, marginBottom: 14 },
  sigLine: { borderBottomWidth: 0.5, borderBottomColor: C.primaryDark, height: 24, marginBottom: 4 },
  sigName: { fontSize: 9, fontWeight: 'bold', color: C.primaryDark },
  stampWrap: { width: 90, height: 90, position: 'relative' },

  // Footer
  footer: { position: 'absolute', bottom: 20, left: 44, right: 44, borderTopWidth: 0.5, borderTopColor: C.border, paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' },
  footerLeft: { fontSize: 6.5, color: C.gray },
  footerRight: { fontSize: 6.5, color: C.gray },
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
  model?: string
  specs?: Record<string, string>
  price?: number
  slug: string
}

const CONDITIONS = [
  ['Срок поставки:', 'По согласованию, в зависимости от наличия на складе'],
  ['Гарантия:', '12 месяцев с момента поставки'],
  ['Условия оплаты:', 'Предоплата 50%, остаток — по факту готовности товара'],
  ['Действие КП:', '30 календарных дней с даты выставления'],
]

const BANK_ROWS = [
  ['Наименование:', 'ТОО «Bes Saiman Group»'],
  ['БИН:', '210440034775'],
  ['Банк:', 'АО «Банк ЦентрКредит»'],
  ['БИК:', 'KCJBKZKX'],
  ['КБЕ:', '17'],
  ['ИИК (KZT):', 'KZ128562203117832934'],
  ['ИИК (USD):', 'KZ318562203231984520'],
]

function KPDocument({
  product,
  clientInfo,
  lang,
  kpNumber,
  dateStr,
}: {
  product: ProductData
  clientInfo: ClientInfo
  lang: string
  kpNumber: string
  dateStr: string
}) {
  const productName =
    (lang === 'kk' ? product.name_kk : lang === 'en' ? product.name_en : null) ||
    product.name_ru

  const specs = product.specs ? Object.entries(product.specs).slice(0, 14) : []

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── HEADER ── */}
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
        </View>

        <View style={s.dividerBlue} />

        {/* ── TITLE BANNER ── */}
        <View style={s.titleBanner}>
          <Text style={s.titleMain}>КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</Text>
          <Text style={s.titleNum}>№ {kpNumber}  |  {dateStr}</Text>
        </View>

        {/* ── PARTIES ── */}
        <View style={s.parties}>
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Поставщик</Text>
            <Text style={s.partyName}>ТОО «Bes Saiman Group»</Text>
            <Text style={s.partyDetail}>БИН: 210440034775</Text>
            <Text style={s.partyDetail}>РК, г. Алматы, ул. Тулебаева 38/61</Text>
            <Text style={s.partyDetail}>Директор: Елеуов Мухтар Ауезович</Text>
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

        {/* ── PRODUCT TABLE ── */}
        <Text style={s.sectionTitle}>Предмет коммерческого предложения</Text>
        <View style={{ marginBottom: 10 }}>
          <View style={s.tableHead}>
            <Text style={s.thN}>№</Text>
            <Text style={s.thName}>Наименование товара</Text>
            <Text style={s.thModel}>Модель</Text>
            <Text style={s.thQty}>Кол-во</Text>
            <Text style={s.thUnit}>Ед.</Text>
            <Text style={s.thPrice}>Стоимость</Text>
          </View>
          <View style={[s.tableRow, s.tableRowAlt]}>
            <Text style={s.tdN}>1</Text>
            <Text style={s.tdName}>{productName}</Text>
            <Text style={s.tdModel}>{product.model || '—'}</Text>
            <Text style={s.tdQty}>{clientInfo.quantity}</Text>
            <Text style={s.tdUnit}>шт.</Text>
            <Text style={s.tdPrice}>
              {product.price
                ? `${product.price.toLocaleString('ru-RU')} ₸`
                : 'По запросу'}
            </Text>
          </View>
        </View>

        {/* ── SPECS ── */}
        {specs.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Технические характеристики</Text>
            <View style={s.specsBox}>
              {specs.map(([key, val], i) => (
                <View key={key} style={[s.specRow, i % 2 === 1 ? s.specRowAlt : {}]}>
                  <Text style={s.specKey}>{key}</Text>
                  <Text style={s.specVal}>{String(val)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── NOTE ── */}
        {clientInfo.note ? (
          <>
            <Text style={s.sectionTitle}>Особые условия</Text>
            <Text style={{ fontSize: 8.5, color: C.text, marginBottom: 10 }}>{clientInfo.note}</Text>
          </>
        ) : null}

        {/* ── CONDITIONS ── */}
        <Text style={s.sectionTitle}>Условия</Text>
        <View style={{ marginBottom: 10 }}>
          {CONDITIONS.map(([label, value]) => (
            <View key={label} style={s.condRow}>
              <Text style={s.condBullet}>•</Text>
              <Text style={s.condLabel}>{label}</Text>
              <Text style={s.condValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={s.dividerThin} />

        {/* ── BANK ── */}
        <View style={s.bankBox}>
          <Text style={s.bankTitle}>Банковские реквизиты</Text>
          {BANK_ROWS.map(([label, value]) => (
            <View key={label} style={s.bankRow}>
              <Text style={s.bankLabel}>{label}</Text>
              <Text style={s.bankValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* ── SIGNATURE + STAMP ── */}
        <View style={s.sigSection}>

          {/* Left — signature block */}
          <View style={s.sigBox}>
            <Text style={s.sigRole}>Генеральный директор</Text>
            <Text style={s.sigTitle}>ТОО «Bes Saiman Group»</Text>
            <View style={s.sigLine} />
            <Text style={s.sigName}>Елеуов М.А.</Text>
          </View>

          {/* Right — company stamp (печать) */}
          <View style={s.stampWrap}>
            <Image src={stampPath} style={{ width: 90, height: 90, opacity: 0.92 }} />
          </View>
        </View>

        {/* ── FOOTER (fixed) ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>
            ТОО «Bes Saiman Group»  ·  БИН 210440034775  ·  +7 (701) 101-34-33  ·  bessaimangroup1@gmail.com
          </Text>
          <Text
            style={s.footerRight}
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { product, clientInfo, lang = 'ru' } = body as {
      product: ProductData
      clientInfo: ClientInfo
      lang: string
    }

    const kpNumber = generateKPNumber()
    const dateStr = formatDate(new Date())

    query(
      `INSERT INTO kp_requests (product_id, product_model, product_name, kp_number, client_name, client_company, client_email, client_phone, quantity, note, lang)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [product.id ?? null, product.model ?? null, product.name_ru, kpNumber, clientInfo.name, clientInfo.company ?? null, clientInfo.email ?? null, clientInfo.phone ?? null, clientInfo.quantity, clientInfo.note ?? null, lang],
    ).catch(err => console.error('kp_requests insert failed:', err))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await (pdf as any)(
      <KPDocument product={product} clientInfo={clientInfo} lang={lang} kpNumber={kpNumber} dateStr={dateStr} />
    ).toBuffer()

    const filename = `KP_BesS_${product.model || product.slug}_${new Date().getFullYear()}.pdf`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (err) {
    console.error('KP generation error:', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
