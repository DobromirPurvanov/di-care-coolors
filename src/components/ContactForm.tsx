import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { categories } from '../data/procedures'
import { scrollToTarget } from '../lib/scroll'

type Values = {
  name: string
  phone: string
  email: string
  procedure: string
  message: string
  gdpr: boolean
  company: string // honeypot — реален потребител го оставя празно
}

type Errors = Partial<Record<keyof Values, string>>

const OTHER = 'Друго / Не съм сигурен(а)'
// Опциите се захранват от реалните услуги — винаги в синхрон с останалия сайт.
const PROCEDURE_OPTIONS = [...categories.map((c) => c.label), OTHER]

const MESSAGE_MAX = 600

const initial: Values = {
  name: '', phone: '', email: '', procedure: '', message: '', gdpr: false, company: '',
}

function validateField(field: keyof Values, values: Values): string | undefined {
  const v = values[field]
  switch (field) {
    case 'name':
      if (!String(v).trim()) return 'Моля, въведете вашето име.'
      if (String(v).trim().length < 2) return 'Името изглежда твърде кратко.'
      return
    case 'phone': {
      const digits = String(v).replace(/\D/g, '')
      if (!String(v).trim()) return 'Моля, въведете телефон за връзка.'
      if (digits.length < 6) return 'Телефонният номер изглежда непълен — проверете цифрите.'
      return
    }
    case 'email':
      if (String(v).trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()))
        return 'Имейлът изглежда невалиден — проверете формàта (име@домейн.бг).'
      return
    case 'gdpr':
      if (!v) return 'Необходимо е съгласие с политиката за лични данни.'
      return
    default:
      return
  }
}

export default function ContactForm() {
  const { state } = useLocation()
  // Prefill: ако идваме от страница на услуга с „Запази час", избираме услугата.
  const prefill = (state as { procedure?: string } | null)?.procedure
  const [values, setValues] = useState<Values>(() => ({
    ...initial,
    procedure: prefill && PROCEDURE_OPTIONS.includes(prefill) ? prefill : '',
  }))
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const formRef = useRef<HTMLFormElement>(null)

  const set = (field: keyof Values, value: string | boolean) => {
    setValues(prev => {
      const next = { ...prev, [field]: value }
      if (touched[field]) setErrors(e => ({ ...e, [field]: validateField(field, next) }))
      return next
    })
  }

  const blur = (field: keyof Values) => {
    setTouched(t => ({ ...t, [field]: true }))
    setErrors(e => ({ ...e, [field]: validateField(field, values) }))
  }

  const isValid = (field: keyof Values) =>
    touched[field] && !errors[field] && String(values[field]).trim() !== ''

  async function submit() {
    // Honeypot — ако е попълнен, това е бот: преструваме се на успех, без да пращаме.
    if (values.company.trim()) { setStatus('success'); return }

    const all: Errors = {}
    ;(['name', 'phone', 'email', 'gdpr'] as (keyof Values)[]).forEach(f => {
      const err = validateField(f, values)
      if (err) all[f] = err
    })
    setTouched(t => ({ ...t, name: true, phone: true, email: true, gdpr: true }))
    setErrors(all)

    if (Object.keys(all).length > 0) {
      // aria-invalid се появява в DOM чак след re-render — затова търсим в
      // следващия кадър. preventScroll: голият focus() скролва нативно и се
      // бие с Lenis; позиционираме през scrollToTarget.
      requestAnimationFrame(() => {
        const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
        if (!first) return
        first.focus({ preventScroll: true })
        scrollToTarget(first, -120)
      })
      return
    }

    setStatus('sending')
    // Полето вече показва фиксиран префикс +359; ако потребителят е въвел и
    // свой префикс (+359 / 00359 / водеща 0), го премахваме, за да не се дублира.
    const localPhone = values.phone.trim().replace(/^(\+?359|0)\s*/, '')
    const payload = {
      name: values.name.trim(),
      phone: `+359 ${localPhone}`,
      email: values.email.trim(),
      procedure: values.procedure,
      message: values.message.trim(),
      company: values.company,
    }
    try {
      // В dev няма Vercel functions — симулираме успех, за да е тестваем UI-ят.
      if (import.meta.env.DEV) {
        await new Promise(r => setTimeout(r, 700))
        console.info('[ContactForm] DEV режим — заявката НЕ се изпраща:', payload)
        setStatus('success')
        return
      }
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-start gap-5 py-10" role="status" aria-live="polite">
        <span
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            border: '1px solid color-mix(in srgb, var(--accent) 50%, transparent)',
            background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
            animation: 'successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <Check size={26} style={{ color: 'var(--accent)' }} aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg" style={{ color: 'var(--text)' }}>Благодарим ви!</p>
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'color-mix(in srgb, var(--text) 70%, transparent)' }}>
            Получихме вашето съобщение{values.procedure ? ` относно „${values.procedure}"` : ''} и ще се
            свържем с вас в рамките на работния ден.
          </p>
        </div>
        <style>{`@keyframes successPop { 0% { transform: scale(0.4); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }`}</style>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      onSubmit={e => { e.preventDefault(); submit() }}
      noValidate
      className="flex flex-col gap-5"
    >
      {/* Honeypot — скрит от хора и екранни четци */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={values.company}
        onChange={e => set('company', e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
      />

      {/* Име */}
      <div className="field-wrap">
        <input
          id="cf-name"
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="next"
          placeholder=" "
          className={`field-input ${touched.name && errors.name ? 'field-error' : ''}`}
          value={values.name}
          onChange={e => set('name', e.target.value)}
          onBlur={() => blur('name')}
          aria-invalid={!!(touched.name && errors.name)}
          aria-describedby={errors.name ? 'cf-name-err' : undefined}
          required
        />
        <label htmlFor="cf-name" className="field-label">Име и фамилия *</label>
        {isValid('name') && <Check size={14} className="absolute right-0 top-6" style={{ color: 'var(--success)' }} aria-hidden="true" />}
        {touched.name && errors.name && <span id="cf-name-err" className="field-msg" role="alert">{errors.name}</span>}
      </div>

      {/* Телефон */}
      <div className="field-wrap">
        <span
          className="absolute left-0 top-[22px] text-[15px] select-none pointer-events-none"
          aria-hidden="true"
          style={{ color: 'color-mix(in srgb, var(--text) 70%, transparent)' }}
        >
          +359
        </span>
        <input
          id="cf-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          enterKeyHint="next"
          placeholder=" "
          className={`field-input pl-12 ${touched.phone && errors.phone ? 'field-error' : ''}`}
          value={values.phone}
          onChange={e => set('phone', e.target.value)}
          onBlur={() => blur('phone')}
          aria-invalid={!!(touched.phone && errors.phone)}
          aria-describedby={`${errors.phone ? 'cf-phone-err' : 'cf-phone-help'}`}
          required
        />
        <label htmlFor="cf-phone" className="field-label pl-12">Телефон *</label>
        {isValid('phone') && <Check size={14} className="absolute right-0 top-6" style={{ color: 'var(--success)' }} aria-hidden="true" />}
        {touched.phone && errors.phone
          ? <span id="cf-phone-err" className="field-msg" role="alert">{errors.phone}</span>
          : <span id="cf-phone-help" className="field-help">Ще ви се обадим за потвърждение на часа.</span>}
      </div>

      {/* Имейл */}
      <div className="field-wrap">
        <input
          id="cf-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          enterKeyHint="next"
          placeholder=" "
          className={`field-input ${touched.email && errors.email ? 'field-error' : ''}`}
          value={values.email}
          onChange={e => set('email', e.target.value)}
          onBlur={() => blur('email')}
          aria-invalid={!!(touched.email && errors.email)}
          aria-describedby={errors.email ? 'cf-email-err' : undefined}
        />
        <label htmlFor="cf-email" className="field-label">Имейл (по избор)</label>
        {isValid('email') && <Check size={14} className="absolute right-0 top-6" style={{ color: 'var(--success)' }} aria-hidden="true" />}
        {touched.email && errors.email && <span id="cf-email-err" className="field-msg" role="alert">{errors.email}</span>}
      </div>

      {/* Услуга */}
      <div className="field-wrap">
        <select
          id="cf-procedure"
          className="field-input"
          value={values.procedure}
          onChange={e => set('procedure', e.target.value)}
        >
          <option value="" disabled hidden></option>
          {PROCEDURE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <label htmlFor="cf-procedure" className={`field-label ${values.procedure ? 'label-float' : ''}`}>
          Услуга, която ви интересува
        </label>
      </div>

      {/* Съобщение */}
      <div className="field-wrap">
        <textarea
          id="cf-message"
          rows={4}
          maxLength={MESSAGE_MAX}
          placeholder=" "
          className="field-input resize-none"
          value={values.message}
          onChange={e => set('message', e.target.value)}
          aria-describedby="cf-message-count"
        />
        <label htmlFor="cf-message" className="field-label">Съобщение (по избор)</label>
        {values.message.length > 0 && (
          <span id="cf-message-count" className="field-help text-right block" aria-live="polite">
            {values.message.length} / {MESSAGE_MAX}
          </span>
        )}
      </div>

      {/* GDPR */}
      <div className="field-wrap">
        <label htmlFor="cf-gdpr" className="flex min-h-[44px] items-start gap-3 py-1 cursor-pointer select-none">
          <input
            id="cf-gdpr"
            type="checkbox"
            checked={values.gdpr}
            onChange={e => {
              const checked = e.target.checked
              setTouched(t => ({ ...t, gdpr: true }))
              setValues(prev => ({ ...prev, gdpr: checked }))
              setErrors(er => ({ ...er, gdpr: validateField('gdpr', { ...values, gdpr: checked }) }))
            }}
            className="sr-only"
            aria-invalid={!!(touched.gdpr && errors.gdpr)}
            aria-describedby={errors.gdpr ? 'cf-gdpr-err' : undefined}
          />
          <span
            aria-hidden="true"
            className="gdpr-box mt-[2px] w-[18px] h-[18px] flex-none flex items-center justify-center transition-all duration-200"
            style={{
              border: `1px solid ${values.gdpr ? 'var(--accent)' : touched.gdpr && errors.gdpr ? 'var(--error)' : 'color-mix(in srgb, var(--text) 25%, transparent)'}`,
              background: values.gdpr ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
            }}
          >
            {values.gdpr && <Check size={12} style={{ color: 'var(--accent)' }} />}
          </span>
          <span className="text-xs leading-relaxed" style={{ color: 'color-mix(in srgb, var(--text) 65%, transparent)' }}>
            Съгласен/на съм с{' '}
            <Link to="/poveritelnost" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors hover:text-[var(--accent-light)]" style={{ color: 'color-mix(in srgb, var(--text) 85%, transparent)' }} onClick={e => e.stopPropagation()}>
              политиката за лични данни
            </Link>{' '}*
          </span>
        </label>
        {touched.gdpr && errors.gdpr && <span id="cf-gdpr-err" className="field-msg" role="alert">{errors.gdpr}</span>}
      </div>

      {/* Грешка при изпращане */}
      {status === 'error' && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 text-[13px] leading-relaxed"
          style={{ border: '1px solid rgba(224,122,106,0.4)', background: 'rgba(224,122,106,0.08)', color: 'var(--error)' }}
        >
          <AlertCircle size={16} aria-hidden="true" className="mt-[1px] flex-none" />
          <span>
            Възникна проблем при изпращането. Опитайте отново или ни се обадете на{' '}
            <a href="tel:+359882708081" className="underline underline-offset-2">+359 88 270 8081</a>.
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-2 w-full sm:w-auto sm:self-start inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full text-[11px] tracking-[0.15em] uppercase font-medium transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
        style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        onMouseEnter={e => { if (status !== 'sending') (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-light)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
      >
        {status === 'sending' ? (
          <><Loader2 size={15} className="animate-spin" aria-hidden="true" />Изпращане...</>
        ) : status === 'error' ? 'Опитайте отново' : 'Изпрати заявка'}
      </button>
    </form>
  )
}
