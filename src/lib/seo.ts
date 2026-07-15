import { useEffect } from 'react'

/** Публичният адрес на сайта — същият като в index.html/sitemap.xml. */
export const SITE_URL = 'https://di-care.vercel.app'

interface PageMeta {
  title: string
  description: string
  /** Път за canonical, напр. '/' или '/uslugi/laser-fotona'. */
  path: string
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
export function usePageMeta({ title, description, path }: PageMeta) {
  useEffect(() => {
    const url = `${SITE_URL}${path === '/' ? '/' : path}`
    const previousTitle = document.title
    document.title = title

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
    }
  }, [title, description, path])
}
