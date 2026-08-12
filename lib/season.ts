export type Season = 'winter' | 'spring' | 'summer' | 'autumn'

export interface SeasonTheme {
  /** bright pair for the hairline above the navbar */
  strip: [string, string]
  /** filled active pill — dark enough to carry white text */
  solid: string
  /** faint wash behind the bar and under hovered links */
  soft: string
  /** hairline under the bar */
  edge: string
}

const THEMES: Record<Season, SeasonTheme> = {
  winter: { strip: ['#7DD3FC', '#0EA5E9'], solid: '#0369A1', soft: '#E0F2FE', edge: '#BAE6FD' },
  spring: { strip: ['#6EE7B7', '#10B981'], solid: '#047857', soft: '#ECFDF5', edge: '#A7F3D0' },
  summer: { strip: ['#38BDF8', '#1565C0'], solid: '#1565C0', soft: '#EFF6FF', edge: '#BFDBFE' },
  autumn: { strip: ['#FBBF24', '#D97706'], solid: '#B45309', soft: '#FFFBEB', edge: '#FDE68A' },
}

export function seasonOf(date = new Date()): Season {
  const m = date.getMonth()
  if (m <= 1 || m === 11) return 'winter'
  if (m <= 4) return 'spring'
  if (m <= 7) return 'summer'
  return 'autumn'
}

export function seasonTheme(date = new Date()): SeasonTheme {
  return THEMES[seasonOf(date)]
}
