import { useEffect, useState } from 'react'

/**
 * Минималистичен loading screen — златно лого с пулсираща анимация.
 * Показва се само при първото зареждане в сесията (навигацията в SPA-то и
 * презарежданията след това минават без него). Изчезва след като шрифтовете
 * са заредени + минимум 0.9s показване; чакането на шрифтовете е с таван от
 * 2.2s, за да не блокира сайта на бавна мрежа.
 */
const SESSION_KEY = 'dicare-visited'

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

    const minTime = new Promise(res => setTimeout(res, 900))
    const fontsReady = 'fonts' in document ? document.fonts.ready : Promise.resolve()
    const fontsCapped = Promise.race([fontsReady, new Promise(res => setTimeout(res, 2200))])

    let fadeTimer: ReturnType<typeof setTimeout>
    Promise.all([minTime, fontsCapped]).then(() => {
      setPhase('fading')
      fadeTimer = setTimeout(() => setPhase('gone'), 650)
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
        background: 'var(--bg)',
        opacity: phase === 'fading' ? 0 : 1,
        transition: 'opacity 600ms ease',
        pointerEvents: phase === 'fading' ? 'none' : 'auto',
      }}
    >
      <span className="theme-logo theme-logo-loader" role="img" aria-label="Dr. Di Clinic" />
      <div className="mt-6 flex items-center gap-2">
        <span
          className="text-[10px] tracking-[0.45em] uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          Dr. Di Clinic
        </span>
      </div>
    </div>
  )
}
