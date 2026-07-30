import { Link } from 'react-router'
import { ArrowLeft, Compass } from 'lucide-react'
import { categories } from '../data/procedures'
import { usePageMeta } from '../lib/seo'

/**
 * Страница „не е намерено".
 *
 * Преди и непознат маршрут (`path="*"`), и непозната услуга водеха към
 * <Navigate to="/" replace />: потребител със стар линк се озоваваше на
 * началната страница без обяснение и без да разбере, че линкът е счупен.
 * Мълчаливото пренасочване изглежда като бъг, а не като отговор.
 */
export default function NotFound({
  title = 'Страницата не съществува',
  description = 'Възможно е линкът да е остарял или сгрешен. Ето откъде можете да продължите.',
  path = '/404',
}: {
  title?: string
  description?: string
  path?: string
}) {
  usePageMeta({
    title: `${title} | Dr. Di Clinic`,
    description: 'Страницата не е намерена. Разгледайте услугите на Dr. Di Clinic във Варна.',
    path,
    noindex: true,
  })

  return (
    <main
      className="relative z-10"
      style={{ padding: 'clamp(7rem, 16vh, 11rem) clamp(1rem, 4vw, 3rem) clamp(4rem, 9vh, 7rem)' }}
    >
      <div className="mx-auto text-center" style={{ maxWidth: '560px' }}>
        <Compass size={30} aria-hidden="true" style={{ color: 'var(--color-action)' }} className="mx-auto" />
        <h1
          className="text-gradient font-serif-luxe mt-6 leading-[1.15]"
          style={{ fontSize: 'clamp(1.7rem, 4.5vw, 2.4rem)' }}
        >
          {title}
        </h1>
        <p className="mt-4" style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
          {description}
        </p>

        <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
          {categories.map(c => (
            <li key={c.id}>
              <Link to={`/uslugi/${c.slug}`} className="proc-chip">
                {c.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/"
          className="mt-9 inline-flex min-h-[48px] items-center gap-2 px-7 rounded-full text-[11px] tracking-[0.16em] uppercase font-medium transition-all duration-300 hover:bg-[var(--color-action-hover)]"
          style={{ background: 'var(--color-action)', color: 'var(--color-on-action)' }}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Към началната страница
        </Link>
      </div>
    </main>
  )
}
