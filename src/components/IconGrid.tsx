import { useEffect, useMemo, useRef, useState } from 'react'
import { SearchX } from 'lucide-react'
import type { IconMeta } from '../data/icons'
import IconCard from './IconCard'
import type { Dict } from '../locales/en'

const CHUNK = 150

interface Props {
  icons: IconMeta[]
  loading: boolean
  error: string | null
  filterKey: string
  hasFavorite: (id: string) => boolean
  onToggleFavorite: (id: string) => void
  onCopy: (icon: IconMeta) => Promise<boolean>
  onPreview: (icon: IconMeta) => void
  t: Dict
}

export default function IconGrid({
  icons,
  loading,
  error,
  filterKey,
  hasFavorite,
  onToggleFavorite,
  onCopy,
  onPreview,
  t,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(CHUNK)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisibleCount(CHUNK)
  }, [icons])

  const visible = useMemo(() => icons.slice(0, visibleCount), [icons, visibleCount])

  // Progressive rendering — append a chunk while the sentinel is near the viewport.
  useEffect(() => {
    const root = scrollRef.current
    const el = sentinelRef.current
    if (!root || !el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((c) => Math.min(c + CHUNK, icons.length))
        }
      },
      { root, rootMargin: '600px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [icons, visibleCount])

  return (
    <div ref={scrollRef} className="grid-canvas min-h-0 flex-1 overflow-y-auto">
      {loading ? (
        <CenteredNote>{t.loading}</CenteredNote>
      ) : error ? (
        <CenteredNote>{t.loadError}</CenteredNote>
      ) : icons.length === 0 ? (
        <EmptyState t={t} />
      ) : (
        <div key={filterKey} className="animate-fade-in">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2.5 px-4 pb-10 pt-4 md:px-6">
            {visible.map((icon) => (
              <IconCard
                key={icon.id}
                icon={icon}
                isFavorite={hasFavorite(icon.id)}
                onToggleFavorite={onToggleFavorite}
                onCopy={onCopy}
                onPreview={onPreview}
                t={t}
              />
            ))}
          </div>
          {visibleCount < icons.length && <div ref={sentinelRef} className="h-px" />}
        </div>
      )}
    </div>
  )
}

function CenteredNote({ children }: { children: string }) {
  return <p className="py-28 text-center text-sm text-muted">{children}</p>
}

function EmptyState({ t }: { t: Dict }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-28 text-center">
      <SearchX size={26} className="text-muted/60" />
      <p className="text-sm font-medium">{t.noIcons}</p>
      <p className="text-xs text-muted">{t.tryAnother}</p>
    </div>
  )
}
