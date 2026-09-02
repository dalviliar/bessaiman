export type Season = 'winter' | 'spring' | 'summer' | 'autumn' | 'birthday'
export type ParticleKind = 'snowflake' | 'petal' | 'bubble' | 'leaf' | 'confetti'

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
}

const THEMES: Record<Season, SeasonTheme> = {
  winter:   { strip: ['#7DD3FC', '#0EA5E9'], solid: '#0369A1', soft: '#BFE3FB', edge: '#93C9F5', particle: 'snowflake' },
  spring:   { strip: ['#6EE7B7', '#10B981'], solid: '#047857', soft: '#ECFDF5', edge: '#A7F3D0', particle: 'petal' },
  summer:   { strip: ['#67E8F9', '#0891B2'], solid: '#0E7490', soft: '#CFFAFE', edge: '#67E8F9', particle: 'bubble', rise: true },
  autumn:   { strip: ['#FBBF24', '#D97706'], solid: '#B45309', soft: '#FFFBEB', edge: '#FDE68A', particle: 'leaf' },
  birthday: { strip: ['#38BDF8', '#1565C0'], solid: '#1565C0', soft: '#EFF6FF', edge: '#BFDBFE', particle: 'confetti' },
}

export const FOUNDED_YEAR = 2021

export function isCompanyBirthday(date = new Date()): boolean {
  return date.getMonth() === 3 && date.getDate() === 26
}

export function companyAge(date = new Date()): number {
  return date.getFullYear() - FOUNDED_YEAR
}

export function seasonOf(date = new Date()): Season {
  if (isCompanyBirthday(date)) return 'birthday'
  const m = date.getMonth()
  if (m <= 1 || m === 11) return 'winter'
  if (m <= 4) return 'spring'
  if (m <= 7) return 'summer'
  return 'autumn'
}

export function seasonTheme(date = new Date()): SeasonTheme {
  return THEMES[seasonOf(date)]
}
