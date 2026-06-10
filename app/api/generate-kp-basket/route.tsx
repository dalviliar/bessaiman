import React from 'react'
import path from 'path'
import { NextResponse } from 'next/server'
import { pdf, Font, Document, Page, Text, View, StyleSheet, Svg, Circle, Line, Rect } from '@react-pdf/renderer'

export const runtime = 'nodejs'

const fontsDir = path.join(process.cwd(), 'public', 'fonts')
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

  titleBanner: { backgroundColor: C.primary, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleMain: { fontSize: 13, fontWeight: 'bold', color: C.white, letterSpacing: 0.5 },
  titleNum: { fontSize: 8, color: 'rgba(255,255,255,0.75)' },

  parties: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  partyBox: { flex: 1, backgroundColor: C.lightGray, padding: 10, borderLeftWidth: 3, borderLeftColor: C.primary },
  partyLabel: { fontSize: 7, fontWeight: 'bold', color: C.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  partyName: { fontSize: 9.5, fontWeight: 'bold', color: C.primaryDark, marginBottom: 3 },
  partyDetail: { fontSize: 8, color: C.gray, marginBottom: 2 },

  sectionTitle: { fontSize: 8.5, fontWeight: 'bold', color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5, marginTop: 4 },

  tableHead: { flexDirection: 'row', backgroundColor: C.primary, paddingVertical: 6, paddingHorizontal: 6 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: C.border },
  tableRowAlt: { backgroundColor: C.lightGray },
  thN:     { width: 18,  fontSize: 7.5, fontWeight: 'bold', color: C.white },
  thName:  { flex: 2.8,  fontSize: 7.5, fontWeight: 'bold', color: C.white },
  thArt:   { flex: 1.2,  fontSize: 7.5, fontWeight: 'bold', color: C.white },
  thQty:   { width: 32,  fontSize: 7.5, fontWeight: 'bold', color: C.white, textAlign: 'center' },
  thUnit:  { width: 28,  fontSize: 7.5, fontWeight: 'bold', color: C.white, textAlign: 'center' },
  thPrice: { width: 76,  fontSize: 7.5, fontWeight: 'bold', color: C.white, textAlign: 'right' },
  thTotal: { width: 76,  fontSize: 7.5, fontWeight: 'bold', color: C.white, textAlign: 'right' },
  tdN:     { width: 18,  fontSize: 8, color: C.gray },
  tdName:  { flex: 2.8,  fontSize: 8, fontWeight: 'bold', color: C.primaryDark },
  tdArt:   { flex: 1.2,  fontSize: 7.5, color: C.gray },
  tdQty:   { width: 32,  fontSize: 8.5, textAlign: 'center', color: C.text },
  tdUnit:  { width: 28,  fontSize: 8, textAlign: 'center', color: C.gray },
  tdPrice: { width: 76,  fontSize: 8, textAlign: 'right', color: C.primaryDark },
  tdTotal: { width: 76,  fontSize: 8.5, fontWeight: 'bold', textAlign: 'right', color: C.primary },

  totalRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 6, backgroundColor: C.primaryLight, borderTopWidth: 2, borderTopColor: C.primary },

  condRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-start' },
  condBullet: { width: 10, fontSize: 8, color: C.primary },
  condLabel: { width: 128, fontSize: 8, color: C.gray },
  condValue: { flex: 1, fontSize: 8, fontWeight: 'bold', color: C.primaryDark },

  bankBox: { backgroundColor: C.primaryLight, borderWidth: 0.5, borderColor: C.border, padding: 10, marginBottom: 12 },
  bankTitle: { fontSize: 7.5, fontWeight: 'bold', color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 },
  bankRow: { flexDirection: 'row', marginBottom: 3.5 },
  bankLabel: { width: 90, fontSize: 7.5, color: C.gray },
  bankValue: { flex: 1, fontSize: 8, fontWeight: 'bold', color: C.primaryDark },

  sigSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 },
  sigBox: { width: 200 },
  sigRole: { fontSize: 8, color: C.gray, marginBottom: 4 },
  sigTitle: { fontSize: 8, fontWeight: 'bold', color: C.primaryDark, marginBottom: 14 },
  sigLine: { borderBottomWidth: 0.5, borderBottomColor: C.primaryDark, height: 24, marginBottom: 4 },
  sigName: { fontSize: 9, fontWeight: 'bold', color: C.primaryDark },
  stampWrap: { width: 90, height: 90, position: 'relative' },
  stampText: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },

  footer: { position: 'absolute', bottom: 20, left: 44, right: 44, borderTopWidth: 0.5, borderTopColor: C.border, paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' },
  footerLeft: { fontSize: 6.5, color: C.gray },
  footerRight: { fontSize: 6.5, color: C.gray },
})

interface ClientInfo {
  name: string
  company?: string
  phone?: string
  email?: string
  note?: string
}

interface BasketItem {
  id?: string
  name_ru: string
  model?: string | null
  specs?: Record<string, string> | null
  price?: number | null
  slug: string
  quantity: number
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

function KPBasketDocument({
  items,
  clientInfo,
  kpNumber,
  dateStr,
}: {
  items: BasketItem[]
  clientInfo: ClientInfo
  kpNumber: string
  dateStr: string
}) {
  const grandTotal = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0)
  const hasAllPrices = items.every(i => i.price)

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

        {/* ── TITLE ── */}
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
        <Text style={s.sectionTitle}>Спецификация товаров</Text>
        <View style={{ marginBottom: 10 }}>
          <View style={s.tableHead}>
            <Text style={s.thN}>№</Text>
            <Text style={s.thName}>Наименование товара</Text>
            <Text style={s.thArt}>Артикул</Text>
            <Text style={s.thQty}>Кол.</Text>
            <Text style={s.thUnit}>Ед.</Text>
            <Text style={s.thPrice}>Цена</Text>
            <Text style={s.thTotal}>Сумма</Text>
          </View>

          {items.map((item, idx) => {
            const rowTotal = (item.price ?? 0) * item.quantity
            return (
              <View key={item.id ?? idx} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}>
                <Text style={s.tdN}>{idx + 1}</Text>
                <Text style={s.tdName}>{item.name_ru}</Text>
                <Text style={s.tdArt}>{item.model || '—'}</Text>
                <Text style={s.tdQty}>{item.quantity}</Text>
                <Text style={s.tdUnit}>шт.</Text>
                <Text style={s.tdPrice}>
                  {item.price ? `${item.price.toLocaleString('ru-RU')} ₸` : 'По запросу'}
                </Text>
                <Text style={s.tdTotal}>
                  {rowTotal > 0 ? `${rowTotal.toLocaleString('ru-RU')} ₸` : '—'}
                </Text>
              </View>
            )
          })}

          {/* Итого */}
          <View style={s.totalRow}>
            <Text style={{ flex: 1, fontSize: 8.5, fontWeight: 'bold', color: C.primaryDark, paddingLeft: 6 }}>
              ИТОГО:
            </Text>
            <Text style={{ width: 76, fontSize: 9.5, fontWeight: 'bold', textAlign: 'right', color: C.primary, paddingRight: 6 }}>
              {grandTotal > 0
                ? `${grandTotal.toLocaleString('ru-RU')} ₸${!hasAllPrices ? ' + по запросу' : ''}`
                : 'По запросу'
              }
            </Text>
          </View>
        </View>

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
          <View style={s.sigBox}>
            <Text style={s.sigRole}>Генеральный директор</Text>
            <Text style={s.sigTitle}>ТОО «Bes Saiman Group»</Text>
            <View style={s.sigLine} />
            <Text style={s.sigName}>Елеуов М.А.</Text>
          </View>

          <View style={s.stampWrap}>
            <Svg viewBox="0 0 90 90" width={90} height={90} style={{ position: 'absolute', top: 0, left: 0 }}>
              <Circle cx={45} cy={45} r={43} stroke="#1A3A8A" strokeWidth={2.5} fill="none" />
              <Circle cx={45} cy={45} r={37} stroke="#1A3A8A" strokeWidth={0.7} fill="none" />
              <Rect x={0} y={38} width={7} height={14} rx={1} fill="#1A3A8A" />
              <Rect x={2} y={35} width={3} height={20} rx={1} fill="#1A3A8A" />
              <Rect x={83} y={38} width={7} height={14} rx={1} fill="#1A3A8A" />
              <Rect x={85} y={35} width={3} height={20} rx={1} fill="#1A3A8A" />
              <Line x1={16} y1={55} x2={74} y2={55} stroke="#1A3A8A" strokeWidth={0.6} />
            </Svg>
            <View style={[s.stampText, { top: 8 }]}>
              <Text style={{ fontSize: 4, color: '#1A3A8A', fontWeight: 'bold', letterSpacing: 0.3 }}>ҚАЗАҚСТАН РЕСПУБЛИКАСЫ</Text>
            </View>
            <View style={[s.stampText, { top: 14 }]}>
              <Text style={{ fontSize: 3.8, color: '#1A3A8A', letterSpacing: 0.2 }}>АЛМАТЫ ҚАЛАСЫ</Text>
            </View>
            <View style={[s.stampText, { top: 28 }]}>
              <Text style={{ fontSize: 10, color: '#1A3A8A', fontWeight: 'bold' }}>Bes Saiman</Text>
            </View>
            <View style={[s.stampText, { top: 40 }]}>
              <Text style={{ fontSize: 10, color: '#1A3A8A', fontWeight: 'bold' }}>Group</Text>
            </View>
            <View style={[s.stampText, { top: 58 }]}>
              <Text style={{ fontSize: 5, color: '#1A3A8A' }}>БИН/БСН 210440034775</Text>
            </View>
            <View style={[s.stampText, { top: 68 }]}>
              <Text style={{ fontSize: 3.5, color: '#1A3A8A', letterSpacing: 0.1 }}>ЖАУАПКЕРШІЛІГІ ШЕКТЕУЛІ СЕРІКТЕСТІГІ</Text>
            </View>
            <View style={[s.stampText, { top: 74 }]}>
              <Text style={{ fontSize: 3.2, color: '#1A3A8A' }}>ТОВАРИЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ</Text>
            </View>
          </View>
        </View>

        {/* ── FOOTER ── */}
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
  return `КП-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, clientInfo } = body as { items: BasketItem[]; clientInfo: ClientInfo; lang: string }

    if (!items?.length) {
      return NextResponse.json({ error: 'No items' }, { status: 400 })
    }

    const kpNumber = generateKPNumber()
    const dateStr = formatDate(new Date())

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await (pdf as any)(
      <KPBasketDocument items={items} clientInfo={clientInfo} kpNumber={kpNumber} dateStr={dateStr} />
    ).toBuffer()

    const filename = `KP_BesS_${new Date().toISOString().slice(0,10)}.pdf`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (err) {
    console.error('KP basket generation error:', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
