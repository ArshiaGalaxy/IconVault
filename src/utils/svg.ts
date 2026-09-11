const textCache = new Map<string, Promise<string>>()

const base = import.meta.env.BASE_URL

/** Fetch raw SVG text for an icon file (relative to public/icons/), deduped. */
export function loadSvgText(file: string): Promise<string> {
  let p = textCache.get(file)
  if (!p) {
    p = fetch(`${base}icons/${file}`).then((r) => {
      if (!r.ok) throw new Error(`Failed to load icon ${file}`)
      return r.text()
    })
    textCache.set(file, p)
    p.catch(() => textCache.delete(file))
  }
  return p
}

export interface SvgOptions {
  size?: number
  /** hex/any CSS color; omitted keeps currentColor */
  color?: string
  strokeWidth?: number
}

/**
 * Build a self-contained SVG string (for copy / download).
 * Live preview does NOT use this — it injects raw text and overrides via CSS.
 */
export function buildSvg(raw: string, opts: SvgOptions): string {
  const tagMatch = raw.match(/<svg[^>]*>/)
  if (!tagMatch) return raw

  let tag = tagMatch[0]

  if (opts.size) {
    if (/\swidth="/.test(tag)) tag = tag.replace(/\swidth="[^"]*"/, ` width="${opts.size}"`)
    else tag = tag.replace('<svg', `<svg width="${opts.size}"`)
    if (/\sheight="/.test(tag)) tag = tag.replace(/\sheight="[^"]*"/, ` height="${opts.size}"`)
    else tag = tag.replace('<svg', `<svg height="${opts.size}"`)
  }

  if (opts.strokeWidth) {
    if (/\sstroke-width="/.test(tag)) tag = tag.replace(/\sstroke-width="[^"]*"/, ` stroke-width="${opts.strokeWidth}"`)
    else tag = tag.replace('<svg', `<svg stroke-width="${opts.strokeWidth}"`)
  }

  let svg = raw.replace(tagMatch[0], tag)
  if (opts.color) svg = svg.replaceAll('currentColor', opts.color)
  return svg
}

/** Clipboard write with a textarea fallback for non-secure contexts. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

/** Trigger a local file download for an SVG string. */
export function downloadSvg(name: string, svg: string): void {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.svg`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
