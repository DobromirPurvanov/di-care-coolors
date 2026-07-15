// Единен източник на истина за процедурите — ползва се както от 3D сферата,
// така и от достъпния списъчен изглед.

export type CategoryId =
  | 'ozone'
  | 'iv'
  | 'laser'
  | 'regen'
  | 'injectable'
  | 'gyneco'
  | 'dental'

export interface Category {
  id: CategoryId
  label: string
  /** URL на страницата за услугата (напр. /uslugi/ozonoterapia). */
  slug: string
}

/** Реда на категориите определя подредбата в списъчния изглед. */
export const categories: Category[] = [
  { id: 'ozone', label: 'Озонотерапия', slug: 'ozonoterapia' },
  { id: 'iv', label: 'Инфузионна терапия', slug: 'infuzionna-terapia' },
  { id: 'laser', label: 'Лазер Fotona', slug: 'laser-fotona' },
  { id: 'regen', label: 'Мезотерапия & Регенерация', slug: 'mezoterapia' },
  { id: 'injectable', label: 'Инжекционни процедури', slug: 'injekcionni-proceduri' },
  { id: 'gyneco', label: 'Естетична гинекология', slug: 'estetichna-ginekologia' },
  { id: 'dental', label: 'Лазерна стоматология', slug: 'laserna-stomatologia' },
]

/** Бърз достъп до категория по id. */
export const categoryById: Record<CategoryId, Category> = categories.reduce(
  (acc, c) => { acc[c.id] = c; return acc },
  {} as Record<CategoryId, Category>
)

export interface Procedure {
  title: string
  lat: number
  lon: number
  description: string
  category: CategoryId
}

/** Заглавие + категория + описание. Позициите на сферата се генерират автоматично. */
interface ProcedureSeed {
  title: string
  description: string
  category: CategoryId
}

const seeds: ProcedureSeed[] = [
  // ── Озонотерапия ──────────────────────────────────────────────
  { title: 'Голяма автохемотерапия', category: 'ozone', description: 'Обогатяване на собствената кръв с медицински озон и връщането ѝ в организма. Подпомага насищането с кислород, имунитета и възстановяването.' },
  { title: 'Малка автохемотерапия', category: 'ozone', description: 'Стимулира естествените защитни механизми на организма и подпомага възстановяването при различни състояния.' },
  { title: 'Ректална озонотерапия', category: 'ozone', description: 'Щадящ метод за системно приложение на озон с ефективност, близка до голямата автохемотерапия. Особено подходящ за детоксикация на черния дроб.' },
  { title: 'Вагинална озонотерапия', category: 'ozone', description: 'Подпомага възстановяването на лигавиците, микробния баланс и локалните защитни механизми.' },
  { title: 'Озон при рани', category: 'ozone', description: 'Подпомага локалното кръвообращение, регенерацията и възстановяването при трудно зарастващи рани.' },
  { title: 'Озон за венци', category: 'ozone', description: 'Намалява бактериите и подпомага оздравяването на венците и пародонта.' },

  // ── Инфузионна терапия ───────────────────────────────────────
  { title: 'IV инфузии', category: 'iv', description: 'Персонализирани венозни инфузии с витамини, минерали, аминокиселини и антиоксиданти за енергия, имунитет и възстановяване след стрес.' },

  // ── Лазер Fotona SP Dynamis ──────────────────────────────────
  { title: 'Hair Restart', category: 'laser', description: 'Лазерна стимулация на космените фоликули за растеж на по-здрава и плътна коса.' },
  { title: '4D Лифтинг', category: 'laser', description: 'Неоперативно подмладяване с цялостно стягане на лицето отвътре и отвън.' },
  { title: '3D Лифтинг', category: 'laser', description: 'Неинвазивен лифтинг на лицето, подходящ дори през летните месеци.' },
  { title: 'SmoothEye', category: 'laser', description: 'Нежно стягане и подмладяване около очите без хирургия и продължително възстановяване.' },
  { title: 'NightLase', category: 'laser', description: 'Неинвазивно лазерно лечение на хъркането чрез стягане на меките тъкани в устата.' },
  { title: 'LipLase', category: 'laser', description: 'Естествено стимулиране на колагена за по-плътни и добре оформени устни без филъри.' },
  { title: 'Фракционен пилинг', category: 'laser', description: 'Frac3 лазер за текстура, белези, фини бръчки и разширени пори чрез естествена регенерация.' },
  { title: 'TightSculpting', category: 'laser', description: 'Fotona TightSculpting® с HoneyComb скенер за оформяне на тялото и стягане на кожата без операция и възстановяване.' },
  { title: 'Онихомикоза', category: 'laser', description: 'Лазерно лечение на гъбички по ноктите, без прием на лекарства.' },
  { title: 'Корекция на уши', category: 'laser', description: 'Минимално инвазивна корекция на разширени или разкъсани ушни висулки.' },
  { title: 'Доброкачествени образувания', category: 'laser', description: 'Безопасно лазерно отстраняване на папиломи, фиброми, кератоми и бенки (след преценка).' },
  { title: 'Съдови лезии', category: 'laser', description: 'Съвременно лазерно третиране на спукани капиляри, съдови звездички и малки съдови изменения.' },

  // ── Мезотерапия & Регенерация ────────────────────────────────
  { title: 'Колаген мезотерапия', category: 'regen', description: 'Активира собственото производство на колаген и еластин за естествено, постепенно подмладяване на кожата.' },
  { title: 'Мезотерапия за коса', category: 'regen', description: 'Доставя активни вещества директно до скалпа за по-добро качество на косата и намаляване на косопада.' },

  // ── Инжекционни процедури ────────────────────────────────────
  { title: 'Устни', category: 'injectable', description: 'Хармонично оформяне и уголемяване на устните с прецизна инжекционна техника.' },
  { title: '8-точков лифтинг', category: 'injectable', description: 'Инжекционен лифтинг в осем ключови точки за естествено повдигане и контур на лицето.' },
  { title: 'Инжекционна мезотерапия', category: 'injectable', description: 'Микроинжектиране на активни коктейли за хидратация и сияйна кожа.' },

  // ── Естетична гинекология ────────────────────────────────────
  { title: 'Естетична гинекология', category: 'gyneco', description: 'Деликатни Fotona лазерни процедури за интимно здраве, възстановяване и подмладяване.' },

  // ── Лазерна стоматология ─────────────────────────────────────
  { title: 'Лазерно лечение на кариес', category: 'dental', description: 'Безконтактно и щадящо лазерно лечение с минимален дискомфорт. Идеално за деца и тревожни пациенти.' },
  { title: 'Ортодонтия', category: 'dental', description: 'Съвременно изправяне на зъби за здрава функция и хармонична усмивка.' },
  { title: 'Избелване на зъби', category: 'dental', description: 'Професионално избелване за видимо по-бяла и сияйна усмивка.' },
  { title: 'Пародонтално здраве', category: 'dental', description: 'Профилактика и поддържане на здрави венци и пародонт.' },
  { title: 'Керамични корони', category: 'dental', description: 'Естетични керамични корони за естествен вид и здравина.' },
]

/**
 * Равномерно разпределение на точки по сфера (Fibonacci sphere), превърнато
 * в lat/lon. Така сферата се справя с произволен брой процедури без ръчно
 * позициониране на всеки етикет.
 */
function fibonacciLatLon(index: number, total: number): { lat: number; lon: number } {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const y = 1 - (index / Math.max(total - 1, 1)) * 2 // 1 → -1
  const lat = Math.asin(Math.max(-1, Math.min(1, y))) * (180 / Math.PI)
  let lon = ((goldenAngle * index) * (180 / Math.PI)) % 360
  if (lon > 180) lon -= 360
  return { lat, lon }
}

export const procedures: Procedure[] = seeds.map((seed, i) => {
  const { lat, lon } = fibonacciLatLon(i, seeds.length)
  return { ...seed, lat, lon }
})
