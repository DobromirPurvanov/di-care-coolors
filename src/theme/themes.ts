export const THEMES = [
  {
    id: 'matching',
    name: 'Matching Palette',
    mode: 'Светла',
    description: 'Земно зелено, злато и кафяво от брошурата',
    palette: ['#D0C4AB', '#4D4637', '#CFA95F', '#A5CDC4', '#71978F'],
    background: '#D0C4AB',
  },
  {
    id: 'brown',
    name: 'Brown',
    mode: 'Тъмна',
    description: 'Тъмната корица на брошурата: кафяво, злато и зелено',
    palette: ['#14100D', '#C9A35C', '#DDBD82', '#4E6A61', '#FFE9B8'],
    background: '#14100D',
  },
] as const

export type ThemeId = (typeof THEMES)[number]['id']
export type ThemeMode = 'dark' | 'light'

export const DEFAULT_THEME: ThemeId = 'matching'

/* Тъмно/светло превключвателят в header-а сменя двете версии. */
export const DEFAULT_THEME_FOR_MODE: Record<ThemeMode, ThemeId> = {
  dark: 'brown',
  light: 'matching',
}

export function isThemeId(value: string | null): value is ThemeId {
  return THEMES.some(theme => theme.id === value)
}

export function getTheme(themeId: ThemeId) {
  return THEMES.find(theme => theme.id === themeId) ?? THEMES[0]
}

export function getThemeMode(themeId: ThemeId): ThemeMode {
  return getTheme(themeId).mode === 'Светла' ? 'light' : 'dark'
}
