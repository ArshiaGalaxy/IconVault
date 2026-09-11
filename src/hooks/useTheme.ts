import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

/** Theme-matching accent hex for APIs that need a literal color (color input, presets). */
export const ACCENT_HEX: Record<Theme, string> = { dark: '#c8f550', light: '#84cc16' }

const KEY = 'iv:theme'

function initial(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initial)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* private mode */
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, toggle }
}
