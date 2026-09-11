import type { ReactNode } from 'react'
import { Heart, LayoutGrid } from 'lucide-react'
import { COLLECTIONS } from '../data/collections'
import type { CollectionFilter } from '../hooks/useIcons'
import { formatNumber } from '../hooks/useLanguage'
import type { Lang } from '../hooks/useLanguage'
import type { Dict } from '../locales/en'

interface Props {
  t: Dict
  lang: Lang
  collection: CollectionFilter
  onCollection: (c: CollectionFilter) => void
  favoritesOnly: boolean
  onFavoritesOnly: (v: boolean) => void
  counts: Record<string, number>
  favCount: number
  mobileOpen: boolean
  onCloseMobile: () => void
}

export default function Sidebar(props: Props) {
  const { mobileOpen, onCloseMobile } = props

  const body = (onSelect: () => void) => <Body {...props} onSelect={onSelect} />

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-52 shrink-0 flex-col border-e border-line px-3 py-4 md:flex">
        {body(() => {})}
      </aside>

      {/* Mobile drawer */}
      <div className={'fixed inset-0 z-40 md:hidden ' + (mobileOpen ? '' : 'pointer-events-none')}>
        <div
          onClick={onCloseMobile}
          className={
            'absolute inset-0 bg-black/50 transition-opacity duration-200 ease-soft ' +
            (mobileOpen ? 'opacity-100' : 'opacity-0')
          }
        />
        <aside
          className={
            'absolute inset-y-0 start-0 w-60 border-e border-line bg-background px-3 py-4 transition-transform duration-200 ease-soft ' +
            (mobileOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full')
          }
        >
          {body(onCloseMobile)}
        </aside>
      </div>
    </>
  )
}

function Body({
  t,
  lang,
  collection,
  onCollection,
  favoritesOnly,
  onFavoritesOnly,
  counts,
  favCount,
  onSelect,
}: Props & { onSelect: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      <NavItem
        active={!favoritesOnly && collection === 'all'}
        onClick={() => {
          onCollection('all')
          onFavoritesOnly(false)
          onSelect()
        }}
        icon={<LayoutGrid size={15} />}
        label={t.allIcons}
        count={counts.all ?? 0}
        lang={lang}
      />
      <NavItem
        active={favoritesOnly}
        onClick={() => {
          onFavoritesOnly(true)
          onSelect()
        }}
        icon={<Heart size={15} className={favoritesOnly ? 'fill-current' : ''} />}
        label={t.favorites}
        count={favCount}
        lang={lang}
      />

      <p className="mb-1 mt-6 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
        {t.collections}
      </p>
      {COLLECTIONS.map((c) => {
        const active = !favoritesOnly && collection === c.id
        return (
          <NavItem
            key={c.id}
            active={active}
            onClick={() => {
              onCollection(c.id)
              onFavoritesOnly(false)
              onSelect()
            }}
            icon={
              <span
                className={
                  'h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-150 ' +
                  (active ? 'bg-accent' : 'bg-line-bright group-hover:bg-muted')
                }
              />
            }
            label={c.name}
            count={counts[c.id] ?? 0}
            lang={lang}
          />
        )
      })}
    </nav>
  )
}

function NavItem({
  active,
  onClick,
  icon,
  label,
  count,
  lang,
}: {
  active: boolean
  onClick: () => void
  icon?: ReactNode
  label: string
  count: number
  lang: Lang
}) {
  return (
    <button
      onClick={onClick}
      className={
        'group flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ease-soft ' +
        (active
          ? 'bg-accent/10 text-accent-text shadow-glow-sm'
          : 'text-muted hover:bg-surface-2 hover:text-foreground')
      }
    >
      {icon}
      <span className="truncate">{label}</span>
      <span className="ms-auto font-mono text-[11px] opacity-70">{formatNumber(count, lang)}</span>
    </button>
  )
}
