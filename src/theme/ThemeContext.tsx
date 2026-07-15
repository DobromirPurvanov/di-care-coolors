import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_THEME, getTheme, isThemeId, type ThemeId } from './themes'
import { ThemeContext } from './theme-context'

const STORAGE_KEY = 'dicare-color-theme'

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
    } catch {
      // Persistence is a progressive enhancement.
    }

    const url = new URL(window.location.href)
    url.searchParams.set('theme', theme)
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
    window.dispatchEvent(new CustomEvent('dicare:themechange', { detail: theme }))
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
