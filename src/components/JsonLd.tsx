import { useEffect } from 'react'

/**
 * Инжектира <script type="application/ld+json"> за текущия маршрут и го маха
 * при напускане.
 *
 * Досега структурирани данни имаше само в index.html (глобалният
 * MedicalClinic). Подстраниците на услугите нямаха нито Service, нито
 * BreadcrumbList — Google и AI търсачките нямаше как да разберат, че това са
 * отделни медицински услуги на конкретен доставчик.
 */
export default function JsonLd({ id, data }: { id: string; data: object }) {
  useEffect(() => {
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    el.textContent = JSON.stringify(data)
    document.head.appendChild(el)
    return () => {
      el.remove()
    }
  }, [id, data])

  return null
}
