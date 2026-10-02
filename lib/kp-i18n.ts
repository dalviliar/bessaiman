// Fixed wording of the КП PDFs in the visitor's site language. Translations
// were supplied by Bes Saiman (КП_перевод_KZ.docx / КП_системные_переводы_EN.docx);
// numbers, БИН, IBANs, phone and e-mail are never translated.

export type KpLang = 'ru' | 'kk' | 'en'

export function kpLang(lang: unknown): KpLang {
  return lang === 'kk' || lang === 'en' ? lang : 'ru'
}

const L = {
  ru: {
    tagline: 'Научно-производственная компания',
    address: 'г. Алматы, ул. Тулебаева 38/61',
    addressFull: 'РК, г. Алматы, ул. Тулебаева 38/61',
    title: 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ',
    supplier: 'Поставщик',
    buyer: 'Покупатель',
    notSpecified: 'Не указано',
    phone: 'Тел',
    subject: 'Предмет коммерческого предложения',
    itemsList: 'Перечень товаров',
    thN: '№',
    thName: 'Наименование товара',
    thModel: 'Модель',
    thQty: 'Кол.',
    thUnit: 'Ед.',
    thPrice: 'Стоимость',
    thUnitPrice: 'Цена ед.',
    thSum: 'Сумма',
    unitPcs: 'шт.',
    onRequest: 'По запросу',
    total: 'ИТОГО (с НДС 16%)',
    totalWithoutOnRequest: ' (без позиций «По запросу»)',
    vat: 'в т.ч. НДС (16%)',
    description: 'Описание товара',
    descriptionMany: 'Описание товаров',
    specs: 'Технические характеристики',
    note: 'Особые условия',
    conditions: 'Условия поставки',
    deliveryTime: 'Срок поставки',
    warranty: 'Гарантия',
    payment: 'Условия оплаты',
    validity: 'Действие КП',
    bank: 'Банковские реквизиты',
    bankName: 'Наименование',
    bankBank: 'Банк',
    bin: 'БИН',
    bic: 'БИК',
    kbe: 'КБЕ',
    iikKzt: 'ИИК (KZT)',
    iikUsd: 'ИИК (USD)',
    director: 'Генеральный директор',
    company: 'ТОО «Bes Saiman Group»',
    bankValue: 'АО «Банк ЦентрКредит»',
  },
  kk: {
    tagline: 'Ғылыми-өндірістік компания',
    address: 'Алматы қ., Төлебаев к-сі 38/61',
    addressFull: 'ҚР, Алматы қ., Төлебаев к-сі 38/61',
    title: 'КОММЕРЦИЯЛЫҚ ҰСЫНЫС',
    supplier: 'Жеткізуші',
    buyer: 'Сатып алушы',
    notSpecified: 'Көрсетілмеген',
    phone: 'Тел',
    subject: 'Коммерциялық ұсыныстың мәні',
    itemsList: 'Тауарлар тізбесі',
    thN: '№',
    thName: 'Тауар атауы',
    thModel: 'Модель',
    thQty: 'Саны',
    thUnit: 'Өлшем бірлігі',
    thPrice: 'Құны',
    thUnitPrice: 'Бірлік бағасы',
    thSum: 'Сомасы',
    unitPcs: 'дана',
    onRequest: 'Сұраныс бойынша',
    total: 'БАРЛЫҒЫ (ҚҚС 16%-бен)',
    totalWithoutOnRequest: ' («Сұраныс бойынша» позицияларынсыз)',
    vat: 'оның ішінде ҚҚС (16%)',
    description: 'Тауар сипаттамасы',
    descriptionMany: 'Тауарлар сипаттамасы',
    specs: 'Техникалық сипаттамалар',
    note: 'Ерекше шарттар',
    conditions: 'Жеткізу шарттары',
    deliveryTime: 'Жеткізу мерзімі',
    warranty: 'Кепілдік',
    payment: 'Төлем шарттары',
    validity: 'Коммерциялық ұсыныстың жарамдылық мерзімі',
    bank: 'Банктік деректемелер',
    bankName: 'Атауы',
    bankBank: 'Банк',
    bin: 'БСН',
    bic: 'БСК',
    kbe: 'БеК',
    iikKzt: 'ЖСК (KZT)',
    iikUsd: 'ЖСК (USD)',
    director: 'Бас директор',
    company: '«Bes Saiman Group» ЖШС',
    bankValue: '«Банк ЦентрКредит» АҚ',
  },
  en: {
    tagline: 'Research and Manufacturing Company',
    address: '38/61 Tulebaev St., Almaty',
    addressFull: '38/61 Tulebaev St., Almaty, Kazakhstan',
    title: 'COMMERCIAL OFFER',
    supplier: 'Supplier',
    buyer: 'Buyer',
    notSpecified: 'Not specified',
    phone: 'Tel',
    subject: 'Subject of the commercial offer',
    itemsList: 'List of products',
    thN: 'No.',
    thName: 'Product Name',
    thModel: 'Model',
    thQty: 'Qty.',
    thUnit: 'Unit',
    thPrice: 'Price',
    thUnitPrice: 'Unit price',
    thSum: 'Amount',
    unitPcs: 'pcs.',
    onRequest: 'On request',
    total: 'TOTAL (incl. 16% VAT)',
    totalWithoutOnRequest: ' (excluding "On request" items)',
    vat: 'of which VAT (16%)',
    description: 'Product description',
    descriptionMany: 'Product descriptions',
    specs: 'Technical specifications',
    note: 'Special terms',
    conditions: 'Delivery terms',
    deliveryTime: 'Delivery time',
    warranty: 'Warranty',
    payment: 'Payment terms',
    validity: 'Offer validity',
    bank: 'Bank details',
    bankName: 'Company name',
    bankBank: 'Bank',
    bin: 'BIN',
    bic: 'BIC',
    kbe: 'Beneficiary Code (KBE)',
    iikKzt: 'IBAN (KZT)',
    iikUsd: 'IBAN (USD)',
    director: 'General Director',
    company: 'Bes Saiman Group LLP',
    bankValue: 'Bank CenterCredit JSC',
  },
} as const

export type KpText = { [K in keyof typeof L.ru]: string }

export function kpText(lang: KpLang): KpText {
  return L[lang]
}

export function kpBankRows(lang: KpLang): [string, string][] {
  const t = L[lang]
  return [
    [`${t.bankName}:`, t.company],
    [`${t.bin}:`, '210440034775'],
    [`${t.bankBank}:`, t.bankValue],
    [`${t.bic}:`, 'KCJBKZKX'],
    [`${t.kbe}:`, '17'],
    [`${t.iikKzt}:`, 'KZ128562203117832934'],
    [`${t.iikUsd}:`, 'KZ318562203231984520'],
  ]
}

// Delivery/payment wording is edited in /admin/kp-terms in Russian only. The
// standard phrases are translated here; anything staff rewrote stays Russian.
const TERM_VALUES: Record<string, { kk: string; en: string }> = {
  'Товар в наличии на складе - отгрузка в течение 1-3 рабочих дней': {
    kk: 'Тауар қоймада бар: 1-3 жұмыс күні ішінде жөнелтіледі',
    en: 'In stock: shipment within 1-3 business days',
  },
  '12 месяцев с момента поставки': {
    kk: 'Жеткізілген күннен бастап 12 ай',
    en: '12 months from the date of delivery',
  },
  'Оплата 100% по факту выставления счёта': {
    kk: 'Шот ұсынылғаннан кейін 100% төлем',
    en: '100% payment upon invoice issuance',
  },
  '30 календарных дней с даты выставления': {
    kk: 'Берілген күннен бастап 30 күнтізбелік күн',
    en: '30 calendar days from the date of issue',
  },
  'По согласованию, в зависимости от наличия на складе': {
    kk: 'Келісім бойынша, қоймадағы бар-жоғына байланысты',
    en: 'By agreement, depending on stock availability',
  },
  'Предоплата 50%, остаток - по факту готовности товара': {
    kk: '50% алдын ала төлем, қалғаны тауар дайын болғанда',
    en: '50% prepayment, the balance upon readiness of the goods',
  },
}

const normTerm = (s: string) => s.replace(/[—–]/g, '-').replace(/ё/g, 'е').replace(/\s+/g, ' ').trim().toLowerCase()
const TERM_INDEX = new Map(Object.entries(TERM_VALUES).map(([ru, tr]) => [normTerm(ru), tr]))

export function kpTermValue(value: string, lang: KpLang): string {
  if (lang === 'ru') return value
  return TERM_INDEX.get(normTerm(value))?.[lang] ?? value
}

const MONTHS = {
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  kk: ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}

export function kpDate(d: Date, lang: KpLang): string {
  const day = d.getDate(), month = MONTHS[lang][d.getMonth()], year = d.getFullYear()
  if (lang === 'kk') return `${year} жылғы ${day} ${month}`
  if (lang === 'en') return `${day} ${month} ${year}`
  return `${day} ${month} ${year} г.`
}

/** The site sends "Не указано" when the visitor left their name empty. */
export function kpClientName(name: string, lang: KpLang): string {
  return name === 'Не указано' ? L[lang].notSpecified : name
}
