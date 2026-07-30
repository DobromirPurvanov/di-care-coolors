import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Quote, Star, ExternalLink } from 'lucide-react'
import SectionHeading from '../components/SectionHeading'
import { testimonials, aggregateRating } from '../data/clinic'

gsap.registerPlugin(ScrollTrigger)

/**
 * Социално доказателство — единствената от големите конверсионни секции, която
 * липсваше напълно. Рендира се само при реални отзиви от src/data/clinic.ts.
 *
 * Звездите НЕ носят информация сами: до тях винаги стои число („4 / 5"), за да
 * е достъпно и за екранен четец, и за потребител, който не различава цветовете.
 */
export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (testimonials.length === 0) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.tm-card')
      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0 })
        return
      }
      cards.forEach((el, i) => {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: (i % 3) * 0.1,
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  if (testimonials.length === 0) return null

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="section-shell relative z-10"
      style={{ background: 'var(--paint-section-secondary)' }}
    >
      <div className="section-inner">
        <SectionHeading
          eyebrow="Отзиви"
          title="Какво казват пациентите"
          lead={
            aggregateRating
              ? `Средна оценка ${aggregateRating.value} от 5 на база ${aggregateRating.count} отзива в ${aggregateRating.source}.`
              : undefined
          }
          align="center"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={`${t.author}-${i}`}
              className="tm-card relative flex flex-col rounded-2xl p-6 opacity-0"
              style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-card-border)',
                boxShadow: 'var(--card-shadow-rest)',
                transform: 'translateY(30px)',
              }}
            >
              <Quote size={20} aria-hidden="true" style={{ color: 'var(--color-action)', opacity: 0.55 }} />

              {t.rating !== undefined && (
                <p className="mt-4 flex items-center gap-1.5">
                  <span aria-hidden="true" className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star
                        key={s}
                        size={13}
                        strokeWidth={1.5}
                        style={{
                          color: 'var(--color-action)',
                          fill: s < Math.round(t.rating!) ? 'var(--color-action)' : 'transparent',
                        }}
                      />
                    ))}
                  </span>
                  <span className="tabular-nums" style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {t.rating} / 5
                  </span>
                </p>
              )}

              <blockquote className="mt-4 flex-1" style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
                {t.quote}
              </blockquote>

              <figcaption className="mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{t.author}</span>
                {(t.service || t.source) && (
                  <span className="block mt-1" style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {[t.service, t.source].filter(Boolean).join(' · ')}
                    {t.sourceUrl && (
                      <>
                        {' '}
                        <a
                          href={t.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-1 underline underline-offset-2 transition-colors hover:text-[var(--color-accent-text,var(--color-action-hover))]"
                          aria-label={`Оригиналният отзив от ${t.author} (отваря се в нов раздел)`}
                        >
                          оригинал
                          <ExternalLink size={10} aria-hidden="true" />
                        </a>
                      </>
                    )}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
