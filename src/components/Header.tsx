import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Menu, X, Phone } from 'lucide-react'
import ScrollProgress from './ScrollProgress'
import BookingButton from './BookingButton'
import { getLenis, scrollToTarget } from '../lib/scroll'

// Z-скала на фиксираните слоеве (използва се тук и в другите компоненти):
//   10   съдържание (секции)
//   200  NoiseOverlay
//   1000 CookieConsent банер
//   1005 мобилно меню (НАД банера — иначе банерът покрива телефона в менюто)
//   1010 header (над менюто, за да остане X бутонът достъпен) и мобилният
//        detail-sheet на процедурите
//   2000 LoadingScreen
const navItems = [
  { label: 'Начало', href: '#hero' },
  { label: 'Процедури', href: '#procedures' },
  { label: 'Услуги', href: '#services' },
  { label: 'За нас', href: '#about' },
  { label: 'Апаратура', href: '#equipment' },
  { label: 'Контакти', href: '#contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('#hero')
  const lastY = useRef(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const firstItemRef = useRef<HTMLButtonElement>(null)
  const touchStartY = useRef<number | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const onHome = location.pathname === '/'

  // Smart header: крие се при скрол надолу, показва се при скрол нагоре
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 50)
      const delta = y - lastY.current
      if (y > 140 && delta > 6) setHidden(true)
      else if (delta < -6 || y <= 140) setHidden(false)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // На подстраница никой nav елемент не е „активен" — извежда се от route-а,
  // без да пипаме state (наблюдателят работи само на началната страница).
  const effectiveActive = onHome ? active : ''

  // Active section highlighting чрез IntersectionObserver (само на началната страница)
  useEffect(() => {
    if (!onHome) return
    const sections = navItems
      .map(i => document.querySelector<HTMLElement>(i.href))
      .filter((el): el is HTMLElement => !!el)

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`)
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [onHome])

  // Заключваме фоновия скрол, докато мобилното меню е отворено; управляваме
  // фокуса (в менюто при отваряне, обратно на бутона при затваряне) и Esc.
  useEffect(() => {
    const lenis = getLenis()
    if (menuOpen) {
      lenis?.stop()
      document.documentElement.classList.add('mobile-menu-open')
      const id = requestAnimationFrame(() => firstItemRef.current?.focus({ preventScroll: true }))
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMenuOpen(false)
      }
      window.addEventListener('keydown', onKey)
      return () => {
        cancelAnimationFrame(id)
        window.removeEventListener('keydown', onKey)
        document.documentElement.classList.remove('mobile-menu-open')
      }
    }
    document.documentElement.classList.remove('mobile-menu-open')
    lenis?.start()
  }, [menuOpen])

  // Лек focus trap: Tab циклира между елементите на отвореното меню + X бутона.
  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !menuRef.current) return
    const focusables = [
      ...menuRef.current.querySelectorAll<HTMLElement>('button, a'),
      ...(burgerRef.current ? [burgerRef.current] : []),
    ]
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const current = document.activeElement as HTMLElement | null
    if (e.shiftKey && current === first) {
      e.preventDefault()
      last.focus({ preventScroll: true })
    } else if (!e.shiftKey && current === last) {
      e.preventDefault()
      first.focus({ preventScroll: true })
    }
  }

  const closeMenu = () => {
    setMenuOpen(false)
    burgerRef.current?.focus({ preventScroll: true })
  }

  const handleNav = (href: string) => {
    setMenuOpen(false)
    // От подстраница първо се връщаме към началото, после скролваме до котвата.
    // Изчакваме менюто да освободи native scroll lock-а преди скрола.
    if (onHome) requestAnimationFrame(() => scrollToTarget(href))
    else navigate('/', { state: { scrollTo: href } })
  }

  // Swipe-down за затваряне на мобилното меню
  const onTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return
    const delta = e.changedTouches[0].clientY - touchStartY.current
    if (delta > 70) setMenuOpen(false)
    touchStartY.current = null
  }

  return (
    <>
      <header
        className="fixed -top-px inset-x-0 z-[1010] will-change-transform"
        style={{
          // 1px bleed + safe-area покритие премахват тънкия луфт над header-а
          // при iOS и при subpixel рендериране след show/hide transform.
          paddingTop: 'calc(1px + env(safe-area-inset-top))',
          backgroundColor: scrolled || menuOpen ? 'var(--glass-bg)' : 'transparent',
          backdropFilter: scrolled || menuOpen ? 'blur(20px) saturate(1.2)' : 'none',
          borderBottom: scrolled ? '1px solid var(--card-border)' : '1px solid transparent',
          transform: hidden && !menuOpen ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 400ms ease, background-color 500ms ease, border-color 500ms ease',
        }}
      >
        <ScrollProgress />
        <div className="flex items-center justify-between h-16 lg:h-[72px]" style={{ padding: '0 clamp(0.75rem, 4vw, 3rem)' }}>
          <button
            type="button"
            onClick={() => handleNav('#hero')}
            className="flex min-w-[44px] min-h-[44px] items-center justify-center gap-2 cursor-pointer"
            aria-label="Към началото"
          >
            <span className="theme-logo theme-logo-header" role="img" aria-label="Dr. Di Clinic" />
          </button>

          <nav className="hidden lg:flex items-center" style={{ gap: 'clamp(1.25rem, 2.5vw, 2.25rem)' }} aria-label="Основна навигация">
            {navItems.map(item => {
              const isActive = effectiveActive === item.href
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNav(item.href)}
                  className="relative min-h-[44px] text-xs tracking-[0.15em] uppercase cursor-pointer transition-colors duration-300 py-2"
                  style={{ color: isActive ? 'var(--text)' : 'color-mix(in srgb, var(--text) 72%, transparent)' }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 -bottom-[2px] h-[1px] w-full transition-transform duration-300"
                    style={{
                      background: 'var(--brand-gradient)',
                      transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left center',
                    }}
                  />
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <a
              href="tel:+359882708081"
              className="hidden md:flex min-h-[44px] items-center gap-2 px-5 py-2 rounded-full text-[11px] tracking-[0.15em] uppercase border transition-all duration-300 hover:border-[var(--accent)]/60 hover:text-[var(--accent-light)]"
              style={{ borderColor: 'color-mix(in srgb, var(--text) 45%, transparent)', color: 'var(--text)' }}
              aria-label="Обади се на клиниката"
            >
              <Phone size={13} aria-hidden="true" />
              Обади се
            </a>
            <BookingButton
              variant="primary"
              className="hidden md:inline-flex min-h-[44px] px-5 py-2 text-[11px] tracking-[0.15em] uppercase font-medium"
              aria-label="Запази час онлайн"
            >
              Запази час
            </BookingButton>
            {/* Компактен CTA за мобилни — основното действие не бива да се
                крие само в хамбургер менюто. */}
            <BookingButton
              variant="primary"
              className="md:hidden inline-flex px-3 min-[360px]:px-4 min-h-[44px] text-[10px] tracking-[0.1em] uppercase font-medium whitespace-nowrap"
              aria-label="Запази час онлайн"
            >
              <span className="min-[360px]:hidden">Запази</span>
              <span className="hidden min-[360px]:inline">Запази час</span>
            </BookingButton>
            <button
              ref={burgerRef}
              onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
              className="lg:hidden w-11 h-11 flex-none flex items-center justify-center rounded-full"
              style={{ border: '1px solid color-mix(in srgb, var(--text) 15%, transparent)' }}
              aria-label={menuOpen ? 'Затвори менюто' : 'Отвори менюто'}
              aria-expanded={menuOpen}
            >
              <span
                className="inline-flex"
                style={{ transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 400ms ease' }}
              >
                {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — z-[1005]: над cookie банера (1000), под header-а (1010).
          visibility: hidden при затворено меню маха елементите от tab-реда
          (без ръчно жонглиране с tabIndex). */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-[1005] flex flex-col items-center justify-start gap-3 min-[390px]:gap-5 sm:gap-8 overflow-y-auto overscroll-contain px-6 lg:hidden"
        style={{
          clipPath: menuOpen ? 'circle(150% at 95% 5%)' : 'circle(0% at 95% 5%)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(30px) saturate(1.1)',
          WebkitBackdropFilter: 'blur(30px) saturate(1.1)',
          visibility: menuOpen ? 'visible' : 'hidden',
          transition: menuOpen
            ? 'clip-path 500ms ease, visibility 0s'
            : 'clip-path 400ms ease, visibility 0s 400ms',
          pointerEvents: menuOpen ? 'auto' : 'none',
          paddingTop: 'calc(5.5rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onKeyDown={onMenuKeyDown}
        aria-hidden={!menuOpen}
      >
        {navItems.map((item, i) => (
          <button
            key={item.href}
            ref={i === 0 ? firstItemRef : undefined}
            type="button"
            onClick={() => handleNav(item.href)}
            className="flex min-h-[44px] items-center text-lg sm:text-xl tracking-[0.16em] sm:tracking-[0.2em] uppercase font-light cursor-pointer transition-all duration-300"
            style={{
              color: effectiveActive === item.href ? 'var(--accent-light)' : 'var(--text)',
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
              transitionDelay: menuOpen ? `${i * 80 + 120}ms` : '0ms',
            }}
            aria-current={effectiveActive === item.href ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}

        {/* Основен CTA + телефон вътре в мобилното меню */}
        <BookingButton
          variant="primary"
          onClick={() => setMenuOpen(false)}
          className="mt-1 sm:mt-4 inline-flex min-h-[44px] px-8 py-3 text-xs tracking-[0.18em] uppercase font-medium"
          style={{
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 300ms ease, transform 300ms ease, background 300ms ease',
            transitionDelay: menuOpen ? `${navItems.length * 80 + 120}ms` : '0ms',
          }}
          aria-label="Запази час онлайн"
        >
          Запази час
        </BookingButton>
        <a
          href="tel:+359882708081"
          onClick={() => setMenuOpen(false)}
          className="inline-flex min-h-[44px] items-center text-sm tracking-[0.12em] transition-colors duration-300 hover:text-[var(--accent-light)]"
          style={{
            color: 'color-mix(in srgb, var(--text) 70%, transparent)',
            opacity: menuOpen ? 1 : 0,
            transition: 'opacity 300ms ease',
            transitionDelay: menuOpen ? `${navItems.length * 80 + 200}ms` : '0ms',
          }}
        >
          +359 88 270 8081
        </a>

        <span
          className="hidden min-[360px]:block mt-1 sm:mt-4 text-center text-[10px] tracking-[0.24em] sm:tracking-[0.3em] uppercase"
          style={{
            color: 'color-mix(in srgb, var(--text) 25%, transparent)',
            opacity: menuOpen ? 1 : 0,
            transition: 'opacity 300ms ease',
            transitionDelay: menuOpen ? `${navItems.length * 80 + 150}ms` : '0ms',
          }}
        >
          Плъзнете надолу за затваряне
        </span>
      </div>
    </>
  )
}
