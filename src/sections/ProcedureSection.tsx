import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Orbit, LayoutGrid } from 'lucide-react'
import ProcedureGrid from '../components/ProcedureGrid'

gsap.registerPlugin(ScrollTrigger)

// Code-splitting на тежката Three.js сфера
const ProcedureSphere = lazy(() => import('../components/ProcedureSphere'))

type View = 'sphere' | 'list'

function SphereFallback() {
  return (
    <div
      className="procedure-sphere flex items-center justify-center"
      aria-label="Зареждане на 3D сферата"
      role="status"
    >
      <span
        className="w-10 h-10 rounded-full animate-spin"
        style={{ border: '2px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderTopColor: 'var(--accent)' }}
        aria-hidden="true"
      />
    </div>
  )
}

export default function ProcedureSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const sphereWrapRef = useRef<HTMLDivElement>(null)
  const [isTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  )
  // Тежкият Three.js chunk (~530kB) се тегли чак когато секцията наближи
  // viewport-а, а не с първия paint на страницата (без IO → зареждаме веднага).
  const [nearViewport, setNearViewport] = useState(
    () => typeof IntersectionObserver === 'undefined'
  )
  // По подразбиране списъчният изглед на тъч устройства (там 30-те етикета на
  // сферата се застъпват/отрязват и трудно се уцелват) и при reduced-motion.
  // На десктоп с мишка стартираме с ефектната 3D сфера.
  const [view, setView] = useState<View>(() => {
    if (typeof window === 'undefined') return 'sphere'
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return coarse || reduced ? 'list' : 'sphere'
  })

  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setNearViewport(true)
          io.disconnect()
        }
      },
      { rootMargin: '600px 0px' }
    )
    io.observe(section)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([headerRef.current, sphereWrapRef.current], { opacity: 1, y: 0 })
        gsap.set(dividerRef.current, { scaleX: 1 })
        return
      }
      gsap.to(headerRef.current, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      })
      // Разделителят се "разтваря" от центъра при влизане
      gsap.fromTo(dividerRef.current,
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1.1, ease: 'power3.out', delay: 0.35,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      )
      gsap.to(sphereWrapRef.current, {
        opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: sphereWrapRef.current, start: 'top 85%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const hint =
    view === 'list'
      ? 'Разгледайте всички процедури, групирани по категория'
      : isTouch
        ? 'Докоснете процедура, за да отворите услугата'
        : 'Завъртете сферата и кликнете процедура за детайли'

  return (
    <section
      id="procedures"
      ref={sectionRef}
      className="procedure-section relative z-10"
    >
      <div className="max-w-6xl mx-auto">
        <div
          ref={headerRef}
          className="flex flex-col items-center opacity-0 mb-8 sm:mb-10"
          style={{ transform: 'translateY(30px)' }}
        >
          {/* Златна емблема */}
          <span className="theme-logo theme-logo-section mb-6" role="img" aria-label="Dr. Di Clinic" />

          {/* Заглавие с декоративни странични линии (линиите се крият на мобилно,
              за да не изтласкват заглавието извън екрана) */}
          <div className="flex items-center justify-center gap-5 sm:gap-8 w-full max-w-3xl">
            <span aria-hidden="true" className="hidden sm:block flex-1 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 40%, transparent))' }} />
            <h2
              className="text-gradient text-center font-light uppercase tracking-[0.15em]"
              style={{ fontSize: 'clamp(1.4rem, 3.2vw, 2.4rem)', lineHeight: 1.2 }}
            >
              Изберете процедура
            </h2>
            <span aria-hidden="true" className="hidden sm:block flex-1 h-[1px]" style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--accent) 40%, transparent), transparent)' }} />
          </div>

          {/* Анимиран златен разделител — разтваря се от центъра */}
          <div
            ref={dividerRef}
            aria-hidden="true"
            className="my-5 will-change-transform"
            style={{
              width: '72px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 90%, transparent), transparent)',
              transform: 'scaleX(0)',
              transformOrigin: 'center',
            }}
          />

          <p
            className="max-w-[30rem] text-center text-[11px] leading-relaxed tracking-[0.15em] sm:tracking-[0.22em] uppercase"
            style={{ color: 'color-mix(in srgb, var(--text) 70%, transparent)', textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}
          >
            {hint}
          </p>

          {/* Превключвател на изгледа: Сфера / Списък */}
          <div className="proc-toggle mt-7" role="group" aria-label="Изглед на процедурите">
            <button
              type="button"
              onClick={() => setView('sphere')}
              aria-pressed={view === 'sphere'}
              className={`proc-toggle-btn${view === 'sphere' ? ' is-active' : ''}`}
            >
              <Orbit size={14} aria-hidden="true" />
              Сфера
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
              className={`proc-toggle-btn${view === 'list' ? ' is-active' : ''}`}
            >
              <LayoutGrid size={14} aria-hidden="true" />
              Списък
            </button>
          </div>
        </div>

        <div
          ref={sphereWrapRef}
          className="opacity-0"
          style={{ transform: 'translateY(40px)' }}
        >
          {view === 'sphere' ? (
            nearViewport ? (
              <Suspense fallback={<SphereFallback />}>
                <ProcedureSphere />
              </Suspense>
            ) : (
              <SphereFallback />
            )
          ) : (
            <ProcedureGrid />
          )}
        </div>
      </div>
    </section>
  )
}
