import { useEffect, useMemo } from 'react'
import { useParams, useLocation, Link } from 'react-router'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { categories, procedures } from '../data/procedures'
import { serviceContent, clinicPhilosophy } from '../data/services'
import NotFound from './NotFound'
import BookingButton from '../components/BookingButton'
import PriceTable from '../components/PriceTable'
import JsonLd from '../components/JsonLd'
import { usePageMeta, SITE_URL } from '../lib/seo'
import { getLenis, scrollToTarget } from '../lib/scroll'

export default function ServicePage() {
  const { slug } = useParams()
  const { state } = useLocation()
  const category = categories.find((c) => c.slug === slug)
  const content = category ? serviceContent[category.id] : null

  // Hook-овете стоят преди ранния return (правилата на React hooks).
  usePageMeta({
    title: `${category?.label ?? ''} | Dr. Di Clinic`,
    description: content ? `${content.tagline}. ${content.intro}`.slice(0, 158) : '',
    path: `/uslugi/${category?.slug ?? ''}`,
    // При непозната услуга рендерът се поема от <NotFound />, който сам задава
    // мета таговете (и noindex). Ако и този hook работеше, щеше да ги презапише.
    enabled: !!category && !!content,
  })

  // Ако идваме от клик върху конкретна процедура (3D сферата / списъка),
  // скролваме до нея и я маркираме за момент — иначе потребителят каца на
  // върха на категорията и трябва сам да я търси.
  //
  // Целият sequence (нулиране на пренесения скрол → плавно към процедурата)
  // живее тук: ScrollToTop в App нарочно пропуска този случай, защото неговият
  // отложен reset се състезаваше с anchor скрола и го убиваше при бавни кадри
  // (unmount на Three.js сцената).
  const targetProcedure = (state as { procedure?: string } | null)?.procedure
  useEffect(() => {
    if (!targetProcedure) return
    const lenis = getLenis()
    lenis?.resize()
    lenis?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)

    let clearHighlight: ReturnType<typeof setTimeout> | undefined
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(
        `li[data-proc="${CSS.escape(targetProcedure)}"]`
      )
      if (!el) return
      scrollToTarget(el, -110)
      el.classList.add('proc-highlight')
      clearHighlight = setTimeout(() => el.classList.remove('proc-highlight'), 2600)
    })
    return () => {
      cancelAnimationFrame(raf)
      if (clearHighlight) clearTimeout(clearHighlight)
    }
  }, [targetProcedure, slug])

  const items = useMemo(
    () => (category ? procedures.filter((p) => p.category === category.id) : []),
    [category]
  )

  // Структурирани данни: услугата + трохите. Без тях Google вижда подстраниците
  // само като текст и не ги свързва с MedicalClinic-а от index.html.
  const structured = useMemo(() => {
    if (!category || !content) return null
    const url = `${SITE_URL}/uslugi/${category.slug}`
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'MedicalWebPage',
          '@id': url,
          url,
          name: `${category.label} | Dr. Di Clinic`,
          description: content.intro,
          inLanguage: 'bg-BG',
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Начало', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Услуги', item: `${SITE_URL}/#services` },
            { '@type': 'ListItem', position: 3, name: category.label, item: url },
          ],
        },
        {
          '@type': 'MedicalBusiness',
          name: 'Dr. Di Clinic',
          url: `${SITE_URL}/`,
          telephone: '+359882708081',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'ул. Любен Каравелов 71, Партер',
            addressLocality: 'Варна',
            postalCode: '9002',
            addressCountry: 'BG',
          },
          makesOffer: items.map((p) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'MedicalProcedure',
              name: p.title,
              description: p.description,
            },
          })),
        },
      ],
    }
  }, [category, content, items])

  // Непозната услуга: преди тук стоеше <Navigate to="/" replace /> — потребител
  // със стар или сгрешен линк се озоваваше на началната страница, без да
  // разбере какво се е случило. Сега казваме какво стана и предлагаме изход.
  if (!category || !content) {
    return (
      <NotFound
        title="Тази услуга не съществува"
        description="Възможно е линкът да е остарял или сгрешен. Всички наши направления са изброени по-долу."
        path={`/uslugi/${slug ?? ''}`}
      />
    )
  }

  const extras = new Map((content.extras ?? []).map((e) => [e.match, e]))
  const related = categories.filter((c) => c.id !== category.id).slice(0, 4)

  return (
    <main
      className="relative z-10"
      style={{ padding: 'clamp(6rem, 14vh, 10rem) clamp(1rem, 4vw, 3rem) clamp(4rem, 9vh, 7rem)' }}
    >
      {structured && <JsonLd id="service-jsonld" data={structured} />}
      <div className="mx-auto" style={{ maxWidth: '760px' }}>
        {/* Обратна навигация */}
        <Link
          to="/"
          state={{ scrollTo: '#services' }}
          className="inline-flex min-h-[44px] items-center gap-2 text-xs tracking-[0.14em] uppercase mb-6 transition-colors hover:text-[var(--color-accent-text,var(--color-action-hover))]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Всички услуги
        </Link>

        {/* Четяща повърхност — спокоен фон над анимирания starfield */}
        <article
          style={{
            background: 'var(--color-card)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--color-card-border)',
            borderRadius: '20px',
            boxShadow: 'var(--floating-shadow)',
            padding: 'clamp(1.25rem, 4.5vw, 3.25rem)',
          }}
        >
          {/* Заглавие */}
          <header>
            <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--color-accent-text, var(--color-action-hover))' }}>
              {content.tagline}
            </p>
            <h1 className="text-gradient font-serif-luxe leading-[1.1]" style={{ fontSize: 'clamp(2rem, 5.5vw, 3rem)' }}>
              {category.label}
            </h1>
            <div
              aria-hidden="true"
              className="mt-5 mb-7"
              style={{ width: '56px', height: '2px', background: 'var(--paint-brand)' }}
            />
            <p style={{ fontSize: '17px', lineHeight: 1.7, color: 'var(--color-text)' }}>
              {content.intro}
            </p>
          </header>

          {/* Обобщени предимства на услугата */}
          {content.highlights && content.highlights.length > 0 && (
            <ul className="mt-9 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
              {content.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3" style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>
                  <Check size={16} aria-hidden="true" style={{ color: 'var(--color-action)', marginTop: '3px', flex: 'none' }} />
                  {h}
                </li>
              ))}
            </ul>
          )}

          {/* Списък с процедури */}
          <section className="mt-12" aria-label="Процедури">
            <h2 className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--color-accent-text, var(--color-action-hover))' }}>
              Процедури
            </h2>
            <ul className="flex flex-col">
              {items.map((p, i) => {
                const extra = extras.get(p.title)
                return (
                  <li
                    key={p.title}
                    data-proc={p.title}
                    className="py-7"
                    style={{ borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--color-border)' }}
                  >
                    <h3 className="font-serif-luxe" style={{ fontSize: '21px', lineHeight: 1.3, color: 'var(--color-heading)' }}>
                      {p.title}
                    </h3>
                    <p className="mt-2.5" style={{ fontSize: '15px', lineHeight: 1.65, color: 'var(--color-text-secondary)' }}>
                      {p.description}
                    </p>

                    {extra?.benefits && (
                      <ul className="mt-5 grid gap-x-7 gap-y-2.5 sm:grid-cols-2">
                        {extra.benefits.map((b) => (
                          <li key={b} className="flex items-start gap-2.5" style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
                            <Check size={14} aria-hidden="true" style={{ color: 'var(--color-action)', marginTop: '3px', flex: 'none' }} />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}

                    {extra?.note && (
                      <p
                        className="mt-5 pl-4"
                        style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text-secondary)', borderLeft: '2px solid color-mix(in srgb, var(--color-action) 45%, transparent)' }}
                      >
                        {extra.note}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Цени — рендира се само ако има реален ценоразпис в clinic.ts */}
          <PriceTable category={category.id} />

          {/* Маркетинг послание */}
          {content.quote && (
            <blockquote
              className="mt-10 pl-6 font-serif-luxe italic"
              style={{ fontSize: '20px', lineHeight: 1.5, color: 'var(--color-text)', borderLeft: '3px solid var(--color-action)' }}
            >
              {content.quote}
            </blockquote>
          )}

          {/* CTA */}
          <div className="mt-11 flex flex-col sm:flex-row sm:items-center gap-5">
            <BookingButton
              variant="primary"
              service={category.label}
              className="inline-flex w-full sm:w-auto min-h-[48px] px-7 py-3.5 text-xs tracking-[0.16em] uppercase font-medium"
            >
              Запази час
              <ArrowRight size={15} aria-hidden="true" />
            </BookingButton>
            <a
              href="tel:+359882708081"
              className="inline-flex min-h-[44px] items-center gap-2 text-sm tracking-[0.05em] transition-colors hover:text-[var(--color-accent-text,var(--color-action-hover))]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Обади се: +359 88 270 8081
            </a>
          </div>
        </article>

        {/* Другите направления — страницата свършваше със CTA и оттам нататък
            беше задънена улица: нито връзка към сродна услуга, нито обратно
            към списъка. Който не намери своето тук, нямаше накъде да продължи. */}
        <nav className="mt-12" aria-label="Други услуги">
          <h2 className="text-[11px] tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Разгледайте също
          </h2>
          <ul className="flex flex-wrap gap-2.5">
            {related.map((c) => (
              <li key={c.id}>
                <Link to={`/uslugi/${c.slug}`} className="proc-chip">
                  {c.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/"
                state={{ scrollTo: '#services' }}
                className="proc-chip"
                style={{ color: 'var(--color-accent-text, var(--color-action-hover))' }}
              >
                Всички услуги →
              </Link>
            </li>
          </ul>
        </nav>

        {/* Философска линия */}
        <p
          className="mt-10 font-serif-luxe italic text-center mx-auto"
          style={{
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'var(--color-text-secondary)',
            maxWidth: '560px',
            textShadow: 'var(--text-shadow)',
          }}
        >
          {clinicPhilosophy}
        </p>
      </div>
    </main>
  )
}
