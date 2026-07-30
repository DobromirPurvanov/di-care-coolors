import type { ReactNode } from 'react'

/**
 * Едно заглавие за всички секции.
 *
 * Преди сайтът имаше два несъвместими гласа: serif с надзаглавие („За нас",
 * „Галерия") и главни букви с разредка в санс („Нашите услуги", „Апаратура",
 * „Свържете се с нас") — плюс три различни размера. Тук остава serif-ът,
 * защото това е гласът на брошурата и на hero-то; разреденият санс слиза до
 * надзаглавието, където върши работата си.
 */
export interface SectionHeadingProps {
  /** Надзаглавие с главни букви — кратък ориентир над титула. */
  eyebrow: string
  title: string
  /** Пояснение под златната черта. */
  lead?: string
  align?: 'left' | 'center'
  /** Съдържание вдясно от заглавието (напр. стрелките на галерията). */
  aside?: ReactNode
  /**
   * Реф към блока, който секцията анимира при скрол. Стои на обвивката, а не
   * на h2, за да влязат надзаглавието и чертата в същия reveal.
   */
  revealRef?: React.Ref<HTMLDivElement>
  className?: string
  /** Класове към обвивката — носят opacity-0 за GSAP reveal. */
  innerClassName?: string
  style?: React.CSSProperties
  id?: string
}

export default function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  aside,
  revealRef,
  className = '',
  innerClassName = '',
  style,
  id,
}: SectionHeadingProps) {
  const centered = align === 'center'

  return (
    <div className={`section-head ${className}`}>
      <div
        ref={revealRef}
        style={style}
        className={`${innerClassName} ${centered ? 'flex flex-col items-center text-center' : ''}`}
      >
        <p
          className="text-[11px] tracking-[0.25em] uppercase"
          style={{ color: 'var(--color-accent-text, var(--color-action-hover))' }}
        >
          {eyebrow}
        </p>

        {/* Заглавието и aside-ът делят един ред, за да не се разпада базовата
            линия, когато секцията носи контроли вдясно (галерията). */}
        <div
          className={
            aside
              ? 'mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 w-full'
              : 'mt-3'
          }
        >
          <h2
            id={id}
            className="font-serif-luxe text-gradient leading-[1.12]"
            style={{ fontSize: 'clamp(1.9rem, 4.2vw, 2.9rem)' }}
          >
            {title}
          </h2>
          {aside}
        </div>

        <div
          aria-hidden="true"
          className="mt-5"
          style={{ width: '56px', height: '2px', background: 'var(--paint-brand)' }}
        />

        {lead && (
          <p
            className={`mt-5 text-[15px] leading-relaxed ${centered ? 'max-w-[34rem]' : 'max-w-[42rem]'}`}
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {lead}
          </p>
        )}
      </div>
    </div>
  )
}
