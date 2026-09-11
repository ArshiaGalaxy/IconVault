import { useEffect, useMemo, useState } from 'react'
import { loadAllIcons } from '../data/icons'
import type { Collection, IconMeta } from '../data/icons'
import { filterIcons } from '../utils/search'

export type CollectionFilter = Collection | 'all'

export function useIcons(favorites: Set<string>) {
  const [all, setAll] = useState<IconMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [collection, setCollection] = useState<CollectionFilter>('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadAllIcons()
      .then((icons) => {
        if (!cancelled) {
          setAll(icons)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err))
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const icons = useMemo(() => {
    let list = all
    if (collection !== 'all') list = list.filter((i) => i.collection === collection)
    if (favoritesOnly) list = list.filter((i) => favorites.has(i.id))
    return filterIcons(list, query)
  }, [all, collection, favoritesOnly, favorites, query])

  return {
    all,
    icons,
    loading,
    error,
    query,
    setQuery,
    collection,
    setCollection,
    favoritesOnly,
    setFavoritesOnly,
  }
}
