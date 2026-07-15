import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Zap, Sparkles, Droplets, Activity, type LucideIcon } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface Device {
  name: string
  desc: string
  features: string[]
  Icon: LucideIcon
}

const equipment: Device[] = [
  {
    name: 'Fotona Dynamis',
    desc: 'Многофункционална Nd:YAG и Er:YAG лазерна система за подмладяване, пилинг и лечение.',
    features: ['4D Lifting', 'Лазерен пилинг', 'Ресърфейсинг'],
    Icon: Zap,
  },
  {
    name: 'Fotona4D',
    desc: 'Комплексна система за 4D лифтинг и подмладяване на лице и тяло.',
    features: ['4D Лифтинг', 'Подмладяване', 'Стягане'],
    Icon: Sparkles,
  },
  {
    name: 'Medozon',
    desc: 'Медицински апарат за озонотерапия и детоксикация.',
    features: ['Автохемотерапия', 'Системна озонотерапия', 'Детоксикация'],
    Icon: Droplets,
  },
  {
    name: 'Fras 5',
    desc: 'Диагностична система за измерване на оксидативен стрес.',
    features: ['Антиоксидантен капацитет', 'Персонализирани терапии'],
    Icon: Activity,
  },
]

export default function Equipment() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.eq-card')
      if (reduced) {
        gsap.set([titleRef.current, ...cards], { opacity: 1, x: 0, y: 0 })
        return
      }
      gsap.to(titleRef.current, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })
      // Редуващ се stagger: нечетните идват отляво, четните отдясно
      cards.forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, x: i % 2 === 0 ? -44 : 44, y: 20 },
          {
            opacity: 1, x: 0, y: 0, duration: 0.8, ease: 'power3.out', delay: (i % 2) * 0.12,
            scrollTrigger: { trigger: el, start: 'top 88%' },
          }
        )
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="equipment"
      ref={sectionRef}
      className="relative z-10"
      style={{
        padding: 'clamp(4.5rem, 10vh, 8rem) clamp(1rem, 4vw, 3rem)',
        background: 'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--accent) 3%, transparent) 40%, transparent 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <h2
          ref={titleRef}
          className="text-center font-light uppercase tracking-[0.15em] opacity-0 mb-4"
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', transform: 'translateY(40px)' }}
        >
          Апаратура
        </h2>
        <p className="text-center text-xs tracking-[0.15em] uppercase mb-10 sm:mb-16" style={{ color: 'color-mix(in srgb, var(--text) 60%, transparent)' }}>
          Световно признати лазерни системи
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equipment.map((eq, i) => (
            <div
              key={i}
              className="eq-card group grid grid-cols-[84px_minmax(0,1fr)] sm:flex sm:flex-row overflow-hidden opacity-0 rounded-2xl border transition-all duration-[400ms] hover:border-[var(--accent)]/40 hover:-translate-y-[3px]"
              style={{
                background: 'color-mix(in srgb, var(--text) 4%, transparent)',
                borderColor: 'color-mix(in srgb, var(--text) 6%, transparent)',
                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'color-mix(in srgb, var(--text) 6%, transparent)'
                el.style.boxShadow = '0 12px 34px rgba(0,0,0,0.38)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'color-mix(in srgb, var(--text) 4%, transparent)'
                el.style.boxShadow = 'none'
              }}
            >
              <div
                className="min-w-0 sm:w-2/5 overflow-hidden flex items-center justify-center p-3 sm:p-4 border-r"
                style={{
                  background: 'radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--accent) 8%, transparent), color-mix(in srgb, var(--text) 2%, transparent))',
                  borderColor: 'color-mix(in srgb, var(--text) 5%, transparent)',
                }}
              >
                <span
                  className="flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-full transition-transform duration-500 group-hover:scale-110"
                  style={{ border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', background: 'color-mix(in srgb, var(--bg) 40%, transparent)' }}
                >
                  <eq.Icon className="w-6 h-6 sm:w-[34px] sm:h-[34px]" strokeWidth={1.4} aria-hidden="true" style={{ color: 'var(--accent-light)' }} />
                </span>
              </div>
              <div className="min-w-0 sm:w-3/5 p-5 sm:p-6 flex flex-col justify-center">
                <h3 className="font-light text-sm tracking-[0.1em] uppercase group-hover:text-[var(--accent-light)] transition-colors">
                  {eq.name}
                </h3>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: 'color-mix(in srgb, var(--text) 74%, transparent)' }}>
                  {eq.desc}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {eq.features.map((f, j) => (
                    <span
                      key={j}
                      className="text-[11px] px-2.5 py-1 uppercase border transition-all duration-300 group-hover:border-[var(--accent)]/60"
                      style={{
                        letterSpacing: '0.08em',
                        borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)',
                        color: 'color-mix(in srgb, var(--accent-light) 85%, transparent)',
                        background: 'transparent',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--accent) 8%, transparent)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
