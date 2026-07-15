export const THEMES = [
  {
    id: 'matching-gradient',
    name: 'Matching Gradient',
    description: 'Тъмно зелено, графит и нежно розово',
    palette: ['#102423', '#25424A', '#496074', '#7B7C9B', '#B698B8', '#F0B7CA'],
    background: '#102423',
  },
  {
    id: 'spot',
    name: 'Spot Palette',
    description: 'Горско зелено, топъл камък и крем',
    palette: ['#D0C4AB', '#998E77', '#FFEFCA', '#005B45'],
    background: '#005B45',
  },
  {
    id: 'matching',
    name: 'Matching Palette',
    description: 'Земни тонове, евкалипт и минерално зелено',
    palette: ['#D0C4AB', '#4D4637', '#B3AA99', '#A5CDC4', '#71978F'],
    background: '#4D4637',
  },
  {
    id: 'dust',
    name: 'Dust Palette',
    description: 'Прашен графит, морско стъкло и синьо-сиво',
    palette: ['#404846', '#80B5AA', '#647C76', '#677890'],
    background: '#404846',
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
