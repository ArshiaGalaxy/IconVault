import { useCallback, useEffect, useState } from 'react'
import { en } from '../locales/en'
import { fa } from '../locales/fa'
import type { Dict } from '../locales/en'

export type Lang = 'en' | 'fa'

const KEY = 'iv:lang'

const dicts: Record<Lang, Dict> = { en, fa }

function initial(): Lang {
  return document.documentElement.lang === 'fa' ? 'fa' : 'en'
}

export function useLanguage() {
  const [lang, setLang] = useState<Lang>(initial)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr'
    try {
      localStorage.setItem(KEY, lang)
    } catch {
      /* private mode */
    }
  }, [lang])

  const toggle = useCallback(() => setLang((l) => (l === 'en' ? 'fa' : 'en')), [])

  return { lang, toggle, t: dicts[lang], dir: lang === 'fa' ? ('rtl' as const) : ('ltr' as const) }
}

/** Locale-aware number formatting (Persian digits for fa). */
export function formatNumber(n: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(n)
}
