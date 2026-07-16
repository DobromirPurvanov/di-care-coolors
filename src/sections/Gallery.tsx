import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/*
 * Галерия слайдър — снимките от брошурата на клиниката. Scroll-snap +
 * стрелки, без външни библиотеки. Вертикалният скрол на страницата остава
 * незасегнат (без data-lenis-prevent): колелото скролва страницата,
 * стрелките/суайпът движат слайдовете.
 */
const slides = [
  { src: '/images/gallery/gallery-1.jpg', alt: 'Козметична процедура с глинена маска за лице' },
  { src: '/images/gallery/gallery-2.jpg', alt: 'Естетична процедура за лице в клиниката' },
  { src: '/images/gallery/gallery-3.jpg', alt: 'Терапия за тяло с етерични масла' },
  { src: '/images/gallery/gallery-4.jpg', alt: 'Медицинска грижа и консултация' },
  { src: '/images/gallery/gallery-5.jpg', alt: 'Грижа за кожата на лицето' },
]

export default function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  // Активният слайд се извежда от позицията на скрола (работи и при суайп).
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const slideElements = Array.from(track.children) as HTMLElement[]
        if (!slideElements.length) return
        const center = track.scrollLeft + track.clientWidth / 2
        let best = 0
        let bestDist = Infinity
        slideElements.forEach((el, i) => {
          const mid = el.offsetLeft + el.offsetWidth / 2
          const dist = Math.abs(mid - center)
          if (dist < bestDist) { bestDist = dist; best = i }
        })
        setIndex(best)
      })
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const goTo = (target: number) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(slides.length - 1, target))
    const el = track.children[clamped] as HTMLElement | undefined
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // scrollIntoView с inline:center се разбира със scroll-snap: mandatory
    // (програмният scrollTo се прекъсваше от снапа); block:nearest пази
    // вертикалния скрол на страницата (Lenis) недокоснат.
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <section
      id="gallery"
      className="relative z-10"
      style={{ padding: 'clamp(4.5rem, 10vh, 8rem) 0', background: 'var(--paint-section-secondary)' }}
    >
      <div className="max-w-6xl mx-auto" style={{ padding: '0 clamp(1rem, 4vw, 3rem)' }}>
        <p className="text-xs tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--color-accent-text, var(--color-action-hover))' }}>
          Клиниката отблизо
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8 sm:mb-10">
          <h2 className="font-serif-luxe text-gradient leading-[1.12]" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
            Галерия
          </h2>

          {/* Навигация + брояч */}
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
        </div>
      </div>

      <div ref={trackRef} className="gallery-track" role="region" aria-label="Галерия със снимки от клиниката">
        {slides.map((slide, i) => (
          <figure key={slide.src} className="gallery-slide" data-active={i === index || undefined}>
            <img
              src={slide.src}
              alt={slide.alt}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </figure>
        ))}
      </div>

      {/* Точки за директен избор */}
      <div className="flex items-center justify-center gap-2 mt-6" role="tablist" aria-label="Избор на снимка">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Снимка ${i + 1}`}
            className="gallery-dot"
            data-active={i === index || undefined}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  )
}
