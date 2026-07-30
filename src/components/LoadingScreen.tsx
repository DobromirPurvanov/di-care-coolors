import { useEffect, useState } from 'react'

/**
 * Минималистичен loading screen — златно лого с пулсираща анимация.
 * Показва се само при първото зареждане в сесията (навигацията в SPA-то и
 * презарежданията след това минават без него).
 *
 * БЕЗ минимално време на показване. Преди тук стоеше `minTime = 900ms` и
 * заедно с fade-а екранът държеше съдържанието скрито ~1.5s, което местеше
 * LCP-то на 1.68s ДОРИ на localhost (при нулева мрежа) — на реален телефон
 * това стават 3-4s, при праг на Google 2.5s. Единствената задача на екрана е
 * да скрие FOUT-а, затова сега чака само шрифтовете, с нисък таван.
 */
const SESSION_KEY = 'dicare-visited'
/** Таван на чакането за шрифтове — с font-display: swap текстът и без това
    се рисува с fallback, така че няма смисъл да държим екрана по-дълго. */
const FONTS_TIMEOUT_MS = 700
const FADE_MS = 380

function alreadyVisited(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export default function LoadingScreen() {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'gone'>(() =>
    alreadyVisited() ? 'gone' : 'visible'
  )

  useEffect(() => {
    if (phase !== 'visible') return
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* sessionStorage недостъпен — просто ще се покаже пак */
    }

    const fontsReady = 'fonts' in document ? document.fonts.ready : Promise.resolve()
    const fontsCapped = Promise.race([
      fontsReady,
      new Promise(res => setTimeout(res, FONTS_TIMEOUT_MS)),
    ])

    let fadeTimer: ReturnType<typeof setTimeout>
    fontsCapped.then(() => {
      setPhase('fading')
      fadeTimer = setTimeout(() => setPhase('gone'), FADE_MS)
    })
    return () => clearTimeout(fadeTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === 'gone') return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[2000] flex flex-col items-center justify-center"
      style={{
        background: 'var(--color-canvas)',
        opacity: phase === 'fading' ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: phase === 'fading' ? 'none' : 'auto',
      }}
    >
      <span className="theme-logo theme-logo-loader" role="img" aria-label="Dr. Di Clinic" />
      <div className="mt-6 flex items-center gap-2">
        <span
          className="text-[10px] tracking-[0.45em] uppercase"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Dr. Di Clinic
        </span>
      </div>
    </div>
  )
}
