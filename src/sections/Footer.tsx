import { ArrowUp, Instagram, Facebook } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router'
import { scrollToPosition, scrollToTarget } from '../lib/scroll'
import { openConsentBanner } from '../lib/consent'

const QUICK_LINKS = [
  { label: 'Начало', href: '#hero' },
  { label: 'Процедури', href: '#procedures' },
  { label: 'Услуги', href: '#services' },
  { label: 'За нас', href: '#about' },
  { label: 'Апаратура', href: '#equipment' },
  { label: 'Контакти', href: '#contact' },
]

export default function Footer() {
  const navigate = useNavigate()
  const onHome = useLocation().pathname === '/'

  // Котвите съществуват само на началната страница — от подстраница първо
  // навигираме натам, после скролваме.
  const goToAnchor = (href: string) => {
    if (onHome) scrollToTarget(href)
    else navigate('/', { state: { scrollTo: href } })
  }

  return (
    <footer
      className="relative z-10"
      style={{
        padding: 'clamp(3.5rem, 8vh, 4rem) clamp(1rem, 4vw, 3rem)',
        background: 'linear-gradient(180deg, color-mix(in srgb, var(--bg-elevated) 78%, transparent), color-mix(in srgb, var(--bg) 94%, transparent))',
      }}
    >
      {/* Gradient top border */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-full h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent 0%, var(--secondary) 30%, var(--accent) 50%, var(--accent-light) 70%, transparent 100%)' }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
          {/* Лого + социални */}
          <div className="flex flex-col items-center md:items-start gap-5">
            <div className="flex items-center gap-2">
              <span className="font-light text-sm tracking-[0.3em] uppercase text-[var(--text)]">Dr. Di</span>
              <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--accent-light)' }}>Clinic</span>
            </div>
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, name: 'Instagram', href: 'https://www.instagram.com/drdiclinic/' },
                { icon: Facebook, name: 'Facebook', href: 'https://www.facebook.com/DrDiClinic/' },
              ].map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 flex items-center justify-center rounded-full border transition-all duration-300 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/10"
                  style={{ borderColor: 'color-mix(in srgb, var(--text) 18%, transparent)' }}
                  aria-label={`${s.name} (отваря се в нов раздел)`}
                >
                  <s.icon size={16} style={{ color: 'color-mix(in srgb, var(--text) 70%, transparent)' }} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Бързи връзки */}
          <nav className="flex flex-col items-center md:items-start gap-3" aria-label="Бързи връзки">
            <span className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: 'color-mix(in srgb, var(--text) 50%, transparent)' }}>
              Навигация
            </span>
            {QUICK_LINKS.map(l => (
              <button
                key={l.href}
                type="button"
                onClick={() => goToAnchor(l.href)}
                className="inline-flex min-h-[44px] items-center text-xs tracking-[0.12em] uppercase cursor-pointer transition-colors duration-300 hover:text-[var(--accent-light)] text-left"
                style={{ color: 'color-mix(in srgb, var(--text) 70%, transparent)' }}
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Правни */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <span className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: 'color-mix(in srgb, var(--text) 50%, transparent)' }}>
              Информация
            </span>
            <Link to="/poveritelnost" className="inline-flex min-h-[44px] items-center text-xs tracking-[0.12em] transition-colors duration-300 hover:text-[var(--accent-light)]" style={{ color: 'color-mix(in srgb, var(--text) 70%, transparent)' }}>
              Политика за лични данни
            </Link>
            <button
              type="button"
              onClick={openConsentBanner}
              className="inline-flex min-h-[44px] items-center text-xs tracking-[0.12em] cursor-pointer transition-colors duration-300 hover:text-[var(--accent-light)] text-center md:text-left"
              style={{ color: 'color-mix(in srgb, var(--text) 70%, transparent)' }}
            >
              Настройки на бисквитките
            </button>
          </div>

          {/* Обратно към началото */}
          <button
            onClick={() => scrollToPosition(0)}
            className="group w-12 h-12 flex-none flex items-center justify-center rounded-full border transition-all duration-300 hover:border-[var(--accent)]/60 hover:-translate-y-1"
            style={{ borderColor: 'color-mix(in srgb, var(--text) 12%, transparent)' }}
            aria-label="Обратно към началото"
          >
            <ArrowUp size={17} className="transition-colors duration-300 group-hover:!text-[var(--accent)]" style={{ color: 'color-mix(in srgb, var(--text) 50%, transparent)' }} aria-hidden="true" />
          </button>
        </div>

        <p className="mt-12 text-center md:text-left text-[11px] tracking-wider" style={{ color: 'color-mix(in srgb, var(--text) 50%, transparent)' }}>
          © {new Date().getFullYear()} Dr. Di Clinic. Всички права запазени.
        </p>
      </div>
    </footer>
  )
}
