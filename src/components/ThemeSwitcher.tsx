import { useEffect, useRef, useState } from 'react'
import { Check, Palette, X } from 'lucide-react'
import { useTheme } from '../theme/theme-context'
import { THEMES } from '../theme/themes'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const selectedTheme = THEMES.find(item => item.id === theme) ?? THEMES[0]

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="theme-switcher" data-open={open || undefined}>
      {open && (
        <div ref={panelRef} className="theme-switcher-panel" role="radiogroup" aria-label="Цветова версия">
          <div className="theme-switcher-heading">
            <div>
              <span className="theme-switcher-kicker">Цветови версии</span>
              <h2>Изберете палитра</h2>
            </div>
            <button type="button" className="theme-switcher-close" onClick={() => setOpen(false)} aria-label="Затвори палитрите">
              <X size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="theme-switcher-options">
            {THEMES.map(item => {
              const active = item.id === theme
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className="theme-option"
                  data-active={active || undefined}
                  onClick={() => {
                    setTheme(item.id)
                    setOpen(false)
                  }}
                >
                  <span className="theme-option-copy">
                    <strong>{item.name}</strong>
                    <small>{item.description}</small>
                  </span>
                  <span className="theme-swatches" aria-hidden="true">
                    {item.palette.map(color => (
                      <span key={color} style={{ backgroundColor: color }} />
                    ))}
                  </span>
                  {active && <Check className="theme-option-check" size={16} aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        className="theme-switcher-trigger"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Цветова версия: ${selectedTheme.name}`}
      >
        <Palette size={17} aria-hidden="true" />
        <span className="hidden sm:inline">{selectedTheme.name}</span>
        <span className="theme-trigger-swatches" aria-hidden="true">
          {selectedTheme.palette.slice(-3).map(color => (
            <span key={color} style={{ backgroundColor: color }} />
          ))}
        </span>
      </button>
    </div>
  )
}
