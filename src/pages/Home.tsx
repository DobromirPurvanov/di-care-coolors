import { useEffect } from 'react'
import { useLocation } from 'react-router'
import Hero from '../sections/Hero'
import ProcedureSection from '../sections/ProcedureSection'
import Services from '../sections/Services'
import WhyUs from '../sections/WhyUs'
import Team from '../sections/Team'
import Gallery from '../sections/Gallery'
import Equipment from '../sections/Equipment'
import Testimonials from '../sections/Testimonials'
import Contact from '../sections/Contact'
import { scrollToTarget } from '../lib/scroll'
import { usePageMeta } from '../lib/seo'

export default function Home() {
  const location = useLocation()

  usePageMeta({
    title: 'Dr. Di Clinic | Клиника за естетика и красота',
    description:
      'Dr. Di Clinic е клиника за естетика и красота във Варна. Лазерно подмладяване, дермални филъри, ботокс, IV терапии и още.',
    path: '/',
  })

  // Когато идваме от подстраница с искане за скрол към котва (напр. #contact),
  // изчакваме секциите да се монтират и скролваме плавно.
  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (!target) return
    const id = requestAnimationFrame(() => scrollToTarget(target))
    return () => cancelAnimationFrame(id)
  }, [location.state])

  return (
    <main className="relative z-10">
      <Hero />
      <ProcedureSection />
      <Services />
      <WhyUs />
      {/* Team и Testimonials се рендират сами само когато в src/data/clinic.ts
          има реални данни — иначе връщат null и подредбата остава както преди.
          Отзивите стоят точно преди „Контакти": социалното доказателство е
          най-силно непосредствено преди искането за действие. */}
      <Team />
      <Gallery />
      <Equipment />
      <Testimonials />
      <Contact />
    </main>
  )
}
