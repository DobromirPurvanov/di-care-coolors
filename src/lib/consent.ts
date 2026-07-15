// Централно управление на съгласието за бисквитки/вградени услуги.
//
// Изборът реално управлява зареждането на трети страни: Cal.com embed се
// зарежда при „Приемам" (или при изрично натискане на „Запази час"), а
// Google Maps — при „Приемам" (или при „Покажи картата"). Така поведението
// съответства на Политиката за поверителност.

export type Consent = 'all' | 'essential'

const STORAGE_KEY = 'dicare-cookie-consent'
const CHANGE_EVENT = 'dicare:consent-change'
const OPEN_EVENT = 'dicare:consent-open'

/** Прочита запазения избор (ако има). */
export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'all' || v === 'essential' ? v : null
  } catch {
    return null
  }
}

/** Записва избора и уведомява слушателите (карта, календар и т.н.). */
export function setConsent(value: Consent): void {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* localStorage може да е недостъпен — изборът важи само за сесията */
  }
  window.dispatchEvent(new CustomEvent<Consent>(CHANGE_EVENT, { detail: value }))
}

/** Абонамент за промяна на съгласието. Връща функция за отписване. */
export function onConsentChange(cb: (value: Consent) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<Consent>).detail)
  window.addEventListener(CHANGE_EVENT, handler)
  return () => window.removeEventListener(CHANGE_EVENT, handler)
}

/** Отваря банера отново (напр. от „Настройки на бисквитките" във футъра). */
export function openConsentBanner(): void {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT))
}

/** Абонамент за искане за повторно отваряне на банера. */
export function onConsentBannerOpen(cb: () => void): () => void {
  window.addEventListener(OPEN_EVENT, cb)
  return () => window.removeEventListener(OPEN_EVENT, cb)
}
