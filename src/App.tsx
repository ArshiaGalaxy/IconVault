import { useCallback, useMemo, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import SearchBar from './components/SearchBar'
import IconGrid from './components/IconGrid'
import IconPreview from './components/IconPreview'
import type { IconMeta } from './data/icons'
import { useFavorites } from './hooks/useFavorites'
import { useIcons } from './hooks/useIcons'
import { useLanguage } from './hooks/useLanguage'
import { ACCENT_HEX, useTheme } from './hooks/useTheme'
import { copyText, loadSvgText } from './utils/svg'

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme()
  const { lang, toggle: toggleLang, t } = useLanguage()
  const favorites = useFavorites()
  const {
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
  } = useIcons(favorites.ids)
  const [selected, setSelected] = useState<IconMeta | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length }
    for (const icon of all) c[icon.collection] = (c[icon.collection] ?? 0) + 1
    return c
  }, [all])

  const handleCardCopy = useCallback((icon: IconMeta) => {
    return loadSvgText(icon.file)
      .then((raw) => copyText(raw))
      .catch(() => false)
  }, [])

  const openPreview = useCallback((icon: IconMeta) => setSelected(icon), [])

  const filterKey = `${query}|${collection}|${favoritesOnly}`

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        lang={lang}
        onToggleLang={toggleLang}
        onOpenSidebar={() => setSidebarOpen(true)}
        t={t}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          t={t}
          lang={lang}
          collection={collection}
          onCollection={setCollection}
          favoritesOnly={favoritesOnly}
          onFavoritesOnly={setFavoritesOnly}
          counts={counts}
          favCount={favorites.ids.size}
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <SearchBar
            query={query}
            onQuery={setQuery}
            collection={collection}
            onCollection={setCollection}
            resultCount={icons.length}
            lang={lang}
            t={t}
          />
          <IconGrid
            icons={icons}
            loading={loading}
            error={error}
            filterKey={filterKey}
            hasFavorite={favorites.has}
            onToggleFavorite={favorites.toggle}
            onCopy={handleCardCopy}
            onPreview={openPreview}
            t={t}
          />
        </main>
      </div>

      {selected && (
        <IconPreview
          icon={selected}
          accent={ACCENT_HEX[theme]}
          hasFavorite={favorites.has}
          onToggleFavorite={favorites.toggle}
          onClose={() => setSelected(null)}
          t={t}
        />
      )}
    </div>
  )
}
