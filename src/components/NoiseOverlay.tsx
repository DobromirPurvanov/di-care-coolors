/** Фин film-grain noise слой върху целия сайт за premium вид. */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export default function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{ backgroundImage: NOISE_SVG, opacity: 0.025 }}
    />
  )
}
