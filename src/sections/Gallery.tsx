import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SectionHeading from '../components/SectionHeading'

/*
 * Галерия слайдър — снимките от брошурата на клиниката. Scroll-snap +
 * стрелки, без външни библиотеки. Вертикалният скрол на страницата остава
 * незасегнат (без data-lenis-prevent): колелото скролва страницата,
 * стрелките/суайпът движат слайдовете.
 */
/*
 * Адаптивните варианти се генерират с `npm run images` (scripts/optimize-images.mjs)
 * и живеят в /images/gallery/r/. Слайдът е най-много 860px CSS ширина, а
 * оригиналите бяха 1600px JPEG — телефонът теглеше около 5 пъти повече
 * пиксели от нужното. AVIF сваля същия кадър от ~130KB на ~10KB.
 */
const WIDTHS = [440, 860, 1600]
const SIZES = '(max-width: 1100px) 78vw, 860px'

/** intrinsic размери — за коректно aspect-ratio и нулев CLS. */
const slides = [
  { base: 'gallery-1', w: 1600, h: 1492, alt: 'Козметична процедура с глинена маска за лице' },
  { base: 'gallery-2', w: 1600, h: 867, alt: 'Естетична процедура за лице в клиниката' },
  { base: 'gallery-3', w: 1600, h: 983, alt: 'Терапия за тяло с етерични масла' },
  { base: 'gallery-4', w: 1600, h: 549, alt: 'Медицинска грижа и консултация' },
  { base: 'gallery-5', w: 1600, h: 452, alt: 'Грижа за кожата на лицето' },
]

const srcset = (base: string, ext: 'avif' | 'jpg') =>
  WIDTHS.map(w => `/images/gallery/r/${base}-${w}.${ext} ${w}w`).join(', ')

export default function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const tweeningRef = useRef(false)
  const tweenRafRef = useRef(0)

  // Ръчен туийн само на track.scrollLeft: smooth scrollIntoView/scrollTo и
  // CSS scroll-snap се бият с Lenis (замразяват скрола на страницата).
  const tweenTo = (targetIndex: number) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(slides.length - 1, targetIndex))
    const el = track.children[clamped] as HTMLElement | undefined
    if (!el) return
    const targetLeft = Math.max(
      0,
      Math.min(track.scrollWidth - track.clientWidth, el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2)
    )
    const start = track.scrollLeft
    const delta = targetLeft - start
    if (Math.abs(delta) < 2) return
    cancelAnimationFrame(tweenRafRef.current)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      track.scrollLeft = targetLeft
      return
    }
    tweeningRef.current = true
    const duration = 420
    const t0 = performance.now()
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const step = (now: number) => {
      const progress = Math.min(1, (now - t0) / duration)
      track.scrollLeft = start + delta * easeOutCubic(progress)
      if (progress < 1) tweenRafRef.current = requestAnimationFrame(step)
      else tweeningRef.current = false
    }
    tweenRafRef.current = requestAnimationFrame(step)
  }

  // Активният слайд се извежда от позицията на скрола; след края на суайп
  // дебоунснат туийн прилепва най-близкия слайд към центъра (JS „snap").
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let raf = 0
    let snapTimer = 0
    const nearestIndex = () => {
      const slideElements = Array.from(track.children) as HTMLElement[]
      const center = track.scrollLeft + track.clientWidth / 2
      let best = 0
      let bestDist = Infinity
      slideElements.forEach((el, i) => {
        const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center)
        if (dist < bestDist) { bestDist = dist; best = i }
      })
      return best
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setIndex(nearestIndex()))
      if (!tweeningRef.current) {
        window.clearTimeout(snapTimer)
        snapTimer = window.setTimeout(() => tweenTo(nearestIndex()), 150)
      }
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      window.clearTimeout(snapTimer)
      cancelAnimationFrame(tweenRafRef.current)
    }
     
  }, [])

  const goTo = (target: number) => tweenTo(target)

  return (
    <section
      id="gallery"
      className="section-shell-bleed relative z-10"
      style={{ background: 'var(--paint-section-secondary)' }}
    >
      <div className="section-inner">
        {/* Eyebrow-ът беше „Клиниката отблизо", но кадрите са на процедури,
            не на пространството — обещанието не отговаряше на снимките. */}
        <SectionHeading
          eyebrow="Грижата отблизо"
          title="Галерия"
          aside={
            <div className="flex items-center gap-3">
              <span className="text-[11px] tracking-[0.2em] tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                {index + 1} / {slides.length}
              </span>
              <button
                type="button"
                className="gallery-nav-btn"
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                aria-label="Предишна снимка"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="gallery-nav-btn"
                onClick={() => goTo(index + 1)}
                disabled={index === slides.length - 1}
                aria-label="Следваща снимка"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          }
        />
      </div>

      {/* tabIndex=0: скролируем регион трябва да е достижим с клавиатура
          (WCAG 2.1.1). Стрелките местят слайдовете, вместо да скролват с
          пиксел — иначе клавиатурният потребител няма как да ги прелисти. */}
      <div
        ref={trackRef}
        className="gallery-track"
        role="region"
        aria-label="Галерия със снимки от клиниката"
        aria-roledescription="карусел"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1) }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1) }
          else if (e.key === 'Home') { e.preventDefault(); goTo(0) }
          else if (e.key === 'End') { e.preventDefault(); goTo(slides.length - 1) }
        }}
      >
        {slides.map((slide, i) => (
          <figure key={slide.base} className="gallery-slide" data-active={i === index || undefined}>
            <picture>
              <source type="image/avif" srcSet={srcset(slide.base, 'avif')} sizes={SIZES} />
              <img
                src={`/images/gallery/r/${slide.base}-860.jpg`}
                srcSet={srcset(slide.base, 'jpg')}
                sizes={SIZES}
                width={slide.w}
                height={slide.h}
                alt={slide.alt}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </picture>
          </figure>
        ))}
      </div>

      {/* Точки за директен избор. Нарочно НЕ са role="tab": табовете изискват
          свързан tabpanel през aria-controls, а тук няма панели — само скрол
          позиция. Обикновени бутони с aria-current казват истината. */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {slides.map((slide, i) => (
          <button
            key={slide.base}
            type="button"
            aria-current={i === index ? 'true' : undefined}
            aria-label={`Покажи снимка ${i + 1} от ${slides.length}`}
            className="gallery-dot"
            data-active={i === index || undefined}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  )
}
