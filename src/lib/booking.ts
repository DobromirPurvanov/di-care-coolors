// Централна конфигурация за системата за запазване на часове (Cal.com).
//
// Реалният линк се задава чрез env променлива VITE_CAL_LINK във Vercel
// (и локално в .env.local).
//
// ВНИМАНИЕ: fallback стойността по-долу е ВРЕМЕНЕН тестов календар
// (личен акаунт, 30-мин "Cal Video" среща). Преди публикуване създайте
// Cal.com акаунт на клиниката с ПРИСЪСТВЕН event (адресът на клиниката,
// не видео разговор) и задайте VITE_CAL_LINK.
//
// GDPR: embed скриптът на Cal НЕ се зарежда при отваряне на сайта, освен
// ако потребителят е приел всички бисквитки. При „само необходимите" се
// зарежда чак при изрично натискане на „Запази час" (изрично поискана
// услуга). Ползваме официалния vanilla embed snippet (зареден динамично),
// вместо npm пакета — така Cal не влиза в bundle-а.

export const CAL_LINK: string = import.meta.env.VITE_CAL_LINK ?? 'dobromir-purvanov-ksto97/30min'

/** Namespace за Cal embed инстанцията. */
export const CAL_NAMESPACE = 'zapazi-chas'

/** Брандова тема на календара — наследява избраната цветова версия. */
function getCalUiConfig() {
  const accent = typeof document === 'undefined'
    ? '#B698B8'
    : getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#B698B8'

  return {
    theme: 'dark' as const,
    hideEventTypeDetails: false,
    layout: 'month_view' as const,
    cssVarsPerTheme: {
      dark: { 'cal-brand': accent },
      light: { 'cal-brand': accent },
    },
  }
}

interface CalApi {
  (...args: unknown[]): void
  q?: unknown[][]
  ns?: Record<string, CalApi>
  loaded?: boolean
}

declare global {
  interface Window {
    Cal?: CalApi
  }
}

let scriptRequested = false
let scriptFailed = false

/** true, ако embed скриптът не можа да се зареди (блокер/офлайн). */
export function isCalUnavailable(): boolean {
  return scriptFailed
}

/**
 * Зарежда Cal.com embed скрипта и инициализира namespace-а + темата.
 * Идемпотентно — безопасно да се вика при всеки клик.
 */
export function loadCalScript(): void {
  if (scriptRequested || typeof window === 'undefined') return
  scriptRequested = true

  const w = window
  const scriptSrc = 'https://app.cal.com/embed/embed.js'
  const push = (api: CalApi, args: unknown[]) => { (api.q ??= []).push(args) }

  // Официалният bootstrap: дефинира опашка, докато embed.js се зареди.
  w.Cal =
    w.Cal ||
    (function bootstrap(...args: unknown[]) {
      const cal = w.Cal as CalApi
      if (!cal.loaded) {
        cal.ns = {}
        cal.q = cal.q || []
        const script = w.document.createElement('script')
        script.src = scriptSrc
        // Ако скриптът не се зареди (adblock, офлайн), бутоните за час
        // превключват към резервната пътека (контактната форма).
        script.onerror = () => { scriptFailed = true }
        w.document.head.appendChild(script)
        cal.loaded = true
      }
      if (args[0] === 'init') {
        const api: CalApi = ((...a: unknown[]) => push(api, a)) as CalApi
        api.q = api.q || []
        const namespace = args[1]
        if (typeof namespace === 'string') {
          cal.ns![namespace] = cal.ns![namespace] || api
          push(cal.ns![namespace], args)
          push(cal, ['initNamespace', namespace])
        } else {
          push(cal, args)
        }
        return
      }
      push(cal, args)
    } as CalApi)

  w.Cal('init', CAL_NAMESPACE, { origin: 'https://cal.com' })
  w.Cal.ns![CAL_NAMESPACE]('ui', getCalUiConfig())
}

/**
 * Отваря booking popup-а програмно. Инструкцията се нарежда в опашката на
 * embed-а, така че работи и при първия клик, докато скриптът още се тегли.
 * Връща false, ако Cal е недостъпен — тогава извикващият показва fallback.
 */
export function openBooking(service?: string): boolean {
  if (typeof window === 'undefined') return false
  loadCalScript()
  if (scriptFailed) return false

  const config: Record<string, string> = { theme: 'dark' }
  if (service) config.notes = `Услуга: ${service}`

  const ns = window.Cal?.ns?.[CAL_NAMESPACE]
  if (!ns) return false
  ns('modal', { calLink: CAL_LINK, config })
  return true
}

/**
 * Следи видимостта на Cal модала и вика onOpen/onClose при реална промяна.
 * Гледа крайното състояние на DOM (не Cal събития), защото Cal НЕ вдига
 * надеждно събитие при затваряне през X / фон / Esc — само скрива
 * <cal-modal-box> с visibility:hidden. Ако разчитаме на събитието, Lenis
 * остава спрян и страницата „замръзва".
 *
 * Не зарежда нищо от трети страни — безопасно се стартира винаги.
 */
export function watchCalModal(handlers: { onOpen: () => void; onClose: () => void }): () => void {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => {}
  }

  let open = false
  let modalObserver: MutationObserver | null = null

  const evaluate = () => {
    const modal = document.querySelector('cal-modal-box')
    const isOpen = !!modal && getComputedStyle(modal).visibility !== 'hidden'
    if (isOpen === open) return
    open = isOpen
    if (isOpen) handlers.onOpen()
    else handlers.onClose()
  }

  // <cal-modal-box> се създава при първото отваряне като пряко дете на <body>
  // и после се преизползва (само се сменя visibility). Наблюдаваме body за
  // появата му, после закачаме наблюдател върху неговите атрибути.
  const bodyObserver = new MutationObserver(() => {
    const modal = document.querySelector('cal-modal-box')
    if (modal && !modalObserver) {
      modalObserver = new MutationObserver(evaluate)
      modalObserver.observe(modal, { attributes: true, attributeFilter: ['style', 'state'] })
    }
    evaluate()
  })
  bodyObserver.observe(document.body, { childList: true })

  return () => {
    bodyObserver.disconnect()
    modalObserver?.disconnect()
  }
}
