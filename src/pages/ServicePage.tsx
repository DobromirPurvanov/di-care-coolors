import { useEffect } from 'react'
import { useParams, useLocation, Link, Navigate } from 'react-router'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { categories, procedures } from '../data/procedures'
import { serviceContent, clinicPhilosophy } from '../data/services'
import BookingButton from '../components/BookingButton'
import { usePageMeta } from '../lib/seo'
import { getLenis, scrollToTarget } from '../lib/scroll'

export default function ServicePage() {
  const { slug } = useParams()
  const { state } = useLocation()
  const category = categories.find((c) => c.slug === slug)
  const content = category ? serviceContent[category.id] : null

  // Hook-овете стоят преди ранния return (правилата на React hooks).
  usePageMeta({
    title: category ? `${category.label} | Dr. Di Clinic` : 'Dr. Di Clinic',
    description: content
      ? `${content.tagline}. ${content.intro}`.slice(0, 158)
      : 'Клиника за естетика и красота във Варна.',
    path: category ? `/uslugi/${category.slug}` : '/',
  })

  // Ако идваме от клик върху конкретна процедура (3D сферата / списъка),
  // скролваме до нея и я маркираме за момент — иначе потребителят каца на
  // върха на категорията и трябва сам да я търси.
  //
  // Целият sequence (нулиране на пренесения скрол → плавно към процедурата)
  // живее тук: ScrollToTop в App нарочно пропуска този случай, защото неговият
  // отложен reset се състезаваше с anchor скрола и го убиваше при бавни кадри
  // (unmount на Three.js сцената).
  const targetProcedure = (state as { procedure?: string } | null)?.procedure
  useEffect(() => {
    if (!targetProcedure) return
    const lenis = getLenis()
    lenis?.resize()
    lenis?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)

    let clearHighlight: ReturnType<typeof setTimeout> | undefined
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(
        `li[data-proc="${CSS.escape(targetProcedure)}"]`
      )
      if (!el) return
      scrollToTarget(el, -110)
      el.classList.add('proc-highlight')
      clearHighlight = setTimeout(() => el.classList.remove('proc-highlight'), 2600)
    })
    return () => {
      cancelAnimationFrame(raf)
      if (clearHighlight) clearTimeout(clearHighlight)
    }
  }, [targetProcedure, slug])

  // Непозната услуга → обратно към началото.
  if (!category || !content) return <Navigate to="/" replace />

  const items = procedures.filter((p) => p.category === category.id)
  const extras = new Map((content.extras ?? []).map((e) => [e.match, e]))

  return (
    <main
      className="relative z-10"
      style={{ padding: 'clamp(6rem, 14vh, 10rem) clamp(1rem, 4vw, 3rem) clamp(4rem, 9vh, 7rem)' }}
    >
      <div className="mx-auto" style={{ maxWidth: '760px' }}>
        {/* Обратна навигация */}
        <Link
          to="/"
          state={{ scrollTo: '#services' }}
          className="inline-flex min-h-[44px] items-center gap-2 text-xs tracking-[0.14em] uppercase mb-6 transition-colors hover:text-[var(--accent-light)]"
          style={{ color: 'color-mix(in srgb, var(--text) 70%, transparent)' }}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Всички услуги
        </Link>

        {/* Четяща повърхност — спокоен фон над анимирания starfield */}
        <article
          style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--card-border)',
            borderRadius: '20px',
            boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
            padding: 'clamp(1.25rem, 4.5vw, 3.25rem)',
          }}
        >
          {/* Заглавие */}
          <header>
            <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--accent-light)' }}>
              {content.tagline}
            </p>
            <h1 className="text-gradient font-serif-luxe leading-[1.1]" style={{ fontSize: 'clamp(2rem, 5.5vw, 3rem)' }}>
              {category.label}
            </h1>
            <div
              aria-hidden="true"
              className="mt-5 mb-7"
              style={{ width: '56px', height: '2px', background: 'var(--brand-gradient)' }}
            />
            <p style={{ fontSize: '17px', lineHeight: 1.7, color: 'color-mix(in srgb, var(--text) 92%, transparent)' }}>
              {content.intro}
            </p>
          </header>

          {/* Обобщени предимства на услугата */}
          {content.highlights && content.highlights.length > 0 && (
            <ul className="mt-9 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
              {content.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3" style={{ fontSize: '15px', color: 'color-mix(in srgb, var(--text) 90%, transparent)' }}>
                  <Check size={16} aria-hidden="true" style={{ color: 'var(--accent)', marginTop: '3px', flex: 'none' }} />
                  {h}
                </li>
              ))}
            </ul>
          )}

          {/* Списък с процедури */}
          <section className="mt-12" aria-label="Процедури">
            <h2 className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--accent-light)' }}>
              Процедури
            </h2>
            <ul className="flex flex-col">
              {items.map((p, i) => {
                const extra = extras.get(p.title)
                return (
                  <li
                    key={p.title}
                    data-proc={p.title}
                    className="py-7"
                    style={{ borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--border)' }}
                  >
                    <h3 className="font-serif-luxe" style={{ fontSize: '21px', lineHeight: 1.3, color: 'var(--accent-soft)' }}>
                      {p.title}
                    </h3>
                    <p className="mt-2.5" style={{ fontSize: '15px', lineHeight: 1.65, color: 'color-mix(in srgb, var(--text) 82%, transparent)' }}>
                      {p.description}
                    </p>

                    {extra?.benefits && (
                      <ul className="mt-5 grid gap-x-7 gap-y-2.5 sm:grid-cols-2">
                        {extra.benefits.map((b) => (
                          <li key={b} className="flex items-start gap-2.5" style={{ fontSize: '14px', lineHeight: 1.5, color: 'color-mix(in srgb, var(--text) 82%, transparent)' }}>
                            <Check size={14} aria-hidden="true" style={{ color: 'var(--accent)', marginTop: '3px', flex: 'none' }} />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}

                    {extra?.note && (
                      <p
                        className="mt-5 pl-4"
                        style={{ fontSize: '14px', lineHeight: 1.6, color: 'color-mix(in srgb, var(--text) 72%, transparent)', borderLeft: '2px solid color-mix(in srgb, var(--accent) 45%, transparent)' }}
                      >
                        {extra.note}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Маркетинг послание */}
          {content.quote && (
            <blockquote
              className="mt-10 pl-6 font-serif-luxe italic"
              style={{ fontSize: '20px', lineHeight: 1.5, color: 'var(--text)', borderLeft: '3px solid var(--accent)' }}
            >
              {content.quote}
            </blockquote>
          )}

          {/* CTA */}
          <div className="mt-11 flex flex-col sm:flex-row sm:items-center gap-5">
            <BookingButton
              variant="primary"
              service={category.label}
              className="inline-flex w-full sm:w-auto min-h-[48px] px-7 py-3.5 text-xs tracking-[0.16em] uppercase font-medium"
            >
              Запази час
              <ArrowRight size={15} aria-hidden="true" />
            </BookingButton>
            <a
              href="tel:+359882708081"
              className="inline-flex min-h-[44px] items-center gap-2 text-sm tracking-[0.05em] transition-colors hover:text-[var(--accent-light)]"
              style={{ color: 'color-mix(in srgb, var(--text) 80%, transparent)' }}
            >
              Обади се: +359 88 270 8081
            </a>
          </div>
        </article>

        {/* Философска линия */}
        <p
          className="mt-10 font-serif-luxe italic text-center mx-auto"
          style={{
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'color-mix(in srgb, var(--text) 70%, transparent)',
            maxWidth: '560px',
            textShadow: '0 2px 24px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8)',
          }}
        >
          {clinicPhilosophy}
        </p>
      </div>
    </main>
  )
}
