export const THEMES = [
  {
    id: 'matching-gradient',
    name: 'Matching Gradient',
    mode: 'Тъмна',
    description: 'Тъмно зелено, графит и нежно розово',
    palette: ['#102423', '#25424A', '#496074', '#7B7C9B', '#B698B8', '#F0B7CA'],
    // Канвасът на темата (по-дълбок от палитрения тон, който е повърхност)
    background: '#0D1B1A',
  },
  {
    id: 'spot',
    name: 'Spot Palette',
    mode: 'Светла',
    description: 'Светъл крем с характерен зелен акцент',
    palette: ['#D0C4AB', '#998E77', '#FFEFCA', '#005B45'],
    background: '#FFEFCA',
  },
  {
    id: 'matching',
    name: 'Matching Palette',
    mode: 'Светла',
    description: 'Светла земна основа с евкалиптови детайли',
    palette: ['#D0C4AB', '#4D4637', '#B3AA99', '#A5CDC4', '#71978F'],
    background: '#D0C4AB',
  },
  {
    id: 'dust',
    name: 'Dust Palette',
    mode: 'Тъмна',
    description: 'Прашен графит, морско стъкло и синьо-сиво',
    palette: ['#404846', '#80B5AA', '#647C76', '#677890'],
    // Канвасът на темата (по-дълбок от палитрения графит, който е повърхност)
    background: '#2B3231',
  },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

export const DEFAULT_THEME: ThemeId = 'matching-gradient'

export function isThemeId(value: string | null): value is ThemeId {
  return THEMES.some(theme => theme.id === value)
}

export function getTheme(themeId: ThemeId) {
  return THEMES.find(theme => theme.id === themeId) ?? THEMES[0]
}
