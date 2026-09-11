import { useCallback, useEffect, useState } from 'react'

const KEY = 'iv:favorites'

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) return new Set(arr.filter((x): x is string => typeof x === 'string'))
    }
  } catch {
    /* corrupted storage */
  }
  return new Set()
}

export function useFavorites() {
  const [ids, setIds] = useState<Set<string>>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...ids]))
    } catch {
      /* private mode */
    }
  }, [ids])

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const has = useCallback((id: string) => ids.has(id), [ids])

  return { ids, toggle, has }
}
