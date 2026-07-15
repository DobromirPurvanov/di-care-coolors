import type { ReactNode, CSSProperties, MouseEventHandler } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { openBooking } from '../lib/booking'
import { scrollToTarget } from '../lib/scroll'

type Variant = 'primary' | 'ghost' | 'link'

interface Props {
  /** Услугата, която да се пренесе в бележките на резервацията (по избор). */
  service?: string
  variant?: Variant
  /** Layout/размер класове за конкретното място (display, padding, tracking…). */
  className?: string
  style?: CSSProperties
  children: ReactNode
  'aria-label'?: string
  /** Допълнителен клик (напр. за затваряне на мобилното меню). */
  onClick?: MouseEventHandler<HTMLButtonElement>
}

// Вариантът задава само цветовете, за да работят hover състоянията чрез Tailwind.
const VARIANT: Record<Variant, string> = {
  primary: 'bg-[var(--accent)] text-[var(--accent-contrast)] font-medium hover:bg-[var(--accent-light)]',
  ghost:
    'border border-[var(--card-border)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[color-mix(in srgb, var(--accent) 10%, transparent)] hover:text-[var(--accent-light)]',
  link: 'text-[var(--text-secondary)] hover:text-[var(--accent-light)]',
}

/**
 * Отваря Cal.com popup при клик. Скриптът на Cal се зарежда чак при първия
 * клик (освен ако потребителят е приел всички бисквитки — тогава е зареден
 * предварително от App). Ако Cal е недостъпен (блокер/офлайн), водим
 * потребителя към контактната форма като резервен път.
 */
export default function BookingButton({
  service,
  variant = 'primary',
  className = '',
  style,
  children,
  onClick,
  ...rest
}: Props) {
  const navigate = useNavigate()
  const onHome = useLocation().pathname === '/'

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e)
    const opened = openBooking(service)
    if (!opened) {
      // Резервен път: контактната форма (телефон + съобщение).
      if (onHome) scrollToTarget('#contact')
      else navigate('/', { state: { scrollTo: '#contact' } })
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`items-center justify-center gap-2 rounded-full transition-all duration-300 cursor-pointer ${VARIANT[variant]} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </button>
  )
}
