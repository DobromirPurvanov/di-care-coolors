import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BadgeCheck, ExternalLink } from 'lucide-react'
import SectionHeading from '../components/SectionHeading'
import { team } from '../data/clinic'

gsap.registerPlugin(ScrollTrigger)

/**
 * „Кой ще се грижи за мен" — секцията, която липсваше изцяло.
 *
 * „За нас" описваше принципи (шест абстрактни стълба), но в нея нямаше нито
 * един човек: нито име, нито специалност, нито квалификация. За медицинска
 * клиника това е основната спирачка за доверие и дупка в E-E-A-T сигналите.
 *
 * Рендира се само когато в src/data/clinic.ts има реални хора — измислени
 * титли за реален лекар не се пишат.
 */
export default function Team() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (team.length === 0) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.team-card')
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

  if (team.length === 0) return null

  return (
    <section
      id="team"
      ref={sectionRef}
      className="section-shell relative z-10"
      style={{ background: 'var(--paint-section-primary)' }}
    >
      <div className="section-inner">
        <SectionHeading
          eyebrow="Екип"
          title="Кой ще се грижи за вас"
          lead="Зад всяка процедура стои конкретен лекар, с име и квалификация."
          align="center"
        />

        <div
          className={`grid gap-4 ${team.length === 1 ? 'max-w-2xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'}`}
        >
          {team.map(member => (
            <article
              key={member.name}
              className="team-card relative overflow-hidden rounded-2xl p-6 sm:p-7 opacity-0"
              style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-card-border)',
                boxShadow: 'var(--card-shadow-rest)',
                transform: 'translateY(30px)',
              }}
            >
              <div className="flex items-center gap-4">
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={`${member.name}, ${member.role}`}
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    className="w-20 h-20 flex-none rounded-full object-cover"
                    style={{ border: '1px solid var(--color-card-border)' }}
                  />
                ) : (
                  /* Без снимка показваме монограм — по-добре от счупена иконка
                     или от stock лице, което не е този лекар. */
                  <span
                    aria-hidden="true"
                    className="w-20 h-20 flex-none flex items-center justify-center rounded-full font-serif-luxe text-2xl"
                    style={{
                      background: 'var(--color-action-glow-soft)',
                      border: '1px solid var(--color-card-border)',
                      color: 'var(--color-heading)',
                    }}
                  >
                    {member.name.replace(/^д-р\s*/i, '').trim().charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="font-serif-luxe" style={{ fontSize: '20px', lineHeight: 1.25, color: 'var(--color-heading)' }}>
                    {member.name}
                  </h3>
                  <p className="mt-1" style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    {member.role}
                  </p>
                  {member.yearsOfPractice !== undefined && (
                    <p className="mt-1 tabular-nums" style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      {member.yearsOfPractice} години практика
                    </p>
                  )}
                </div>
              </div>

              {member.bio && (
                <p className="mt-5" style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
                  {member.bio}
                </p>
              )}

              {member.credentials && member.credentials.length > 0 && (
                <ul className="mt-5 flex flex-col gap-2.5">
                  {member.credentials.map(c => (
                    <li key={c} className="flex items-start gap-2.5" style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
                      <BadgeCheck size={15} aria-hidden="true" style={{ color: 'var(--color-action)', marginTop: '2px', flex: 'none' }} />
                      {c}
                    </li>
                  ))}
                </ul>
              )}

              {member.profileUrl && (
                <a
                  href={member.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-[11px] tracking-[0.14em] uppercase transition-colors hover:text-[var(--color-accent-text,var(--color-action-hover))]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Професионален профил
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
