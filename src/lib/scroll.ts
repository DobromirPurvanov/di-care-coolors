import Lenis from 'lenis'

let lenis: Lenis | null = null

export function setLenis(instance: Lenis | null) {
  lenis = instance
}

export function getLenis() {
  return lenis
}

/** Плавен скрол до елемент/селектор — през Lenis, с fallback. */
export function scrollToTarget(target: string | HTMLElement, offset = -72) {
  if (lenis) {
    // force: true — иначе Lenis мълчаливо игнорира scrollTo, докато е спрян
    // (напр. отворено мобилно меню: затваряме + скролваме в същия клик,
    // а lenis.start() идва чак в effect след re-render).
    lenis.scrollTo(target, { offset, duration: 1.2, force: true })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  const top = window.scrollY + el.getBoundingClientRect().top + offset
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
}

/** Плавен скрол до конкретна позиция в пиксели. */
export function scrollToPosition(y: number) {
  if (lenis) {
    lenis.scrollTo(y, { duration: 1.1, force: true })
    return
  }
  window.scrollTo({ top: y, behavior: 'smooth' })
}
