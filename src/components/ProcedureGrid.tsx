import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { ArrowRight, X, Sparkles } from 'lucide-react'
import { procedures, categories, categoryById, type Procedure } from '../data/procedures'
import BookingButton from './BookingButton'

/** Съдържанието на детайл-панела — споделя се между десктоп колоната и мобилната карта. */
function DetailBody({ active, onClose }: { active: Procedure; onClose: () => void }) {
  const category = categoryById[active.category]
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm tracking-[0.12em] uppercase font-medium" style={{ color: 'var(--accent-light)' }}>
          {active.title}
        </h3>
        <button
          onClick={onClose}
          className="flex items-center justify-center min-w-[44px] min-h-[44px] -mt-2.5 -mr-2.5 flex-none transition-colors hover:text-[var(--text)]"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Затвори детайлите"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {active.description}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1">
        <Link
          to={`/uslugi/${category.slug}`}
          state={{ procedure: active.title }}
          className="inline-flex items-center gap-2 min-h-[44px] text-[11px] tracking-[0.15em] uppercase transition-colors hover:text-[var(--accent-light)]"
          style={{ color: 'var(--accent-light)' }}
        >
          Научете повече
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
        <BookingButton
          variant="link"
          service={category.label}
          className="inline-flex min-h-[44px] text-[11px] tracking-[0.15em] uppercase"
        >
          Запази час
        </BookingButton>
      </div>
    </div>
  )
}

export default function ProcedureGrid() {
  const [activeTitle, setActiveTitle] = useState<string | null>(null)
  const active = procedures.find((p) => p.title === activeTitle) ?? null

  const toggle = (title: string) => setActiveTitle((cur) => (cur === title ? null : title))

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-12">
      {/* Списък с процедури, групиран по категория */}
      <div className="lg:order-first">
        {categories.map((cat) => {
          const items = procedures.filter((p) => p.category === cat.id)
          if (items.length === 0) return null
          return (
            <section key={cat.id} className="mb-8 last:mb-0" aria-label={cat.label}>
              <div className="flex items-baseline gap-3 mb-4">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 8px color-mix(in srgb, var(--accent) 45%, transparent)' }}
                />
                <h3 className="text-[11px] tracking-[0.22em] uppercase" style={{ color: 'var(--text-secondary)' }}>
                  {cat.label}
                </h3>
                <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {items.length}
                </span>
                <span
                  aria-hidden="true"
                  className="flex-1 h-px"
                  style={{ background: 'linear-gradient(90deg, var(--secondary), transparent)' }}
                />
              </div>
              <div className="flex flex-wrap gap-2.5">
                {items.map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => toggle(p.title)}
                    aria-pressed={active?.title === p.title}
                    className={`proc-chip${active?.title === p.title ? ' proc-chip-active' : ''}`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Детайл — десктоп: залепена дясна колона */}
      <div className="hidden lg:block lg:order-last">
        <div className="lg:sticky lg:top-28">
          {active ? (
            <div
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '18px',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                boxShadow: 'var(--card-shadow)',
              }}
              role="region"
              aria-live="polite"
              aria-label={`Детайли за ${active.title}`}
            >
              <DetailBody active={active} onClose={() => setActiveTitle(null)} />
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center text-center px-6 py-12 rounded-2xl"
              style={{ border: '1px dashed var(--border)' }}
            >
              <Sparkles size={22} aria-hidden="true" style={{ color: 'color-mix(in srgb, var(--accent) 50%, transparent)' }} />
              <p className="mt-4 text-[12px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-secondary)' }}>
                Изберете процедура
              </p>
              <p className="mt-2 text-[12px] font-light leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Докоснете етикет, за да видите детайли и да запазите час.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Детайл — мобилно: залепена долна карта (както при 3D сферата).
          Рендира се през портал към <body>, за да не бъде "хванат" от
          трансформиран родител (GSAP transform чупи position: fixed). */}
      {createPortal(
        <div
          className="fixed left-3 right-3 z-[1010] lg:hidden overflow-y-auto overscroll-contain transition-all duration-[400ms]"
          style={{
            bottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
            maxHeight: 'calc(100svh - 5.5rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
            opacity: active ? 1 : 0,
            transform: active ? 'translateY(0)' : 'translateY(14px)',
            pointerEvents: active ? 'auto' : 'none',
            background: 'var(--glass-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '18px',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: 'var(--floating-shadow)',
            WebkitOverflowScrolling: 'touch',
          }}
          role="region"
          aria-live="polite"
          aria-label={active ? `Детайли за ${active.title}` : undefined}
        >
          {active && <DetailBody active={active} onClose={() => setActiveTitle(null)} />}
        </div>,
        document.body
      )}
    </div>
  )
}
