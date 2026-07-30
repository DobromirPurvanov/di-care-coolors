import { Info } from 'lucide-react'
import { pricing, currency, pricingDisclaimer } from '../data/clinic'
import type { CategoryId } from '../data/procedures'

/**
 * Ценови блок на страницата на услуга.
 *
 * Рендира се САМО ако в src/data/clinic.ts има реални цени за тази услуга —
 * докато няма, компонентът връща null и страницата изглежда точно както преди.
 * По-добре липсваща таблица, отколкото измислени числа за медицинска услуга.
 */
export default function PriceTable({ category }: { category: CategoryId }) {
  const block = pricing[category]
  if (!block || block.items.length === 0) return null

  const fmt = (n: number) => new Intl.NumberFormat('bg-BG').format(n)

  return (
    <section className="mt-12" aria-labelledby="price-heading">
      <h2
        id="price-heading"
        className="text-xs tracking-[0.2em] uppercase mb-1"
        style={{ color: 'var(--color-accent-text, var(--color-action-hover))' }}
      >
        Цени
      </h2>

      <ul className="mt-4 flex flex-col">
        {block.items.map((item, i) => (
          <li
            key={item.label}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-4"
            style={{ borderBottom: i === block.items.length - 1 ? 'none' : '1px solid var(--color-border)' }}
          >
            <div className="min-w-0">
              <p style={{ fontSize: '15px', color: 'var(--color-text)' }}>{item.label}</p>
              {item.note && (
                <p className="mt-1" style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
                  {item.note}
                </p>
              )}
            </div>
            {/* tabular-nums: цените се подравняват по колона, вместо да „танцуват". */}
            <p
              className="tabular-nums whitespace-nowrap"
              style={{ fontSize: '15px', color: 'var(--color-heading)' }}
            >
              {item.to ? `${fmt(item.from)} – ${fmt(item.to)}` : `от ${fmt(item.from)}`} {currency}
              {item.unit && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}> · {item.unit}</span>
              )}
            </p>
          </li>
        ))}
      </ul>

      <p
        className="mt-5 flex items-start gap-2.5"
        style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}
      >
        <Info size={15} aria-hidden="true" className="mt-[2px] flex-none" />
        <span>{block.note ? `${block.note} ${pricingDisclaimer}` : pricingDisclaimer}</span>
      </p>
    </section>
  )
}
