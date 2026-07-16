import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme/theme-context'

/*
 * Тъмно/светло превключвател — винаги видим в header-а. Сменя РЕЖИМА, като
 * помни последната палитра за всеки режим (самите палитри се избират от
 * панела долу вдясно). Иконата показва режима, към който води кликът.
 */
export default function ModeToggle({ className = '' }: { className?: string }) {
  const { mode, toggleMode } = useTheme()
  const dark = mode === 'dark'

  return (
    <button
      type="button"
      onClick={toggleMode}
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
