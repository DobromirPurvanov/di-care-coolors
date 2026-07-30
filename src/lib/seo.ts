import { useEffect } from 'react'

/** Публичният адрес на сайта — същият като в index.html/sitemap.xml. */
export const SITE_URL = 'https://di-care.vercel.app'

interface PageMeta {
  title: string
  description: string
  /** Път за canonical, напр. '/' или '/uslugi/laser-fotona'. */
  path: string
  /**
   * Изключва hook-а, без да нарушава правилата на hooks. Нужно е там, където
   * компонентът може да делегира рендера на друг (ServicePage → NotFound):
   * ефектите на детето се изпълняват ПРЕДИ тези на родителя, така че иначе
   * родителят презаписваше заглавието, зададено от NotFound.
   */
  enabled?: boolean
  /** Добавя <meta name="robots" content="noindex"> — за 404 състояния. */
  noindex?: boolean
}

/** Задава/обновява <meta>/<link> таг и връща функция за възстановяване. */
function setTag(selector: string, attr: 'content' | 'href', value: string): () => void {
  const el = document.head.querySelector<HTMLElement>(selector)
  if (!el) return () => {}
  const previous = el.getAttribute(attr)
  el.setAttribute(attr, value)
  return () => {
    if (previous !== null) el.setAttribute(attr, previous)
  }
}

/**
 * Per-route SEO: document.title, meta description, canonical и OG/Twitter
 * тагове. Без това SPA-то обявява canonical-а на началната страница от
 * всички маршрути и Google третира подстраниците като дубликати.
 * При напускане възстановява предишните стойности.
 */
export function usePageMeta({ title, description, path, enabled = true, noindex = false }: PageMeta) {
  useEffect(() => {
    if (!enabled) return
    const url = `${SITE_URL}${path === '/' ? '/' : path}`
    const previousTitle = document.title
    document.title = title

    // SPA-то връща 200 и за несъществуващи пътища, затова „не е намерено"
    // трябва да се каже изрично на търсачките, иначе индексират празнини.
    let robots: HTMLMetaElement | null = null
    if (noindex) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      robots.content = 'noindex, follow'
      document.head.appendChild(robots)
    }

    const restores = [
      setTag('link[rel="canonical"]', 'href', url),
      setTag('meta[name="description"]', 'content', description),
      setTag('meta[property="og:title"]', 'content', title),
      setTag('meta[property="og:description"]', 'content', description),
      setTag('meta[property="og:url"]', 'content', url),
      setTag('meta[name="twitter:title"]', 'content', title),
      setTag('meta[name="twitter:description"]', 'content', description),
    ]

    return () => {
      document.title = previousTitle
      restores.forEach(restore => restore())
      robots?.remove()
    }
  }, [title, description, path, enabled, noindex])
}
