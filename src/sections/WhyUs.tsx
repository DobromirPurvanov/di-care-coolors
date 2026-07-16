import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Stethoscope, UserRound, Hourglass, ShieldCheck, Sparkles, Cpu } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// Стойностите на клиниката като „стълбове" — показани наведнъж в решетка,
// за да е секцията плътна и лесна за преглед (без scroll-jacking слайдшоу).
const pillars = [
  {
    icon: Stethoscope,
    title: 'Отвътре навън',
    text: 'Младостта започва с медицина. Не лекуваме само видимите признаци, а работим с причините им, чрез диагностика, клиничен опит и разбиране на процесите на стареене.',
  },
  {
    icon: UserRound,
    title: 'Само за вас',
    text: 'Не създаваме еднакви лица. Всеки план е съобразен с вашата анатомия, начин на живот и цели. Запазваме индивидуалността ви, вместо да я променяме.',
  },
  {
    icon: Hourglass,
    title: 'Красота, която остава',
    text: 'Целта ни не е временно подобрение, а дълготрайно запазване на качеството на кожата, жизнеността и доброто самочувствие.',
  },
  {
    icon: ShieldCheck,
    title: 'В сигурни ръце',
    text: 'Доверието започва с познание и прозрачност. Протоколите ни стъпват на международен опит, доказателствена медицина и внимателна преценка.',
  },
  {
    icon: Sparkles,
    title: 'Естествено сияние',
    text: 'Най-добрите резултати изглеждат естествено. Хората забелязват вашата свежест и увереност, а не процедурите зад тях.',
  },
  {
    icon: Cpu,
    title: 'Модерна грижа',
    text: 'Съчетаваме съвременни технологии, водещи устройства и регенеративна медицина със собствените си протоколи за лечение.',
  },
]

export default function WhyUs() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    // Без анимация при reduced-motion — картите просто са си видими.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cards = cardsRef.current.filter(Boolean)
    if (reduced || cards.length === 0) return

    // Началното скрито състояние се задава от JS (не в markup-а), така че при
    // проблем с ScrollTrigger съдържанието никога не остава трайно невидимо.
    // Per-card trigger като в Services/Equipment — груповият trigger със
    // gsap.from не изиграваше анимацията и секцията оставаше празна.
    const ctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0, y: 30 })
      cards.forEach((el, i) => {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: (i % 3) * 0.08,
          scrollTrigger: { trigger: el, start: 'top 90%' },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative z-10"
      style={{ padding: 'clamp(4.5rem, 10vh, 8rem) clamp(1rem, 4vw, 3rem)', background: 'var(--paint-section-secondary)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Въведение */}
        <div className="max-w-2xl">
          <p className="text-xs tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--color-accent-text, var(--color-action-hover))' }}>
            За нас
          </p>
          <h2 className="font-serif-luxe text-gradient leading-[1.12]" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
            Защо Dr. Di Clinic
          </h2>
          <div
            aria-hidden="true"
            className="mt-5 mb-6"
            style={{ width: '56px', height: '2px', background: 'var(--paint-brand)' }}
          />
          <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text-secondary)' }}>
            В Dr. Di Clinic гледаме на красотата през погледа на медицината. Съчетаваме диагностика,
            опит и внимание към детайла, за да се погрижим за кожата ви меко и осмислено. Всеки план е
            личен, а целта ни е естествен и траен резултат, който изглежда просто като по-отпочиналата версия на вас.
          </p>
        </div>

        {/* Стълбове */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-9 sm:mt-12">
          {pillars.map((p, i) => (
            <div
              key={i}
              ref={el => { if (el) cardsRef.current[i] = el }}
              className="pillar-card relative overflow-hidden rounded-2xl p-5 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-action)] hover:shadow-[var(--card-shadow)]"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)' }}
            >
              <span
                className="pillar-icon flex items-center justify-center w-12 h-12 rounded-full mb-5"
              >
                <p.icon size={22} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3 className="font-serif-luxe" style={{ fontSize: '20px', lineHeight: 1.3, color: 'var(--color-heading)' }}>
                {p.title}
              </h3>
              <p className="mt-3" style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
