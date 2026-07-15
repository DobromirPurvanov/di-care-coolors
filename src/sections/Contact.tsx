import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, CalendarClock, ArrowRight, ExternalLink } from 'lucide-react'
import ContactForm from '../components/ContactForm'
import BookingButton from '../components/BookingButton'
import { getConsent, onConsentChange } from '../lib/consent'

gsap.registerPlugin(ScrollTrigger)

const MAPS_QUERY = encodeURIComponent('ул. Любен Каравелов 71, Варна, България')
const MAPS_EMBED = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed&hl=bg&z=16`
const MAPS_LINK = `https://www.google.com/maps?q=${MAPS_QUERY}`

/** Работно време на клиниката (Европа/София): Пн–Пт 10–17, Сб 10–14, Нд затворено. */
function getClinicStatus(): { open: boolean } {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Sofia',
      weekday: 'short',
      hour: 'numeric',
      hour12: false,
    }).formatToParts(new Date())
    const weekday = parts.find(p => p.type === 'weekday')?.value ?? ''
    const hour = Number(parts.find(p => p.type === 'hour')?.value ?? -1)
    if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday)) return { open: hour >= 10 && hour < 17 }
    if (weekday === 'Sat') return { open: hour >= 10 && hour < 14 }
    return { open: false }
  } catch {
    return { open: false }
  }
}

const SOCIALS = [
  { icon: Instagram, name: 'Instagram', href: 'https://www.instagram.com/drdiclinic/' },
  { icon: Facebook, name: 'Facebook', href: 'https://www.facebook.com/DrDiClinic/' },
]

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const [status, setStatus] = useState<{ open: boolean } | null>(() => getClinicStatus())
  // GDPR: картата на Google се зарежда само при съгласие „всички бисквитки"
  // или при изрично натискане на „Покажи картата".
  const [mapAllowed, setMapAllowed] = useState(() => getConsent() === 'all')

  useEffect(() => onConsentChange(v => { if (v === 'all') setMapAllowed(true) }), [])

  useEffect(() => {
    const timer = setInterval(() => setStatus(getClinicStatus()), 60_000)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>('.ct-reveal')
      if (reduced) {
        gsap.set(targets, { opacity: 1, y: 0 })
        return
      }
      targets.forEach((el, i) => {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: (i % 2) * 0.1,
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
    }, sectionRef)

    return () => { clearInterval(timer); ctx.revert() }
  }, [])

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative z-10"
      style={{ padding: 'clamp(4.5rem, 10vh, 8rem) clamp(1rem, 4vw, 3rem)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Двуколонен layout: форма | карта */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Лява колона — заглавие + форма */}
          <div className="ct-reveal opacity-0 order-1" style={{ transform: 'translateY(40px)' }}>
            <div className="flex items-center gap-5 mb-3">
              <h2
                className="font-light uppercase tracking-[0.15em]"
                style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)' }}
              >
                Свържете се с нас
              </h2>
              <span aria-hidden="true" className="hidden sm:block flex-1 h-[1px]" style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--accent) 50%, transparent), transparent)' }} />
            </div>
            <p className="text-sm mb-8" style={{ color: 'color-mix(in srgb, var(--text) 70%, transparent)', lineHeight: 1.6 }}>
              Изберете свободен час директно в календара ни или ни оставете съобщение и ще се свържем с вас.
            </p>

            {/* Основен път: онлайн запазване на час в реално време */}
            <div
              className="mb-9 p-5 sm:p-6 rounded-2xl"
              style={{ border: '1px solid color-mix(in srgb, var(--accent) 28%, transparent)', background: 'color-mix(in srgb, var(--accent) 5%, transparent)' }}
            >
              <div className="flex items-start gap-3">
                <CalendarClock size={20} aria-hidden="true" style={{ color: 'var(--accent)', marginTop: '2px', flex: 'none' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>Запазете час онлайн</p>
                  <p className="text-[13px] mt-1 leading-relaxed" style={{ color: 'color-mix(in srgb, var(--text) 62%, transparent)' }}>
                    Вижте свободните часове в реално време и потвърдете за минута.
                  </p>
                </div>
              </div>
              <BookingButton
                variant="primary"
                className="inline-flex w-full sm:w-auto mt-4 min-h-[48px] px-7 py-3.5 text-[11px] tracking-[0.15em] uppercase font-medium"
              >
                Запази час онлайн
                <ArrowRight size={14} aria-hidden="true" />
              </BookingButton>
            </div>

            <p className="text-[11px] tracking-[0.16em] uppercase mb-5" style={{ color: 'var(--text-muted)' }}>
              Или ни оставете съобщение
            </p>
            <ContactForm />
          </div>

          {/* Дясна колона — Google Maps (на мобилно е под формата) */}
          <div className="ct-reveal opacity-0 order-2" style={{ transform: 'translateY(40px)' }}>
            <div
              className="w-full h-full overflow-hidden rounded-2xl"
              style={{ border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)', minHeight: '300px' }}
            >
              {mapAllowed ? (
                <iframe
                  title="Локация на Dr. Di Clinic, ул. Любен Каравелов 71, Варна"
                  src={MAPS_EMBED}
                  className="map-dark w-full"
                  style={{ border: 0, minHeight: '300px', height: '100%', display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                /* Placeholder до съгласие: адрес + изрично зареждане на картата */
                <div
                  className="w-full h-full flex flex-col items-center justify-center text-center gap-4 p-5 sm:p-8"
                  style={{ minHeight: '300px', background: 'color-mix(in srgb, var(--bg) 55%, transparent)' }}
                >
                  <MapPin size={26} aria-hidden="true" style={{ color: 'var(--accent-light)' }} />
                  <p className="text-sm font-light" style={{ color: 'color-mix(in srgb, var(--text) 80%, transparent)', lineHeight: 1.6 }}>
                    гр. Варна, ул. „Любен Каравелов" № 71, Партер
                  </p>
                  <p className="text-[12px] max-w-[300px]" style={{ color: 'color-mix(in srgb, var(--text) 55%, transparent)', lineHeight: 1.6 }}>
                    Картата се зарежда от Google Maps след вашето изрично действие.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setMapAllowed(true)}
                      className="inline-flex items-center gap-2 px-6 min-h-[44px] rounded-full text-[11px] tracking-[0.14em] uppercase font-medium transition-all duration-300 hover:bg-[var(--accent-light)]"
                      style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                    >
                      Покажи картата
                    </button>
                    <a
                      href={MAPS_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 min-h-[44px] px-4 text-[11px] tracking-[0.12em] uppercase transition-colors hover:text-[var(--accent-light)]"
                      style={{ color: 'color-mix(in srgb, var(--text) 75%, transparent)' }}
                    >
                      Отвори в Google Maps
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Контактни блокове */}
        <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden" style={{ background: 'color-mix(in srgb, var(--text) 6%, transparent)' }}>
          {[
            { icon: MapPin, label: 'Адрес', value: 'гр. Варна, ул. Любен Каравелов № 71, Партер', href: undefined as string | undefined },
            { icon: Phone, label: 'Телефон', value: '+359 882 708 081', href: 'tel:+359882708081' },
            { icon: Mail, label: 'Имейл', value: 'drdiclinic21@gmail.com', href: 'mailto:drdiclinic21@gmail.com' },
            { icon: Clock, label: 'Работно време', value: '', href: undefined },
          ].map((item, i) => (
            <div
              key={i}
              className="ct-reveal flex items-start gap-4 p-5 sm:p-6 lg:p-7 opacity-0"
              style={{ background: 'var(--bg)', transform: 'translateY(25px)' }}
            >
              <item.icon size={18} className="flex-none mt-[2px]" style={{ color: 'var(--accent-light)' }} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'color-mix(in srgb, var(--text) 55%, transparent)' }}>
                  {item.label}
                </p>
                {item.label === 'Работно време' ? (
                  <div className="text-sm font-light" style={{ color: 'color-mix(in srgb, var(--text) 80%, transparent)', lineHeight: 1.7 }}>
                    <p>Пон – Пет: 10:00 – 17:00</p>
                    <p>Събота: 10:00 – 14:00</p>
                    <p>Неделя: Затворено</p>
                    {status && (
                      <p className="flex items-center gap-2 mt-2 text-xs" aria-live="polite">
                        <span
                          aria-hidden="true"
                          className="w-2 h-2 rounded-full"
                          style={{ background: status.open ? 'var(--success)' : 'var(--error)', boxShadow: `0 0 8px ${status.open ? 'rgba(125,201,143,0.6)' : 'rgba(224,122,106,0.6)'}` }}
                        />
                        <span style={{ color: status.open ? 'var(--success)' : 'var(--error)' }}>
                          В момента: {status.open ? 'Отворено' : 'Затворено'}
                        </span>
                      </p>
                    )}
                  </div>
                ) : item.href ? (
                  <a
                    href={item.href}
                    className="inline-flex min-h-[44px] max-w-full items-center text-sm font-light break-words transition-colors duration-300 hover:text-[var(--accent-light)]"
                    style={{ color: 'color-mix(in srgb, var(--text) 80%, transparent)' }}
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-light" style={{ color: 'color-mix(in srgb, var(--text) 80%, transparent)', lineHeight: 1.6 }}>{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Социални мрежи */}
        <div className="ct-reveal mt-10 flex items-center gap-4 opacity-0" style={{ transform: 'translateY(20px)' }}>
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'color-mix(in srgb, var(--text) 55%, transparent)' }}>
            Последвайте ни
          </span>
          {SOCIALS.map(s => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-11 h-11 flex items-center justify-center rounded-full border transition-all duration-300 hover:border-[var(--accent)]/50"
              style={{ borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              aria-label={`Последвайте ни в ${s.name}`}
            >
              <s.icon size={18} className="transition-colors duration-300 group-hover:!text-[var(--accent)]" style={{ color: 'color-mix(in srgb, var(--text) 55%, transparent)' }} aria-hidden="true" />
              <span
                role="tooltip"
                className="social-tooltip pointer-events-none absolute left-1/2 bottom-full mb-2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1.5 text-[10px] tracking-[0.08em] opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', color: 'color-mix(in srgb, var(--text) 85%, transparent)' }}
              >
                {s.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
