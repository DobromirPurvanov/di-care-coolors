import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_THEME,
  DEFAULT_THEME_FOR_MODE,
  getTheme,
  getThemeMode,
  isThemeId,
  type ThemeId,
  type ThemeMode,
} from './themes'
import { ThemeContext } from './theme-context'

const STORAGE_KEY = 'dicare-color-theme'
const modeStorageKey = (mode: ThemeMode) => `dicare-last-${mode}-theme`

function getInitialTheme(): ThemeId {
  if (typeof window === 'undefined') return DEFAULT_THEME

  const fromUrl = new URLSearchParams(window.location.search).get('theme')
  if (isThemeId(fromUrl)) return fromUrl

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isThemeId(stored)) return stored
  } catch {
    // localStorage may be unavailable in privacy mode.
  }

  return DEFAULT_THEME
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    const selectedTheme = getTheme(theme)
    root.dataset.theme = theme

    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    themeColor?.setAttribute('content', selectedTheme.background)

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
      // Памет per режим — суичът тъмно/светло връща последната палитра,
      // която потребителят е гледал в съответния режим.
      window.localStorage.setItem(modeStorageKey(getThemeMode(theme)), theme)
    } catch {
      // Persistence is a progressive enhancement.
    }

    const url = new URL(window.location.href)
    url.searchParams.set('theme', theme)
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
    window.dispatchEvent(new CustomEvent('dicare:themechange', { detail: theme }))
  }, [theme])

  const mode = getThemeMode(theme)

  const toggleMode = useCallback(() => {
    setTheme(current => {
      const targetMode: ThemeMode = getThemeMode(current) === 'dark' ? 'light' : 'dark'
      try {
        const remembered = window.localStorage.getItem(modeStorageKey(targetMode))
        if (isThemeId(remembered) && getThemeMode(remembered) === targetMode) return remembered
      } catch {
        // Пада се към палитрата по подразбиране за режима.
      }
      return DEFAULT_THEME_FOR_MODE[targetMode]
    })
  }, [])

  const value = useMemo(() => ({ theme, setTheme, mode, toggleMode }), [theme, mode, toggleMode])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
