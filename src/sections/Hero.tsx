import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronDown, Mouse } from 'lucide-react'
import { scrollToTarget } from '../lib/scroll'

gsap.registerPlugin(ScrollTrigger)

const BRANDS = [
  { name: 'Fotona\u00AE', tip: 'Водеща световна лазерна технология' },
  { name: '4D Lifting', tip: 'Неинвазивен лифтинг без възстановяване' },
  { name: 'Ozone Therapy', tip: 'Детоксикация и клетъчно подмладяване' },
  { name: 'SmartXide', tip: 'CO2 лазер за прецизен ресърфейсинг' },
]

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const charsWrapRef = useRef<HTMLSpanElement>(null)
  const brandsRef = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      // При reduced-motion всичко се показва веднага, без движение.
      if (reduced) {
        const targets = [
          line1Ref.current, line2Ref.current, charsWrapRef.current,
          brandsRef.current, scrollHintRef.current,
          ...(brandsRef.current ? Array.from(brandsRef.current.querySelectorAll('.brand-item')) : []),
        ]
        gsap.set(targets, { opacity: 1, y: 0 })
        return
      }

      const tl = gsap.timeline({ delay: 1.3 }) // след loading screen-а

      tl.to(line1Ref.current, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, 0)
        .to(line2Ref.current, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, 0.2)

      // Разкриване на акцентния ред (единичен елемент — надежден gradient рендер)
      tl.to(charsWrapRef.current, {
        opacity: 1, y: 0,
        duration: 1,
        ease: 'power3.out',
      }, 0.5)

      tl.to(brandsRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.35')
      if (brandsRef.current) {
        tl.to(brandsRef.current.querySelectorAll('.brand-item'), {
          opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08,
        }, '<')
      }
      tl.to(scrollHintRef.current, { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.2')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const lastLine = 'ЗАПОЧВА ТУК'

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative z-10 flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ height: '100svh', minHeight: 'min(600px, 100svh)' }}
    >
      {/* Палитрен слой за дълбочина над анимирания shader фон */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'var(--paint-hero)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--color-action) 8%, transparent) 0%, transparent 55%)' }} />
      </div>

      <h1 className="relative w-full max-w-5xl px-4 sm:px-6 m-0" style={{ marginTop: '-2vh' }}>
        <span
          ref={line1Ref}
          className="block font-serif-luxe uppercase tracking-[0.12em] sm:tracking-[0.18em] leading-[1.12] opacity-0"
          style={{ fontSize: 'clamp(1.3rem, 6vw, 3.9rem)', fontWeight: 400, transform: 'translateY(50px)' }}
        >
          БЪДЕЩЕТО
        </span>
        <span
          ref={line2Ref}
          className="block font-serif-luxe uppercase tracking-[0.08em] sm:tracking-[0.14em] leading-[1.12] opacity-0"
          style={{
            fontSize: 'clamp(1.3rem, 6vw, 3.9rem)',
            fontWeight: 500,
            transform: 'translateY(50px)',
            textShadow: 'var(--text-shadow)',
          }}
        >
          НА ВАШАТА КРАСОТА
        </span>
        <span
          ref={charsWrapRef}
          className="block font-serif-luxe uppercase tracking-[0.09em] sm:tracking-[0.14em] leading-[1.12] text-gradient glow-text glow-pulse opacity-0"
          style={{ fontSize: 'clamp(1.3rem, 6vw, 3.9rem)', fontWeight: 600, transform: 'translateY(50px)' }}
        >
          {lastLine}
        </span>
      </h1>

      <div className="relative w-full px-4 sm:px-6">
        {/* декоративен контейнер за брандовете под заглавието */}

        <div
          ref={brandsRef}
          className="flex flex-wrap items-center justify-center gap-x-4 min-[360px]:gap-x-6 sm:gap-x-8 gap-y-3 opacity-0 mt-8 sm:mt-10 md:mt-14"
          style={{ transform: 'translateY(15px)' }}
        >
          {BRANDS.map(b => (
            <span key={b.name} className="brand-item group relative opacity-0" style={{ transform: 'translateY(10px)' }}>
              <span
                className="text-[10px] sm:text-[11px] tracking-[0.14em] sm:tracking-[0.2em] uppercase pb-1 cursor-default transition-all duration-300 group-hover:text-[var(--color-accent-text,var(--color-action-hover))]"
                style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}
              >
                {b.name}
              </span>
              {/* Мини tooltip */}
              <span
                role="tooltip"
                className="brand-tooltip pointer-events-none absolute left-1/2 bottom-full mb-3 -translate-x-1/2 whitespace-nowrap px-3 py-2 rounded-lg text-[10px] tracking-[0.06em] opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                style={{
                  background: 'var(--color-glass)',
                  border: '1px solid var(--color-card-border)',
                  color: 'var(--color-text-secondary)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {b.tip}
              </span>
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        ref={scrollHintRef}
        className="group absolute left-1/2 -translate-x-1/2 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1.5 opacity-0 cursor-pointer z-20"
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        onClick={() => scrollToTarget('#procedures')}
        aria-label="Скролни надолу към процедурите"
      >
        <Mouse size={18} className="transition-colors duration-300 group-hover:!text-[var(--color-action)]" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
        <span className="text-[9px] tracking-[0.4em] uppercase transition-colors duration-300 group-hover:text-[var(--color-accent-text,var(--color-action-hover))]" style={{ color: 'var(--color-text-muted)' }}>
          Scroll
        </span>
        <ChevronDown
          size={15}
          className="transition-colors duration-300 group-hover:!text-[var(--color-action)]"
          style={{ color: 'var(--color-text-muted)', animation: 'heroBounce 1.8s cubic-bezier(0.28, 0.84, 0.42, 1) infinite' }}
          aria-hidden="true"
        />
      </button>

      <style>{`
        @keyframes heroBounce {
          0%, 100% { transform: translateY(0); }
          45% { transform: translateY(10px); }
          65% { transform: translateY(4px); }
        }
      `}</style>
    </section>
  )
}
