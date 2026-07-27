import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'system', label: 'Système', icon: Monitor },
] as const

/**
 * Light / dark / system.
 *
 * `system` is kept as a real choice rather than an implicit default: someone
 * whose machine flips at dusk expects the app to follow, and someone who pins a
 * mode expects it to stay pinned.
 *
 * Renders nothing until mounted — on the server pass there is no resolved
 * theme, and highlighting the wrong option for a frame is worse than a beat of
 * emptiness.
 */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className={compact ? 'h-8 w-8' : 'h-9 w-full'} aria-hidden />
  }

  if (compact) {
    // resolvedTheme, not theme: on `system` the latter is neither light nor
    // dark, and the button would offer to switch to the mode already showing.
    const isDark = resolvedTheme === 'dark'

    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={isDark ? 'Passer en clair' : 'Passer en sombre'}
        aria-label={isDark ? 'Passer en clair' : 'Passer en sombre'}
        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Thème de l'interface"
      className="flex items-center gap-0.5 bg-slate-100 rounded-xl p-0.5"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon
        const isActive = theme === option.value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={option.label}
            onClick={() => setTheme(option.value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors',
              isActive
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default ThemeToggle
