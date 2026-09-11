/**
 * Copies SVG icons from the bundled npm packages into public/icons/<collection>/
 * and generates a compact metadata.json per collection.
 *
 * Usage: npm run icons:build [-- --force]
 */
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outRoot = join(root, 'public', 'icons')
const force = process.argv.includes('--force')

const licenseComment = /^(\s*<!--[\s\S]*?-->\s*)+/

/**
 * English → Persian keyword map for bilingual search (word-level).
 * Applied to icon name words + tag words at build time; values are
 * pre-normalized (Persian ی/ک, alef variants collapsed, no ZWNJ).
 */
const faDict = JSON.parse(await readFile(join(root, 'scripts', 'fa-dictionary.json'), 'utf8'))

function faForWords(words) {
  const out = []
  for (const w of words) {
    const key = w.toLowerCase()
    let value = faDict[key]
    if (!value && key.endsWith('s') && key.length > 2) value = faDict[key.slice(0, -1)] // naive de-plural
    if (value) out.push(...value.split(' '))
  }
  return [...new Set(out)]
}

/** Collection sources — add new collections here. */
const collections = [
  {
    id: 'lucide',
    svgDir: join(root, 'node_modules', 'lucide-static', 'icons'),
    tagsFile: join(root, 'node_modules', 'lucide-static', 'tags.json'),
  },
  {
    id: 'tabler',
    svgDir: join(root, 'node_modules', '@tabler', 'icons', 'icons', 'outline'),
    tagsFile: join(root, 'node_modules', '@tabler', 'icons', 'icons.json'),
  },
  {
    id: 'phosphor',
    svgDir: join(root, 'node_modules', '@phosphor-icons', 'core', 'assets', 'regular'),
  },
]

function deriveTags(name) {
  const parts = name.split('-').filter(Boolean)
  return parts.length > 1 ? parts : []
}

for (const { id, svgDir, tagsFile } of collections) {
  const metaFile = join(outRoot, id, 'metadata.json')
  if (!force && existsSync(metaFile)) {
    console.log(`[${id}] already built — skipping (pass --force to rebuild)`)
    continue
  }
  if (!existsSync(svgDir)) {
    console.error(`[${id}] source directory missing: ${svgDir}`)
    process.exitCode = 1
    continue
  }

  const outDir = join(outRoot, id)
  await mkdir(outDir, { recursive: true })

  let tagMap = null
  if (tagsFile && existsSync(tagsFile)) tagMap = JSON.parse(await readFile(tagsFile, 'utf8'))

  const files = (await readdir(svgDir)).filter((f) => f.endsWith('.svg')).sort()
  const icons = []

  for (const file of files) {
    const name = file.slice(0, -4)
    let svg = await readFile(join(svgDir, file), 'utf8')
    svg = svg.replace(licenseComment, '')
    await writeFile(join(outDir, file), svg)

    let tags = []
    let category = 'General'
    if (id === 'lucide' && tagMap) {
      tags = tagMap[name] ?? []
    } else if (id === 'tabler' && tagMap) {
      const entry = tagMap[name]
      if (entry) {
        category = entry.category || category
        tags = (entry.tags ?? []).map((t) => String(t))
      }
    } else if (id === 'phosphor') {
      tags = deriveTags(name)
    }

    const faWords = faForWords([...name.split('-'), ...tags.flatMap((t) => t.split(' '))])
    icons.push({
      id: `${id}-${name}`,
      name,
      collection: id,
      category,
      tags,
      ...(faWords.length ? { f: faWords.join(' ') } : {}),
      file: `${id}/${name}.svg`,
    })
  }

  await writeFile(metaFile, JSON.stringify({ collection: id, icons }))
  const withFa = icons.filter((i) => i.f).length
  console.log(`[${id}] ${icons.length} icons (${withFa} with Persian keywords) -> public/icons/${id}/`)
}
