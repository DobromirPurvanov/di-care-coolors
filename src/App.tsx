import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from './components/Header'
import LoadingScreen from './components/LoadingScreen'
import NoiseOverlay from './components/NoiseOverlay'
import CookieConsent from './components/CookieConsent'
import Footer from './sections/Footer'
import Home from './pages/Home'
import ServicePage from './pages/ServicePage'
import Privacy from './pages/Privacy'
import { getLenis, setLenis } from './lib/scroll'
import { loadCalScript, watchCalModal } from './lib/booking'
import { getConsent, onConsentChange } from './lib/consent'

gsap.registerPlugin(ScrollTrigger)

// Code-splitting за тежкия WebGL фон
const ShaderBackground = lazy(() => import('./components/ShaderBackground'))

/** Връща скрола в началото при смяна на маршрут (освен ако не е поискан
    scrollTo, или ServicePage сам ще позиционира към конкретна процедура). */
function ScrollToTop() {
  const { pathname, state } = useLocation()
  useEffect(() => {
    const s = state as { scrollTo?: string; procedure?: string } | null
    if (s?.scrollTo || s?.procedure) return
    // Изчакваме новото съдържание да се монтира, после нулираме скрола —
    // иначе Lenis клампва към старата (по-голяма) височина на страницата.
    const id = requestAnimationFrame(() => {
      const lenis = getLenis()
      if (lenis) {
        lenis.resize()
        lenis.scrollTo(0, { immediate: true, force: true })
      }
      window.scrollTo(0, 0)
    })
    return () => cancelAnimationFrame(id)
  }, [pathname, state])
  return null
}

export default function App() {
  // Lenis smooth scroll, синхронизиран с GSAP ScrollTrigger
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const touchDevice = window.matchMedia('(pointer: coarse)').matches
    // На тъч устройства native scroll е по-предвидим, пести батерия и не се
    // конкурира с жестовете на браузъра. scroll.ts запазва плавните котви.
    if (reduced || touchDevice) return

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    setLenis(lenis)

    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  // Cal.com: watcher-ът на модала (спира фоновия скрол, докато popup-ът е
  // отворен) не зарежда трети страни и тръгва винаги. Самият embed скрипт се
  // зарежда предварително САМО при прието съгласие за всички бисквитки —
  // иначе се тегли чак при изричен клик на „Запази час" (в BookingButton).
  useEffect(() => {
    const lockNativeScroll = () => document.documentElement.classList.add('cal-modal-open')
    const unlockNativeScroll = () => document.documentElement.classList.remove('cal-modal-open')
    const stopWatching = watchCalModal({
      onOpen: () => {
        getLenis()?.stop()
        lockNativeScroll()
      },
      onClose: () => {
        getLenis()?.start()
        unlockNativeScroll()
      },
    })

    if (getConsent() === 'all') loadCalScript()
    const offConsent = onConsentChange(value => {
      if (value === 'all') loadCalScript()
    })

    return () => {
      stopWatching()
      offConsent()
      unlockNativeScroll()
    }
  }, [])

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-canvas)' }}>
      <LoadingScreen />
      <Suspense fallback={null}>
        <ShaderBackground />
      </Suspense>
      {/* Затъмняващ слой над анимирания фон — подобрява четимостта на текста
          навсякъде (седи между shader-а на z-0 и съдържанието на z-10). */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1, background: 'var(--color-page-overlay)' }}
      />
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/uslugi/:slug" element={<ServicePage />} />
        <Route path="/poveritelnost" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <CookieConsent />
      <NoiseOverlay />
    </div>
  )
}
