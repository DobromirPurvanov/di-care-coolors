import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { usePageMeta } from '../lib/seo'

/** Дата на последна актуализация — обновявайте при промяна на политиката. */
const UPDATED = '15 юли 2026 г.'

/**
 * Секция от политиката. Съдържанието е структурирано като данни, за да е
 * лесно за поддръжка — заглавие + параграфи и/или списък.
 */
type Section = {
  title: string
  paragraphs?: string[]
  list?: { term?: string; text: string }[]
  /** Параграфи, показани СЛЕД списъка (напр. пояснение под изброяване). */
  paragraphs2?: string[]
}

const SECTIONS: Section[] = [
  {
    title: '1. Кой обработва вашите данни (Администратор)',
    paragraphs: [
      'Настоящата политика описва как Dr. Di Clinic („Клиниката", „ние") събира и обработва вашите лични данни, когато посещавате сайта ни, попълвате контактната форма или запазвате час.',
    ],
    list: [
      { term: 'Наименование', text: 'Dr. Di Clinic' },
      { term: 'Адрес', text: 'гр. Варна, ул. „Любен Каравелов" № 71, Партер' },
      { term: 'Телефон', text: '+359 882 708 081' },
      { term: 'Имейл', text: 'drdiclinic21@gmail.com' },
    ],
  },
  {
    title: '2. Какви лични данни събираме',
    paragraphs: ['Обработваме само данните, които сами ни предоставяте или които са технически необходими:'],
    list: [
      { term: 'Контактна форма', text: 'име и фамилия, телефон, имейл (по избор), избрана услуга и свободен текст на съобщението.' },
      { term: 'Запазване на час', text: 'при резервация през календара се обработват име, имейл и бележки от вас, чрез платформата Cal.com.' },
      { term: 'Технически данни', text: 'бисквитки и данни за ползването на сайта (вижте раздел „Бисквитки").' },
    ],
  },
  {
    title: '3. За какви цели и на какво основание',
    list: [
      { term: 'Отговор на запитване и запазване на час', text: 'на основание вашето съгласие и предприемане на стъпки по ваше искане преди сключване на договор (чл. 6, §1, б. „а" и „б" от GDPR).' },
      { term: 'Здравна информация', text: 'когато при консултация или процедура се налага обработка на данни за здравето, това става на основание вашето изрично съгласие и с оглед предоставяне на здравни грижи (чл. 9, §2 от GDPR).' },
      { term: 'Функциониране и сигурност на сайта', text: 'на основание нашия легитимен интерес сайтът да работи коректно и защитено (чл. 6, §1, б. „е" от GDPR).' },
    ],
  },
  {
    title: '4. С кого споделяме данните',
    paragraphs: ['Не продаваме вашите данни. Споделяме ги само с доверени доставчици, които ни помагат да предоставяме услугата:'],
    list: [
      { term: 'Cal.com', text: 'платформа за онлайн запазване на часове (обработва данните от резервацията).' },
      { term: 'Google Maps', text: 'вградена карта за локацията на клиниката.' },
      { term: 'Доставчик на хостинг', text: 'за поддръжка и сигурност на сайта.' },
    ],
    paragraphs2: [
      'Някои от тези доставчици може да обработват данни извън Европейското икономическо пространство, при подходящи гаранции съгласно GDPR.',
    ],
  },
  {
    title: '5. Колко дълго съхраняваме данните',
    paragraphs: [
      'Пазим личните ви данни само толкова, колкото е необходимо за целите, за които са събрани — обикновено докато обработим запитването ви и за разумен период след това, освен ако закон не изисква по-дълъг срок. След това данните се изтриват или анонимизират.',
    ],
  },
  {
    title: '6. Бисквитки (Cookies)',
    paragraphs: [
      'Сайтът използва строго необходими бисквитки, за да работи коректно. Вградените услуги от трети страни (календарът за резервации Cal.com и картата на Google Maps) се зареждат само след ваше съгласие или когато изрично ги използвате — например при натискане на „Запази час" или „Покажи картата".',
      'При първо посещение можете да приемете или да откажете незадължителните бисквитки чрез банера в долната част на екрана. Можете да промените или оттеглите избора си по всяко време чрез връзката „Настройки на бисквитките" в долната част на сайта.',
    ],
  },
  {
    title: '7. Вашите права',
    paragraphs: ['Съгласно GDPR вие имате право да:'],
    list: [
      { text: 'получите достъп до личните си данни и копие от тях;' },
      { text: 'поискате коригиране на неточни данни;' },
      { text: 'поискате изтриване („правото да бъдеш забравен");' },
      { text: 'ограничите или възразите срещу обработването;' },
      { text: 'получите данните си в структуриран формат (преносимост);' },
      { text: 'оттеглите съгласието си по всяко време, без това да засяга законността на обработката преди оттеглянето.' },
    ],
    paragraphs2: [
      'За да упражните тези права, свържете се с нас на drdiclinic21@gmail.com или на +359 882 708 081.',
    ],
  },
  {
    title: '8. Право на жалба',
    paragraphs: [
      'Ако смятате, че правата ви са нарушени, имате право да подадете жалба до Комисията за защита на личните данни (КЗЛД):',
    ],
    list: [
      { term: 'Адрес', text: 'гр. София 1592, бул. „Проф. Цветан Лазаров" № 2' },
      { term: 'Уебсайт', text: 'www.cpdp.bg' },
    ],
  },
]

export default function Privacy() {
  usePageMeta({
    title: 'Политика за поверителност | Dr. Di Clinic',
    description:
      'Как Dr. Di Clinic събира и обработва лични данни: контактна форма, запазване на час, бисквитки и вашите права по GDPR.',
    path: '/poveritelnost',
  })
  return (
    <main
      className="relative z-10"
      style={{ padding: 'clamp(6rem, 14vh, 10rem) clamp(1rem, 4vw, 3rem) clamp(4rem, 9vh, 7rem)' }}
    >
      <div className="mx-auto" style={{ maxWidth: '760px' }}>
        {/* Обратна навигация */}
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center gap-2 text-xs tracking-[0.14em] uppercase mb-6 transition-colors hover:text-[var(--color-accent-text,var(--color-action-hover))]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Обратно към сайта
        </Link>

        {/* Четяща повърхност — спокоен фон над анимирания starfield */}
        <article
          style={{
            background: 'var(--color-card)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--color-card-border)',
            borderRadius: '20px',
            boxShadow: 'var(--floating-shadow)',
            padding: 'clamp(1.25rem, 4.5vw, 3.25rem)',
          }}
        >
          <header>
            <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--color-accent-text, var(--color-action-hover))' }}>
              Защита на личните данни
            </p>
            <h1 className="text-gradient font-serif-luxe leading-[1.1]" style={{ fontSize: 'clamp(2rem, 5.5vw, 3rem)' }}>
              Политика за поверителност
            </h1>
            <div
              aria-hidden="true"
              className="mt-5 mb-6"
              style={{ width: '56px', height: '2px', background: 'var(--paint-brand)' }}
            />
            <p className="text-xs tracking-[0.06em]" style={{ color: 'var(--color-text-muted)' }}>
              Последна актуализация: {UPDATED}
            </p>
          </header>

          {SECTIONS.map((s) => {
            const extra = s.paragraphs2
            return (
              <section className="mt-11" key={s.title}>
                <h2 className="font-serif-luxe" style={{ fontSize: '20px', lineHeight: 1.3, color: 'var(--color-heading)' }}>
                  {s.title}
                </h2>

                {s.paragraphs?.map((p, i) => (
                  <p key={i} className="mt-4" style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
                    {p}
                  </p>
                ))}

                {s.list && (
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {s.list.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3"
                        style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}
                      >
                        <span aria-hidden="true" className="mt-[9px] flex-none" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-action)' }} />
                        <span>
                          {item.term && <strong style={{ color: 'var(--color-text)', fontWeight: 500 }}>{item.term}: </strong>}
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {extra?.map((p, i) => (
                  <p key={i} className="mt-4" style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
                    {p}
                  </p>
                ))}
              </section>
            )
          })}
        </article>
      </div>
    </main>
  )
}
