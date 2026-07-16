import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme/theme-context'

/*
 * Тъмно/светло превключвател — винаги видим в header-а. Смяната е „лампа":
 * новата версия залива страницата като разширяващ се кръг светлина от самия
 * бутон (View Transitions API + clip-path). Браузъри без поддръжка и
 * reduced-motion получават мигновена смяна.
 */
export default function ModeToggle({ className = '' }: { className?: string }) {
  const { mode, toggleMode } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dark = mode === 'dark'

  const handleClick = () => {
    const button = buttonRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduced || !button) {
      toggleMode()
      return
    }

    // Кръгът тръгва от центъра на бутона и стига най-далечния ъгъл.
    const rect = button.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => {
      // Синхронен render + useLayoutEffect → data-theme е сменен още тук.
      flushSync(() => toggleMode())
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: 'cubic-bezier(0.33, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      )
    }).catch(() => {
      // Ако преходът бъде прекъснат, темата така или иначе е сменена.
    })
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      className={`mode-toggle ${className}`.trim()}
      data-mode={mode}
      aria-label={dark ? 'Превключи към светла версия' : 'Превключи към тъмна версия'}
      title={dark ? 'Светла версия' : 'Тъмна версия'}
    >
      <span className="mode-toggle-icon mode-toggle-sun" aria-hidden="true">
        <Sun size={17} strokeWidth={1.8} />
      </span>
      <span className="mode-toggle-icon mode-toggle-moon" aria-hidden="true">
        <Moon size={16} strokeWidth={1.8} />
      </span>
    </button>
  )
}
