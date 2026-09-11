import { Search, X } from 'lucide-react'
import { COLLECTIONS } from '../data/collections'
import type { CollectionFilter } from '../hooks/useIcons'
import { formatNumber } from '../hooks/useLanguage'
import type { Lang } from '../hooks/useLanguage'
import type { Dict } from '../locales/en'

interface Props {
  query: string
  onQuery: (q: string) => void
  collection: CollectionFilter
  onCollection: (c: CollectionFilter) => void
  resultCount: number
  lang: Lang
  t: Dict
}

export default function SearchBar({ query, onQuery, collection, onCollection, resultCount, lang, t }: Props) {
  const chips: Array<{ id: CollectionFilter; label: string }> = [
    { id: 'all', label: t.all },
    ...COLLECTIONS.map((c) => ({ id: c.id as CollectionFilter, label: c.name })),
  ]

  return (
    <div className="shrink-0 border-b border-line px-4 pb-3 pt-4 md:px-6">
      <div className="relative max-w-xl">
        <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          spellCheck={false}
          dir="auto"
          className="h-10 rtl:text-right w-full rounded-md border border-line bg-surface ps-9 pe-8 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-150 ease-soft placeholder:text-muted focus:border-accent/50 focus:shadow-glow-md"
        />
        {query !== '' && (
          <button
            onClick={() => onQuery('')}
            title={t.close}
            className="absolute end-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors duration-150 ease-soft hover:bg-surface-2 hover:text-foreground"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {chips.map((chip) => {
          const active = collection === chip.id
          return (
            <button
              key={chip.id}
              onClick={() => onCollection(chip.id)}
              className={
                'h-7 rounded-full border px-3 text-xs font-medium transition-[color,border-color,background-color] duration-150 ease-soft ' +
                (active
                  ? 'border-accent/50 bg-accent/10 text-accent-text'
                  : 'border-line text-muted hover:border-foreground/25 hover:text-foreground')
              }
            >
              {chip.label}
            </button>
          )
        })}
        <span className="ms-auto font-mono text-[11px] text-muted">{formatNumber(resultCount, lang)}</span>
      </div>
    </div>
  )
}
