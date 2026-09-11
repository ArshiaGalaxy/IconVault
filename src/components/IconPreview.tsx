import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Check, Copy, Download, Heart, X } from 'lucide-react'
import type { IconMeta } from '../data/icons'
import { COLLECTIONS } from '../data/collections'
import { buildSvg, copyText, downloadSvg, loadSvgText } from '../utils/svg'
import type { Dict } from '../locales/en'

interface Props {
  icon: IconMeta
  accent: string
  hasFavorite: (id: string) => boolean
  onToggleFavorite: (id: string) => void
  onClose: () => void
  t: Dict
}

export default function IconPreview({ icon, accent, hasFavorite, onToggleFavorite, onClose, t }: Props) {
  const [raw, setRaw] = useState('')
  const [size, setSize] = useState(48)
  const [stroke, setStroke] = useState(2)
  const [color, setColor] = useState('')
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | undefined>(undefined)
  const panelRef = useRef<HTMLElement | null>(null)

  const strokeSupported = icon.collection !== 'phosphor'
  const collectionName = COLLECTIONS.find((c) => c.id === icon.collection)?.name ?? icon.collection
  const favorite = hasFavorite(icon.id)
  const presetColors = ['#ffffff', '#000000', accent, '#f87171', '#60a5fa', '#fbbf24']

  useEffect(() => {
    let cancelled = false
    loadSvgText(icon.file)
      .then((text) => {
        if (!cancelled) setRaw(text)
      })
      .catch(() => {
        if (!cancelled) setRaw('')
      })
    return () => {
      cancelled = true
    }
  }, [icon.file])

  useEffect(() => {
    setCopied(false)
  }, [icon.id])

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  // Dialog focus: move focus in on open, restore on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => previous?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      // Minimal focus trap: wrap at the panel's first/last focusable element.
      const panel = panelRef.current
      if (!panel) return
      const focusables = panel.querySelectorAll<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])')
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const exportOpts = {
    size,
    color: color || undefined,
    strokeWidth: strokeSupported ? stroke : undefined,
  }

  const copy = async () => {
    const ok = await copyText(buildSvg(raw, exportOpts))
    if (!ok) return
    setCopied(true)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 1500)
  }

  // Live preview: inject raw SVG and override via CSS (instant, no string rebuild).
  const wrapperStyle = {
    color: color || 'var(--color-foreground)',
    width: size,
    height: size,
    ...(strokeSupported ? { '--icon-stroke': stroke } : {}),
  } as CSSProperties

  return (
    <div className="fixed inset-0 z-40">
      <div className="preview-backdrop absolute inset-0 bg-black/40" onClick={onClose} />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={icon.name}
        tabIndex={-1}
        className="preview-panel absolute inset-y-0 end-0 flex w-[min(340px,100vw)] flex-col border-s border-line bg-surface/80 inset-shadow-edge backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate font-mono text-[13px] font-semibold">{icon.name}</h2>
            <p className="mt-0.5 text-xs text-muted">
              {collectionName} · {icon.category}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(icon.id)}
              title={t.favorites}
              aria-label={t.favorites}
              className={
                'flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 ease-soft hover:bg-surface-2 ' +
                (favorite ? 'text-accent-text active:scale-90' : 'text-muted hover:text-foreground')
              }
            >
              <Heart size={14} className={favorite ? 'fill-current' : ''} />
            </button>
            <button
              onClick={onClose}
              title={t.close}
              aria-label={t.close}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors duration-150 ease-soft hover:bg-surface-2 hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Big icon */}
        <div className="relative flex items-center justify-center border-b border-line py-10">
          <div className="pointer-events-none absolute h-40 w-40 rounded-full bg-accent/5 blur-2xl" />
          {raw ? (
            <div
              style={wrapperStyle}
              className={'icon-svg relative drop-shadow-glow-lg ' + (strokeSupported ? 'icon-stroked' : '')}
              dangerouslySetInnerHTML={{ __html: raw }}
            />
          ) : (
            <div className="h-16 w-16 animate-pulse rounded bg-surface-2" />
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <Control label={t.size} value={`${size}px`}>
            <input
              type="range"
              min={16}
              max={128}
              step={1}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer"
            />
          </Control>

          {strokeSupported && (
            <Control label={t.stroke} value={String(stroke)}>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.5}
                value={stroke}
                onChange={(e) => setStroke(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer"
              />
            </Control>
          )}

          <Control label={t.color} value={color || undefined}>
            <div className="flex flex-wrap items-center gap-2">
              <button
                title={t.defaultColor}
                onClick={() => setColor('')}
                className={
                  'relative h-6 w-6 overflow-hidden rounded-full border bg-surface-2 transition-shadow duration-150 ' +
                  (color === '' ? 'border-accent ring-2 ring-accent/40' : 'border-line hover:border-foreground/30')
                }
              >
                <span className="absolute start-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-muted" />
              </button>
              {presetColors.map((c) => (
                <button
                  key={c}
                  title={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={
                    'h-6 w-6 rounded-full border transition-shadow duration-150 ' +
                    (color === c ? 'border-accent ring-2 ring-accent/40' : 'border-line hover:border-foreground/30')
                  }
                />
              ))}
              <input
                type="color"
                value={color || accent}
                onChange={(e) => setColor(e.target.value)}
                title={t.color}
                className="h-6 w-6 cursor-pointer rounded-full border border-line bg-transparent p-0"
              />
            </div>
          </Control>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 border-t border-line px-5 py-4">
          <button
            onClick={copy}
            disabled={!raw}
            className={
              'flex h-9 items-center justify-center gap-1.5 rounded-md border text-xs font-medium transition-[color,background-color,border-color,box-shadow] duration-150 ease-soft disabled:opacity-40 ' +
              (copied
                ? 'border-accent/40 bg-accent/15 text-accent-text'
                : 'border-transparent bg-accent text-on-accent shadow-glow-sm hover:bg-accent/90 hover:shadow-glow-md')
            }
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t.copied : t.copySvg}
          </button>
          <button
            onClick={() => downloadSvg(icon.name, buildSvg(raw, exportOpts))}
            disabled={!raw}
            className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-line text-xs font-medium transition-colors duration-150 ease-soft hover:bg-surface-2 disabled:opacity-40"
          >
            <Download size={14} />
            {t.download}
          </button>
        </div>
      </aside>
    </div>
  )
}

function Control({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-muted">{label}</span>
        {value && <span className="font-mono text-muted/80">{value}</span>}
      </div>
      {children}
    </div>
  )
}
