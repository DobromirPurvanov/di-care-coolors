import { createContext, useContext } from 'react'
import type { ThemeId, ThemeMode } from './themes'

export type ThemeContextValue = {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
  /* Режим на текущата палитра + превключване тъмно ↔ светло (помни
     последната ползвана палитра за всеки режим). */
  mode: ThemeMode
  toggleMode: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
