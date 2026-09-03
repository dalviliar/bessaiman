export type Season =
  | 'winter' | 'spring' | 'summer' | 'autumn'
  | 'birthday' | 'womensDay' | 'nauryz' | 'scienceDay' | 'newYear'
export type ParticleKind =
  | 'snowflake' | 'petal' | 'bubble' | 'leaf' | 'confetti' | 'tulip' | 'scienceSpark' | 'newYearSpark'

export interface SeasonTheme {
  /** bright pair for the hairline above the navbar */
  strip: [string, string]
  /** filled active pill — dark enough to carry white text */
  solid: string
  /** faint wash behind the bar and under hovered links */
  soft: string
  /** hairline under the bar */
  edge: string
  /** kind of particle drifting across the navbar */
  particle: ParticleKind
  /** true if the particle should float upward instead of falling */
  rise?: boolean
  /** fixed greeting shown as a small pill on the strip — plain text, no emoji */
  badge?: string
}

const THEMES: Record<Season, SeasonTheme> = {
  winter:     { strip: ['#7DD3FC', '#0EA5E9'], solid: '#0369A1', soft: '#BFE3FB', edge: '#93C9F5', particle: 'snowflake' },
  spring:     { strip: ['#6EE7B7', '#10B981'], solid: '#047857', soft: '#ECFDF5', edge: '#A7F3D0', particle: 'petal' },
  summer:     { strip: ['#67E8F9', '#0891B2'], solid: '#0E7490', soft: '#CFFAFE', edge: '#67E8F9', particle: 'bubble', rise: true },
  autumn:     { strip: ['#FBBF24', '#D97706'], solid: '#B45309', soft: '#FFFBEB', edge: '#FDE68A', particle: 'leaf' },
  birthday:   { strip: ['#38BDF8', '#1565C0'], solid: '#1565C0', soft: '#EFF6FF', edge: '#BFDBFE', particle: 'confetti' },
  womensDay:  { strip: ['#FBCFE8', '#EC4899'], solid: '#BE185D', soft: '#FDF2F8', edge: '#FBCFE8', particle: 'petal', badge: 'С 8 Марта' },
  nauryz:     { strip: ['#FDE68A', '#16A34A'], solid: '#15803D', soft: '#F0FDF4', edge: '#BBF7D0', particle: 'tulip', badge: 'Наурыз құтты болсын!' },
  scienceDay: { strip: ['#93C5FD', '#4F46E5'], solid: '#4338CA', soft: '#EEF2FF', edge: '#C7D2FE', particle: 'scienceSpark', badge: 'Ғылым күні' },
  newYear:    { strip: ['#FCA5A5', '#DC2626'], solid: '#B91C1C', soft: '#FEF2F2', edge: '#FECACA', particle: 'newYearSpark', badge: 'С Новым годом' },
}

export const FOUNDED_YEAR = 2021

function isDate(date: Date, month: number, day: number) {
  return date.getMonth() === month && date.getDate() === day
}

export function isCompanyBirthday(date = new Date()): boolean {
  return isDate(date, 3, 26)
}

export function companyAge(date = new Date()): number {
  return date.getFullYear() - FOUNDED_YEAR
}

export function seasonOf(date = new Date()): Season {
  if (isDate(date, 3, 26)) return 'birthday'
  if (isDate(date, 2, 8)) return 'womensDay'
  if (isDate(date, 2, 22)) return 'nauryz'
  if (isDate(date, 3, 12)) return 'scienceDay'
  if (isDate(date, 11, 31)) return 'newYear'
  const m = date.getMonth()
  if (m <= 1 || m === 11) return 'winter'
  if (m <= 4) return 'spring'
  if (m <= 7) return 'summer'
  return 'autumn'
}

export function seasonTheme(date = new Date()): SeasonTheme {
  return THEMES[seasonOf(date)]
}
