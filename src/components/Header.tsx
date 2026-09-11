import { Menu, Moon, Sun } from 'lucide-react'
import type { Lang } from '../hooks/useLanguage'
import type { Theme } from '../hooks/useTheme'
import type { Dict } from '../locales/en'

interface Props {
  theme: Theme
  onToggleTheme: () => void
  lang: Lang
  onToggleLang: () => void
  onOpenSidebar: () => void
  t: Dict
}

export default function Header({ theme, onToggleTheme, lang, onToggleLang, onOpenSidebar, t }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3 md:px-5">
      <button
        onClick={onOpenSidebar}
        aria-label={t.collections}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors duration-150 ease-soft hover:bg-surface-2 hover:text-foreground md:hidden"
      >
        <Menu size={17} />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-lg leading-none text-accent drop-shadow-glow">✦</span>
        <h1 className="font-mono text-sm font-semibold tracking-tight">IconVault</h1>
      </div>

      <div className="ms-auto flex items-center gap-2">
        {/* Language */}
        <div className="flex items-center rounded-md border border-line p-0.5 text-[11px] font-medium">
          {(['fa', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={l !== lang ? onToggleLang : undefined}
              className={
                'rounded-sm px-2 py-1 transition-colors duration-150 ease-soft ' +
                (lang === l ? 'bg-accent/10 text-accent-text' : 'text-muted hover:text-foreground')
              }
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Theme */}
        <button
          onClick={onToggleTheme}
          aria-label={t.theme}
          title={t.theme}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors duration-150 ease-soft hover:bg-surface-2 hover:text-foreground"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  )
}
