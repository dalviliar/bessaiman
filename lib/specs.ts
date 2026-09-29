import type { SpecsI18n } from '@/types'

type Lang = 'ru' | 'kk' | 'en'

// Common parameter names, so products whose specs were entered before
// translations existed (or where staff left the translation empty) still show
// kk/en names instead of Russian. Anything entered in the admin wins over this.
const KEY_DICT: Record<string, { kk: string; en: string }> = {
  'мощность': { kk: 'Қуаты', en: 'Power' },
  'макс. температура': { kk: 'Макс. температура', en: 'Max. temperature' },
  'максимальная температура': { kk: 'Максималды температура', en: 'Maximum temperature' },
  'температурный диапазон': { kk: 'Температура диапазоны', en: 'Temperature range' },
  'вес': { kk: 'Салмағы', en: 'Weight' },
  'напряжение': { kk: 'Кернеу', en: 'Voltage' },
  'точность': { kk: 'Дәлдігі', en: 'Accuracy' },
  'точность регулировки': { kk: 'Реттеу дәлдігі', en: 'Control accuracy' },
  'материал': { kk: 'Материалы', en: 'Material' },
  'материал камеры': { kk: 'Камера материалы', en: 'Chamber material' },
  'материал корпуса': { kk: 'Корпус материалы', en: 'Housing material' },
  'тип': { kk: 'Түрі', en: 'Type' },
  'объем': { kk: 'Көлемі', en: 'Volume' },
  'объем камеры': { kk: 'Камера көлемі', en: 'Chamber volume' },
  'объем рабочей камеры': { kk: 'Жұмыс камерасының көлемі', en: 'Working chamber volume' },
  'объем барабана': { kk: 'Барабан көлемі', en: 'Drum volume' },
  'объем чаш': { kk: 'Тостағандар көлемі', en: 'Bowl volume' },
  'размер': { kk: 'Өлшемі', en: 'Size' },
  'размер рабочей зоны': { kk: 'Жұмыс аймағының өлшемі', en: 'Working area size' },
  'размер камеры': { kk: 'Камера өлшемі', en: 'Chamber size' },
  'размер столешницы': { kk: 'Үстел үсті өлшемі', en: 'Worktop size' },
  'размер поверхности': { kk: 'Бет өлшемі', en: 'Surface size' },
  'длина зоны нагрева': { kk: 'Қыздыру аймағының ұзындығы', en: 'Heating zone length' },
  'габариты': { kk: 'Габариттері', en: 'Dimensions' },
  'тип контроллера': { kk: 'Контроллер түрі', en: 'Controller type' },
  'контроллер': { kk: 'Контроллер', en: 'Controller' },
  'полки': { kk: 'Сөрелер', en: 'Shelves' },
  'диаметр трубы': { kk: 'Түтік диаметрі', en: 'Tube diameter' },
  'диаметр трубки': { kk: 'Түтік диаметрі', en: 'Tube diameter' },
  'ширина × глубина': { kk: 'Ені × Тереңдігі', en: 'Width × Depth' },
  'столешница': { kk: 'Үстел үсті', en: 'Worktop' },
  'скорость вращения': { kk: 'Айналу жылдамдығы', en: 'Rotation speed' },
  'кол-во зон': { kk: 'Аймақтар саны', en: 'Number of zones' },
  'высота': { kk: 'Биіктігі', en: 'Height' },
  'ширина': { kk: 'Ені', en: 'Width' },
  'глубина': { kk: 'Тереңдігі', en: 'Depth' },
  'длина': { kk: 'Ұзындығы', en: 'Length' },
  'нагрузка': { kk: 'Жүктеме', en: 'Load' },
  'макс. ток': { kk: 'Макс. ток', en: 'Max. current' },
  'кол-во рукавов': { kk: 'Жеңдер саны', en: 'Number of sleeves' },
  'термопара': { kk: 'Термопара', en: 'Thermocouple' },
  'скорость подачи': { kk: 'Беру жылдамдығы', en: 'Feed rate' },
  'применение': { kk: 'Қолданылуы', en: 'Application' },
  'подсветка': { kk: 'Жарықтандыру', en: 'Lighting' },
  'остаточное давление': { kk: 'Қалдық қысым', en: 'Residual pressure' },
  'ориентация': { kk: 'Бағдары', en: 'Orientation' },
  'давление': { kk: 'Қысым', en: 'Pressure' },
  'газы': { kk: 'Газдар', en: 'Gases' },
  'вытяжная система': { kk: 'Сорғыш жүйе', en: 'Exhaust system' },
  'вентиляция': { kk: 'Желдету', en: 'Ventilation' },
  'управление': { kk: 'Басқару', en: 'Control' },
  'управление зонами': { kk: 'Аймақтарды басқару', en: 'Zone control' },
  'тип циркуляции': { kk: 'Айналым түрі', en: 'Circulation type' },
  'тип трубы': { kk: 'Түтік түрі', en: 'Tube type' },
  'тип регулятора': { kk: 'Реттегіш түрі', en: 'Regulator type' },
  'тип коллектора': { kk: 'Коллектор түрі', en: 'Manifold type' },
  'коллектор': { kk: 'Коллектор', en: 'Manifold' },
  'тип изоляции': { kk: 'Оқшаулау түрі', en: 'Insulation type' },
  'сигнализация': { kk: 'Дабыл', en: 'Alarm' },
  'прозрачность': { kk: 'Мөлдірлігі', en: 'Transparency' },
  'программирование': { kk: 'Бағдарламалау', en: 'Programming' },
  'питание': { kk: 'Қуат көзі', en: 'Power supply' },
  'количество программ': { kk: 'Бағдарламалар саны', en: 'Number of programs' },
  'макс. давление баллона': { kk: 'Баллонның макс. қысымы', en: 'Max. cylinder pressure' },
  'кол-во сит (макс)': { kk: 'Електер саны (макс)', en: 'Number of sieves (max)' },
  'производительность': { kk: 'Өнімділігі', en: 'Capacity' },
  'степень защиты (ip)': { kk: 'Қорғау дәрежесі (IP)', en: 'Protection rating (IP)' },
  'гарантия': { kk: 'Кепілдік', en: 'Warranty' },
}

// Units after a number, for the English version of values like "200 л" / "5 кВт".
// Kazakh uses the same Cyrillic unit abbreviations, so kk values stay as-is.
const UNITS_EN: [string, string][] = [
  ['кВт', 'kW'], ['Вт', 'W'], ['кВ', 'kV'], ['В', 'V'], ['мА', 'mA'], ['А', 'A'],
  ['мм', 'mm'], ['см', 'cm'], ['м', 'm'], ['мл', 'ml'], ['л', 'L'],
  ['кг', 'kg'], ['Гц', 'Hz'], ['об/мин', 'rpm'], ['мин', 'min'],
  ['ч', 'h'], ['сек', 's'], ['шт', 'pcs'], ['мес', 'months'], ['мес.', 'months'],
  ['лет', 'years'], ['года', 'years'], ['год', 'year'], ['бар', 'bar'], ['Па', 'Pa'], ['кПа', 'kPa'], ['МПа', 'MPa'],
]
const UNIT_RE = new RegExp(
  `(\\d)(\\s*)(${UNITS_EN.map(([ru]) => ru.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).sort((a, b) => b.length - a.length).join('|')})(?![А-Яа-яЁёA-Za-z])`,
  'g',
)
const UNIT_MAP = Object.fromEntries(UNITS_EN)

function normalizeKey(k: string) {
  return k.trim().toLowerCase().replace(/ё/g, 'е')
}

/** Dictionary translation of a Russian parameter name, if we know it. */
export function suggestSpecKey(ruKey: string, lang: 'kk' | 'en'): string | undefined {
  return KEY_DICT[normalizeKey(ruKey)]?.[lang]
}

export function suggestSpecValue(ruValue: string, lang: 'kk' | 'en'): string {
  if (lang !== 'en') return ruValue
  return ruValue.replace(UNIT_RE, (_, d, sp, u) => `${d}${sp}${UNIT_MAP[u] ?? u}`)
}

export function localizeSpecKey(ruKey: string, i18n: SpecsI18n | null | undefined, lang: Lang): string {
  if (lang === 'ru') return ruKey
  return i18n?.[ruKey]?.[`key_${lang}`]?.trim() || suggestSpecKey(ruKey, lang) || ruKey
}

export function localizeSpecValue(ruKey: string, ruValue: string, i18n: SpecsI18n | null | undefined, lang: Lang): string {
  if (lang === 'ru') return ruValue
  return i18n?.[ruKey]?.[`value_${lang}`]?.trim() || suggestSpecValue(ruValue, lang)
}

/** Spec rows in the visitor's language, in the original order. */
export function localizeSpecs(
  specs: Record<string, string> | null | undefined,
  i18n: SpecsI18n | null | undefined,
  lang: Lang,
): [string, string][] {
  if (!specs) return []
  return Object.entries(specs).map(([key, val]) => [
    localizeSpecKey(key, i18n, lang),
    localizeSpecValue(key, String(val ?? ''), i18n, lang),
  ])
}
