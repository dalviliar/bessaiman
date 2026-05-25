'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Lang } from '@/types'
import { t, type Translations } from '@/lib/translations'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  tr: Translations
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'ru',
  setLang: () => {},
  tr: t('ru'),
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved && ['ru', 'kk', 'en'].includes(saved)) {
      setLangState(saved)
    }
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('lang', newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr: t(lang) }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
