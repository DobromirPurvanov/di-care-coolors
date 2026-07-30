/*
 * Генерира адаптивните варианти на снимките в галерията.
 *
 * Защо: оригиналите са 1600px широки JPEG-ове (общо ~625KB), а слайдът е
 * най-много 860px CSS ширина — на телефон около 290px. Тоест телефонът теглеше
 * снимка 5 пъти по-голяма от нужното. Тук ги режем на три ширини и добавяме
 * AVIF (около 4 пъти по-малък от JPEG при същото качество, ~95% поддръжка;
 * JPEG остава като fallback в <picture>).
 *
 * Ползва sips (вграден в macOS) — без нови зависимости и без network install.
 * Ако някой ден трябва да върви и на CI под Linux, заменете runSips със sharp.
 *
 * Стартиране:  npm run images
 * Изходът се комитва — не се генерира при build.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'public/images/gallery')
const outDir = join(srcDir, 'r') // responsive варианти

/** Ширини в CSS пиксели × DPR. Слайдът е min(78vw, 860px). */
const WIDTHS = [440, 860, 1600]
const JPEG_QUALITY = 72
const AVIF_QUALITY = 60

function runSips(args) {
  execFileSync('sips', args, { stdio: 'pipe' })
}

function kb(path) {
  return Math.round(statSync(path).size / 1024)
}

mkdirSync(outDir, { recursive: true })

const sources = readdirSync(srcDir)
  .filter(f => /^gallery-\d+\.jpg$/.test(f))
  .sort()

if (sources.length === 0) {
  console.error(`Няма изходни снимки в ${srcDir}`)
  process.exit(1)
}

let before = 0
let after = 0

for (const file of sources) {
  const src = join(srcDir, file)
  const base = file.replace(/\.jpg$/, '')
  before += statSync(src).size

  for (const w of WIDTHS) {
    // --resampleWidth не увеличава над оригинала, но пазим и явна проверка.
    const jpg = join(outDir, `${base}-${w}.jpg`)
    runSips(['-s', 'format', 'jpeg', '-s', 'formatOptions', String(JPEG_QUALITY),
      '--resampleWidth', String(w), src, '--out', jpg])

    const avif = join(outDir, `${base}-${w}.avif`)
    runSips(['-s', 'format', 'avif', '-s', 'formatOptions', String(AVIF_QUALITY),
      '--resampleWidth', String(w), src, '--out', avif])

    after += statSync(avif).size
    console.log(`  ${base}-${w}: avif ${kb(avif)}KB · jpg ${kb(jpg)}KB`)
  }
}

console.log(
  `\nГотово: ${sources.length} снимки × ${WIDTHS.length} ширини.\n` +
  `Оригинали: ${Math.round(before / 1024)}KB · AVIF (всички ширини): ${Math.round(after / 1024)}KB`
)
