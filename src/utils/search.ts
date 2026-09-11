import type { IconMeta } from '../data/icons'

/**
 * Normalize Persian/Arabic variants so different keyboards match:
 * Arabic yeh/kaf → Persian forms, alef variants → ا, tashkeel/tatweel/ZWNJ stripped.
 * A no-op for pure-ASCII (English) queries.
 */
export function normalizeFa(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u064A\u0649]/g, '\u06CC') // ي ی → ی
    .replace(/\u0643/g, '\u06A9') // ك → ک
    .replace(/[\u0622\u0623\u0625]/g, '\u0627') // آ أ إ → ا
    .replace(/\u0629/g, '\u0647') // ة → ه
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // tashkeel + superscript alef + tatweel
    .replace(/\u200C/g, '') // ZWNJ
    .trim()
}

/** Per-icon normalized search text (name words + tags + Persian keywords), built once per metadata load. */
const haystacks = new WeakMap<IconMeta, string>()

function haystack(icon: IconMeta): string {
  let h = haystacks.get(icon)
  if (h === undefined) {
    h = normalizeFa(`${icon.name.replace(/[-_]/g, ' ')} ${icon.tags.join(' ')} ${icon.f ?? ''}`)
    haystacks.set(icon, h)
  }
  return h
}

/**
 * Ranked bilingual search over icon names, tags and Persian keywords.
 * Rank: exact name > name startsWith > name includes > tag/keyword includes.
 */
export function filterIcons(icons: IconMeta[], query: string): IconMeta[] {
  const q = normalizeFa(query)
  if (!q) return icons

  const results: Array<{ icon: IconMeta; score: number }> = []
  for (const icon of icons) {
    const name = icon.name
    let score = -1
    if (name === q) score = 0
    else if (name.startsWith(q)) score = 1
    else if (name.includes(q)) score = 2
    else if (haystack(icon).includes(q)) score = 3
    if (score >= 0) results.push({ icon, score })
  }

  results.sort((a, b) => a.score - b.score || a.icon.name.localeCompare(b.icon.name))
  return results.map((r) => r.icon)
}
