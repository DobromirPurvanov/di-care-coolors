import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Cookie } from 'lucide-react'
import { getConsent, onConsentBannerOpen, setConsent, type Consent } from '../lib/consent'

/**
 * Банер за съгласие с бисквитки — показва се при първо посещение (или отново
 * през „Настройки на бисквитките" във футъра). Изборът реално управлява
 * зареждането на вградените услуги (Cal.com календар, Google Maps) — вижте
 * src/lib/consent.ts.
 */
export default function CookieConsent() {
  // Лениво начално състояние — без setState в effect и без мигане на банера.
  const [open, setOpen] = useState(() => !getConsent())
  const [shown, setShown] = useState(false) // управлява входящата анимация
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Входяща анимация: изчакваме кадър, за да се задейства transition-ът.
  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [open])

  // Повторно отваряне от „Настройки на бисквитките" (GDPR: оттегляне/промяна).
  useEffect(() => {
    const off = onConsentBannerOpen(() => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
      setOpen(true)
    })
    return off
  }, [])

  function choose(value: Consent) {
    setConsent(value)
    setShown(false)
    // Изчакваме изходящата анимация, преди да демонтираме.
    closeTimer.current = setTimeout(() => setOpen(false), 400)
  }

  if (!open) return null

  return (
    <div
      role="region"
      aria-label="Съгласие за бисквитки"
      // z-index: под мобилното меню (вж. скалата в Header.tsx), над съдържанието.
      className="fixed inset-x-0 bottom-0 z-[1000] flex justify-center px-3 sm:px-4 pointer-events-none"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))', paddingTop: '0.5rem' }}
    >
      <div
        className="pointer-events-auto w-full max-w-2xl max-h-[calc(100svh-1.5rem)] overflow-y-auto overscroll-contain flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-6"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid var(--card-border)',
          borderLeft: '2px solid var(--accent)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
          borderRadius: '18px',
          transform: shown ? 'translateY(0)' : 'translateY(24px)',
          opacity: shown ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
        }}
      >
        <div className="flex items-start gap-3.5 min-w-0">
          <Cookie size={20} className="flex-none mt-[2px]" style={{ color: 'var(--accent-light)' }} aria-hidden="true" />
          <p className="text-[13px] leading-relaxed" style={{ color: 'color-mix(in srgb, var(--text) 75%, transparent)' }}>
            Използваме бисквитки за коректната работа на сайта. Вградените услуги
            (календар за резервации и карта) се зареждат само със съгласие или когато
            изрично ги използвате. Вижте{' '}
            <Link
              to="/poveritelnost"
              className="underline underline-offset-2 transition-colors hover:text-[var(--accent-light)]"
              style={{ color: 'color-mix(in srgb, var(--text) 95%, transparent)' }}
            >
              Политиката за поверителност
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-none flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => choose('essential')}
            className="w-full min-[420px]:w-auto whitespace-nowrap px-5 min-h-[44px] rounded-full text-[11px] tracking-[0.12em] uppercase transition-all duration-300 border"
            style={{ borderColor: 'color-mix(in srgb, var(--text) 45%, transparent)', color: 'var(--text)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent-light)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--text) 45%, transparent)'; e.currentTarget.style.color = 'var(--text)' }}
          >
            Само необходимите
          </button>
          <button
            type="button"
            onClick={() => choose('all')}
            className="w-full min-[420px]:w-auto whitespace-nowrap px-6 min-h-[44px] rounded-full text-[11px] tracking-[0.12em] uppercase font-medium transition-all duration-300"
            style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-light)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
          >
            Приемам
          </button>
        </div>
      </div>
    </div>
  )
}
