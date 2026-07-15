import { useEffect, useRef } from 'react'

/** Тънка златна линия в горния край, показваща прогреса на скролване. */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="absolute top-0 left-0 w-full h-[2px] will-change-transform"
      style={{
        background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
        transform: 'scaleX(0)',
        transformOrigin: 'left center',
        boxShadow: '0 0 8px color-mix(in srgb, var(--accent) 50%, transparent)',
      }}
    />
  )
}
