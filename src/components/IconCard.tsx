import { memo, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Check, Copy, Heart, Maximize2 } from 'lucide-react'
import type { IconMeta } from '../data/icons'
import { COLLECTIONS } from '../data/collections'
import { loadSvgText } from '../utils/svg'
import type { Dict } from '../locales/en'

const collectionNames = new Map(COLLECTIONS.map((c) => [c.id, c.name]))

interface Props {
  icon: IconMeta
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onCopy: (icon: IconMeta) => Promise<boolean>
  onPreview: (icon: IconMeta) => void
  t: Dict
}

function IconCard({ icon, isFavorite, onToggleFavorite, onCopy, onPreview, t }: Props) {
  const [svg, setSvg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const handleCopy = async () => {
    const ok = await onCopy(icon)
    if (!ok) return
    setCopied(true)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 1500)
  }

  useEffect(() => {
    let cancelled = false
    loadSvgText(icon.file)
      .then((text) => {
        if (!cancelled) setSvg(text)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [icon.file])

  return (
    <div className="group relative flex flex-col items-center rounded-lg border border-line bg-surface transition-colors duration-150 ease-soft hover:border-line-bright">
      {/* Click target for opening the preview */}
      <button onClick={() => onPreview(icon)} className="absolute inset-0 rounded-lg" aria-label={`${icon.name} — ${t.preview}`} />

      <div className="pointer-events-none flex w-full flex-col items-center gap-2 px-3 pb-3 pt-4">
        <span className="flex h-9 w-9 items-center justify-center text-foreground/80 transition-[color,filter] duration-150 ease-soft group-hover:text-foreground group-hover:drop-shadow-glow">
          {svg ? (
            <span className="icon-svg block h-full w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <span className="h-full w-full animate-pulse rounded bg-surface-2" />
          )}
        </span>
        <span className="max-w-full truncate font-mono text-[11px]">{icon.name}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted">{collectionNames.get(icon.collection)}</span>
      </div>

      {/* Hover actions */}
      <div className="card-actions absolute end-1.5 bottom-1.5 z-10 flex items-center gap-1 opacity-0 transition-opacity duration-150 ease-soft focus-within:opacity-100 group-hover:opacity-100">
        <CardAction title={copied ? t.copied : t.copy} onClick={handleCopy} active={copied}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </CardAction>
        <CardAction title={t.favorites} onClick={() => onToggleFavorite(icon.id)} active={isFavorite}>
          <Heart size={12} className={isFavorite ? 'fill-current' : ''} />
        </CardAction>
        <CardAction title={t.preview} onClick={() => onPreview(icon)}>
          <Maximize2 size={12} />
        </CardAction>
      </div>

      {/* Favorite marker */}
      {isFavorite && (
        <span className="pointer-events-none absolute start-1.5 top-1.5 text-accent-text">
          <Heart size={11} className="fill-current" />
        </span>
      )}
    </div>
  )
}

function CardAction({
  title,
  onClick,
  active,
  children,
}: {
  title: string
  onClick: () => void
  active?: boolean
  children: ReactNode
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      className={
        'flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface/90 backdrop-blur-sm transition-[color,border-color,transform] duration-150 ease-soft active:scale-90 ' +
        (active ? 'text-accent-text' : 'text-muted hover:border-line-bright hover:text-foreground')
      }
    >
      {children}
    </button>
  )
}

export default memo(IconCard)
