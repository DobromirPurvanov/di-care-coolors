import { Component, type ReactNode } from 'react'

/**
 * Предпазва страницата от 3D сферата.
 *
 * ProcedureSphere хвърля в конструктора на THREE.WebGLRenderer, когато няма
 * WebGL контекст — изключено хардуерно ускорение, стар GPU, корпоративна
 * политика, някои privacy разширения. Без граница React размонтира ЦЯЛОТО
 * дърво и посетителят вижда празна страница вместо сайт. Тук хващаме грешката
 * и оставаме на списъчния изглед, който и без това е пълноценният начин да се
 * стигне до всяка процедура.
 */
interface Props {
  children: ReactNode
  /** Показва се вместо сферата, ако тя не може да се създаде. */
  fallback: ReactNode
}

export default class SphereBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    // Не е фатално за страницата — оставяме следа за диагностика.
    console.warn('3D сферата не можа да се зареди, показваме списъка.', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
