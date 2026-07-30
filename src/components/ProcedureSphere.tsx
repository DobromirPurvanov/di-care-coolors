import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { sphereProcedures as labelData, categoryById, type Procedure } from '../data/procedures'
import { useTheme } from '../theme/theme-context'

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.trim().replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return `rgba(255,255,255,${alpha})`
  const value = Number.parseInt(normalized, 16)
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`
}

export default function ProcedureSphere() {
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  // activeIdxRef остава винаги null — цикълът на анимацията го чете за culling.
  const activeIdxRef = useRef<number | null>(null)
  // Навигацията се ползва в императивните listener-и на етикетите.
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  useEffect(() => { navigateRef.current = navigate }, [navigate])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const rootStyles = getComputedStyle(document.documentElement)
    const themeColor = (token: string) => rootStyles.getPropertyValue(token).trim()
    const pickColor = (...tokens: string[]) => {
      for (const token of tokens) {
        const value = themeColor(token)
        if (value) return value
      }
      return '#ffffff'
    }
    // Посветени токени за сферата (с fallback към action цветовете).
    const wireColor = pickColor('--color-sphere-wire', '--color-action')
    const orbitColor = pickColor('--color-sphere-orbit', '--color-action-hover')
    const nodeColor = pickColor('--color-sphere-node', '--color-action-strong')

    // Върху тъмно небе адитивното смесване е светлина; върху крем/тан то
    // избелва до невидимост. Светлите теми рисуват с нормално смесване —
    // мастилени линии върху хартия — и с по-плътни стойности.
    const isLightScheme = rootStyles.colorScheme.includes('light')
    const sphereBlending = isLightScheme ? THREE.NormalBlending : THREE.AdditiveBlending
    const shellOpacity = isLightScheme ? (isMobile ? 0.2 : 0.15) : (isMobile ? 0.11 : 0.085)
    const orbitOpacity = isLightScheme ? (isMobile ? 0.34 : 0.28) : (isMobile ? 0.25 : 0.17)
    const glowBase = isLightScheme ? 0.055 : (isMobile ? 0.18 : 0.13)
    const glowSwing = isLightScheme ? 0.02 : 0.05
    const twinkleBase = () => (isLightScheme ? 0.26 + Math.random() * 0.28 : 0.45 + Math.random() * 0.45)
    const twinkleSwing = isLightScheme ? 0.18 : 0.35

    const w = container.clientWidth
    const h = container.clientHeight
    // Кеширани размери на контейнера — ползват се в animate() за подредбата
    // на етикетите и се обновяват само в onResize().
    let viewW = w
    let viewH = h
    // Адаптивният world radius пази сходен визуален размер на CSS3D текста
    // както на 320px телефон, така и на по-широк таблет.
    const sphereRadius = isMobile
      ? Math.min(360, Math.max(200, w * 0.55))
      : 320

    // GL Renderer за звездите
    const scene = new THREE.Scene()
    const FOV = 70
    const camera = new THREE.PerspectiveCamera(FOV, w / h, 0.1, 2000)

    // Разстоянието на камерата се смята така, че цялата сфера (плюс етикетите)
    // да се побира в кадъра — И по височина, И по ширина. На тесни мобилни
    // екрани ограничението е ШИРИНАТА: с фиксирано разстояние страничните
    // етикети излизаха извън кадъра и се отрязваха — точно оттам „се чупеше".
    function fitDistance(width: number, height: number) {
      const halfV = (FOV * Math.PI) / 180 / 2
      const halfH = Math.atan(Math.tan(halfV) * (width / height))
      const distV = sphereRadius / Math.tan(halfV)
      const distH = sphereRadius / Math.tan(halfH)
      // 1.5 оставяше почти една трета празно място отстрани и смаляваше
      // етикетите. 1.29 приближава сферата, без да отрязва предните етикети.
      // На десктоп слизаме до 1.18: сферата запълва повече от кадъра, което
      // прави етикетите с ~6% по-едри и повече от тях минават прага за
      // четимост, вместо да бъдат скрити.
      const margin = isMobile ? 1.29 : 1.18
      return Math.max(distV, distH) * margin
    }
    camera.position.z = fitDistance(w, h)

    const glRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    glRenderer.setSize(w, h)
    glRenderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 2))
    container.appendChild(glRenderer.domElement)
    Object.assign(glRenderer.domElement.style, { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' })

    // CSS3D Renderer за етикетите
    const cssRenderer = new CSS3DRenderer()
    cssRenderer.setSize(w, h)
    Object.assign(cssRenderer.domElement.style, { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', pointerEvents: 'auto' })
    container.appendChild(cssRenderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, cssRenderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.autoRotate = !prefersReduced
    controls.autoRotateSpeed = isMobile ? 0.15 : 0.25
    controls.enablePan = false
    controls.minPolarAngle = Math.PI * 0.2
    controls.maxPolarAngle = Math.PI * 0.8
    controls.enableZoom = false

    // OrbitControls слага touch-action:none на своя елемент, което „заключва"
    // вертикалния скрол на страницата, докато пръстът е върху сферата (а тя
    // заема ~80% от височината на екрана). Връщаме pan-y: вертикалният жест
    // скролва страницата, хоризонталният върти сферата — така мобилният скрол
    // вече не се „чупи".
    cssRenderer.domElement.style.touchAction = 'pan-y'

    // Спираме въртенето докато мишката е над сферата — така всеки етикет
    // стои неподвижно и е лесен за клик.
    const pauseRotate = () => { if (!prefersReduced) controls.autoRotate = false }
    const resumeRotate = () => { if (!prefersReduced) controls.autoRotate = true }
    container.addEventListener('mouseenter', pauseRotate)
    container.addEventListener('mouseleave', resumeRotate)

    // Glow текстура — бяла, тонира се от material.color, така всяка тема
    // оцветява звездите/сиянието без нова текстура.
    function createGlowTexture(): THREE.CanvasTexture {
      const size = 64
      const c = document.createElement('canvas')
      c.width = size; c.height = size
      const ctx = c.getContext('2d')!
      const grad = ctx.createRadialGradient(size/2, size/2, 2, size/2, size/2, size/2)
      grad.addColorStop(0, '#ffffff')
      grad.addColorStop(0.2, hexToRgba('#ffffff', 0.5))
      grad.addColorStop(0.7, hexToRgba('#ffffff', 0.06))
      grad.addColorStop(1, hexToRgba('#ffffff', 0))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, size, size)
      return new THREE.CanvasTexture(c)
    }
    const glowTexture = createGlowTexture()

    // Звезди с twinkle ефект
    const twinkles: { mat: THREE.SpriteMaterial; phase: number; speed: number; base: number }[] = []
    function addStars(count = 220) {
      const stars = new THREE.Group()
      for (let i = 0; i < count; i++) {
        const u = Math.random(), v = Math.random()
        const theta = 2 * Math.PI * u
        const phi = Math.acos(2 * v - 1)
        const r = sphereRadius + (Math.random() - 0.5) * 10
        const size = Math.random() * 4 + 3
        const mat = new THREE.SpriteMaterial({ map: glowTexture, color: nodeColor, transparent: true, opacity: 0.9, blending: sphereBlending, depthWrite: false })
        const sprite = new THREE.Sprite(mat)
        sprite.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        )
        sprite.scale.set(size, size, 1)
        stars.add(sprite)
        twinkles.push({ mat, phase: Math.random() * Math.PI * 2, speed: 0.7 + Math.random() * 1.6, base: twinkleBase() })
      }
      scene.add(stars)
    }
    addStars(isMobile ? 150 : 220)

    // Фина геометрична обвивка и орбити очертават реалния обем на сферата.
    // Това са само няколко евтини линии — визуално запълват композицията,
    // без тежки частици, post-processing или допълнителен render loop.
    const shellGeometry = new THREE.IcosahedronGeometry(sphereRadius * 0.99, 2)
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: wireColor,
      wireframe: true,
      transparent: true,
      opacity: shellOpacity,
      depthWrite: false,
      blending: sphereBlending,
    })
    const shell = new THREE.Mesh(shellGeometry, shellMaterial)
    scene.add(shell)

    const orbitMaterial = new THREE.LineBasicMaterial({
      color: orbitColor,
      transparent: true,
      opacity: orbitOpacity,
      depthWrite: false,
      blending: sphereBlending,
    })
    const orbitGroup = new THREE.Group()
    const orbitGeometries: THREE.BufferGeometry[] = []

    function addOrbit(radius: number, rotationX: number, rotationY: number, rotationZ: number) {
      const points: THREE.Vector3[] = []
      const segments = 96
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const ring = new THREE.LineLoop(geometry, orbitMaterial)
      ring.rotation.set(rotationX, rotationY, rotationZ)
      orbitGeometries.push(geometry)
      orbitGroup.add(ring)
    }

    addOrbit(sphereRadius * 1.035, 0.18, 0.08, 0)
    addOrbit(sphereRadius * 1.055, 0.92, 0.28, 0.34)
    addOrbit(sphereRadius * 1.02, -0.78, -0.22, -0.48)
    scene.add(orbitGroup)

    // Централно златно сияние
    const centerGlowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: wireColor,
      transparent: true,
      opacity: glowBase,
      depthWrite: false,
      blending: sphereBlending,
    })
    const centerGlow = new THREE.Sprite(centerGlowMaterial)
    const centerGlowSize = sphereRadius * (isMobile ? 1.25 : 0.95)
    centerGlow.scale.set(centerGlowSize, centerGlowSize, 1)
    scene.add(centerGlow)

    // Етикети
    interface Label {
      obj: CSS3DObject
      element: HTMLDivElement
      target: THREE.Vector3
      /** Нетрансформираните размери на етикета — измерват се веднъж. */
      baseW: number
      baseH: number
      /** Базовият font-size в px (различен на тъч заради media query-то). */
      baseFont: number
    }
    const labels: Label[] = []

    /*
     * Двата проблема на етикетите преди това: (1) задните се смаляваха до
     * около 6px — нечетими, но кликаеми и във фокус реда; (2) се застъпваха
     * („INCONTILASE" върху „ЛИМФОДРЕНАЖНИ МАСАЖИ").
     *
     * И двата идват от това, че CSS3D мащабира етикета с перспективата, а
     * нищо не следеше какво излиза на екрана. Тук смятаме реалния екранен
     * размер и правоъгълник на всеки етикет и прилагаме две правила:
     *   - под MIN_LABEL_PX ефективен шрифт → скрий (нечетимо е по-лошо от липсващо);
     *   - припокриване с по-преден етикет → скрий по-задния.
     * Скритите излизат и от tab реда, и от hit-testing-а.
     */
    const MIN_LABEL_PX = 10.5
    /** Хлабина около правоъгълника, за да не се долепват плътно. */
    const COLLISION_PAD = 2

    /*
     * Стеснен диапазон на перспективното мащабиране.
     *
     * Чистата перспектива правеше предните етикети около 2 пъти по-едри от
     * задните: предните заемаха пол-екран и изтласкваха всичко зад себе си, а
     * задните падаха под четимото. Затова компенсираме мащаба на всеки етикет
     * така, че видимият му размер да стои между тези две граници (спрямо
     * базовите 13px ≈ 12px…18px). Дълбочината продължава да личи — от
     * телената сфера, от подредбата и от лекия фейд — но текстът остава четим
     * навсякъде и в кадъра се побират много повече процедури.
     */
    const APPARENT_MIN = 0.9
    const APPARENT_MAX = 1.04

    /** Перспективата, която CSS3DRenderer слага на контейнера (в px). */
    function cssPerspective(height: number) {
      return (0.5 * height) / Math.tan(((FOV / 2) * Math.PI) / 180)
    }
    let perspectivePx = cssPerspective(h)

    function hideLabel(el: HTMLDivElement) {
      // visibility (не display) — пази CSS transition-ите, но също така маха
      // елемента от tab реда и от hit-testing-а.
      el.style.visibility = 'hidden'
      el.style.pointerEvents = 'none'
      el.tabIndex = -1
    }

    function showLabel(el: HTMLDivElement, opacity: number) {
      el.style.visibility = 'visible'
      el.style.opacity = opacity.toFixed(2)
      el.style.pointerEvents = 'auto'
      el.tabIndex = 0
    }

    // Клик върху етикет → страницата на услугата, позиционирана на
    // конкретната процедура (ServicePage скролва и я маркира).
    function goToService(data: Procedure) {
      navigateRef.current(`/uslugi/${categoryById[data.category].slug}`, {
        state: { procedure: data.title },
      })
    }

    function addLabel(data: Procedure) {
      const el = document.createElement('div')
      el.className = 'label-tag'
      el.textContent = data.title
      el.tabIndex = 0
      el.setAttribute('role', 'button')
      el.setAttribute('aria-label', `Виж услугата за: ${data.title}`)

      // ВАЖНО: спираме натиска да стигне до OrbitControls (да не завърти сферата)
      // И замразяваме въртенето веднага — така етикетът стои неподвижно по
      // време на клика/тапа и навигацията е надеждна (и на десктоп, и на touch).
      el.addEventListener('pointerdown', (e) => { e.stopPropagation(); controls.autoRotate = false })
      el.addEventListener('pointerup', (e) => { e.stopPropagation() })
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        goToService(data)
      })
      // Клавиатурна навигация
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          goToService(data)
        }
      })
      el.addEventListener('mouseenter', () => { controls.autoRotate = false })
      el.addEventListener('mouseleave', () => { if (!prefersReduced) controls.autoRotate = true })

      const obj = new CSS3DObject(el)
      const r = sphereRadius + (Math.random() - 0.5) * 40
      const phi = (90 - data.lat) * Math.PI / 180
      const theta = (data.lon + 180) * Math.PI / 180
      const target = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      )

      const camDir = camera.position.clone().normalize()
      obj.position.copy(camDir.multiplyScalar(sphereRadius))
      obj.lookAt(target)

      scene.add(obj)
      labels.push({ obj, element: el, target, baseW: 0, baseH: 0, baseFont: 13 })
    }

    labelData.forEach((l) => addLabel(l))

    /**
     * Измерва нетрансформирания размер на етикета. Не може да стане тук, при
     * създаването: CSS3DRenderer вкарва елементите в документа чак при първия
     * render, а откъснат от DOM елемент връща offsetWidth 0 (и празен
     * computed style). Затова мерим лениво — по веднъж на етикет, в първия
     * кадър, в който вече е в документа.
     */
    function measure(label: Label) {
      if (label.baseW > 0 || !label.element.isConnected) return
      label.baseW = label.element.offsetWidth
      label.baseH = label.element.offsetHeight
      label.baseFont = parseFloat(getComputedStyle(label.element).fontSize) || 13
    }

    // Анимация
    const clock = new THREE.Clock()
    let elapsed = 0
    let animId: number
    let running = false
    let lastFrame = 0
    const frameInterval = isMobile ? 1000 / 30 : 0
    const worldPosition = new THREE.Vector3()
    const cameraDirection = new THREE.Vector3()
    const toLabelDirection = new THREE.Vector3()
    const projected = new THREE.Vector3()

    /** Буфери за подредбата на етикетите — преизползват се всеки кадър, за
        да не правим по два нови масива на 60fps. */
    interface Candidate {
      label: Label
      isActive: boolean
      viewDepth: number
      opacity: number
      left: number
      right: number
      top: number
      bottom: number
    }
    const candidates: Candidate[] = []
    const placed: Candidate[] = []

    function animate(now: number) {
      if (!running) return
      animId = requestAnimationFrame(animate)
      if (frameInterval && now - lastFrame < frameInterval) return
      lastFrame = now
      controls.update()

      // Времево-базирана конвергенция — еднаква скорост при всякакъв fps
      const dt = Math.min(clock.getDelta(), 0.25)
      elapsed += dt
      const k = 1 - Math.pow(0.046, dt)

      // Twinkle на звездите
      for (const t of twinkles) {
        t.mat.opacity = t.base + twinkleSwing * Math.sin(elapsed * t.speed + t.phase)
      }
      centerGlow.material.opacity = glowBase + glowSwing * Math.sin(elapsed * 0.8)
      if (!prefersReduced) {
        shell.rotation.y += dt * 0.035
        shell.rotation.x += dt * 0.012
        orbitGroup.rotation.y -= dt * 0.045
        orbitGroup.rotation.z += dt * 0.012
      }

      // Тези стойности са еднакви за всички етикети в кадъра — изчисляваме
      // ги веднъж, вместо по 30 пъти на frame.
      camera.getWorldDirection(cameraDirection)
      const dCamera = camera.position.length()

      const perspective = perspectivePx
      const halfW = viewW / 2
      const halfH = viewH / 2

      // Фаза 1 — за всеки етикет смятаме дълбочина, екранна позиция и реален
      // размер след перспективното мащабиране. Още нищо не пишем в DOM-а.
      candidates.length = 0
      labels.forEach((label, idx) => {
        measure(label)
        label.obj.position.lerp(label.target, k)
        label.obj.quaternion.copy(camera.quaternion)

        label.obj.getWorldPosition(worldPosition)
        toLabelDirection.copy(worldPosition).sub(camera.position).normalize()

        const isActive = activeIdxRef.current === idx

        /*
         * Кои етикети са „отпред".
         *
         * Тук стоеше отрязване по ДОПИРАТЕЛНАТА към сферата (dist > maxDist).
         * Геометрично това оставя видима само шапка от около 20% от сферата —
         * при 24 етикета това са 4-5 на кадър и сферата изглеждаше празна.
         * Правилният критерий е полусферата: косинусът на ъгъла между
         * посоката към етикета и посоката към камерата. -0.12 пуска малко
         * отвъд екватора, за да не изчезват етикетите точно на силуета.
         */
        const radius = worldPosition.length() || 1
        const facing = worldPosition.dot(camera.position) / (radius * dCamera)
        if (!isActive && facing < -0.12) {
          hideLabel(label.element)
          return
        }

        const dist = camera.position.distanceTo(worldPosition)
        // 0 = най-отпред, 1 = на ръба на видимото
        const progress = Math.min(Math.max((1 - facing) / 1.12, 0), 1)

        // Дълбочина ПО ОСТА НА ПОГЛЕДА — точно това дели перспективата,
        // затова с нея се смята и мащабът, а не с евклидовото разстояние.
        const viewDepth = toLabelDirection.dot(cameraDirection) * dist
        const rawScale = viewDepth > 1 ? perspective / viewDepth : 0
        const scale = Math.min(APPARENT_MAX, Math.max(APPARENT_MIN, rawScale))
        // Компенсация в 3D пространството: CSS3DRenderer ще умножи по
        // rawScale, затова тук делим на него, за да излезе точно `scale`.
        label.obj.scale.setScalar(rawScale > 0 ? scale / rawScale : 1)
        const fontPx = label.baseFont * scale

        // Нечетимият етикет е по-лош от липсващия: заема място, застъпва
        // съседите си и краде фокус, без да носи информация.
        if (!isActive && fontPx < MIN_LABEL_PX) {
          hideLabel(label.element)
          return
        }

        // Екранна позиция (NDC → пиксели спрямо центъра на контейнера).
        projected.copy(worldPosition).project(camera)
        const cx = projected.x * halfW
        const cy = -projected.y * halfH
        const w = label.baseW * scale
        const h = label.baseH * scale

        // Лек фейд към ръба — дълбочината да си личи, без да пада контрастът
        // под четимото (старият 0.35 фейд правеше далечните текстове бледи).
        const fadeStart = 0.6
        const opacity = progress > fadeStart
          ? 1 - ((progress - fadeStart) / (1 - fadeStart)) * 0.25
          : 1

        candidates.push({
          label,
          isActive,
          viewDepth,
          opacity: isActive ? 1 : opacity,
          left: cx - w / 2 - COLLISION_PAD,
          right: cx + w / 2 + COLLISION_PAD,
          top: cy - h / 2 - COLLISION_PAD,
          bottom: cy + h / 2 + COLLISION_PAD,
        })
      })

      // Фаза 2 — най-предните печелят мястото. Активният винаги остава.
      candidates.sort((a, b) => (a.isActive ? -1 : b.isActive ? 1 : a.viewDepth - b.viewDepth))

      placed.length = 0
      for (const c of candidates) {
        let blocked = false
        if (!c.isActive) {
          for (const p of placed) {
            if (c.left < p.right && c.right > p.left && c.top < p.bottom && c.bottom > p.top) {
              blocked = true
              break
            }
          }
        }
        if (blocked) {
          hideLabel(c.label.element)
        } else {
          showLabel(c.label.element, c.opacity)
          placed.push(c)
        }
      }

      glRenderer.render(scene, camera)
      cssRenderer.render(scene, camera)
    }

    function startAnimation() {
      if (running) return
      running = true
      lastFrame = 0
      clock.getDelta()
      animId = requestAnimationFrame(animate)
    }

    function stopAnimation() {
      if (!running) return
      running = false
      cancelAnimationFrame(animId)
    }

    // Най-голямата mobile оптимизация: освобождаваме WebGL/CSS3D render loop-а
    // веднага след като потребителят подмине сферата.
    const viewportObserver = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          entries => {
            if (entries.some(entry => entry.isIntersecting)) startAnimation()
            else stopAnimation()
          },
          { rootMargin: '120px 0px' }
        )
      : null

    if (viewportObserver) viewportObserver.observe(container)
    else startAnimation()

    // Resize
    function onResize() {
      const nw = container!.clientWidth
      const nh = container!.clientHeight
      // Кешираме размерите за подредбата на етикетите: clientWidth в animate()
      // би форсирал layout на всеки кадър, а те се менят само тук.
      viewW = nw
      viewH = nh
      perspectivePx = cssPerspective(nh)
      camera.aspect = nw / nh
      // Пресмятаме наново разстоянието — при завъртане на телефона или скриване
      // на адрес-лентата съотношението се променя и сферата пак трябва да пасне.
      // setLength е важно: промяната само на Z запазваше X/Y след завъртане и
      // при всеки следващ resize увеличаваше общото разстояние до камерата.
      camera.position.setLength(fitDistance(nw, nh))
      camera.updateProjectionMatrix()
      glRenderer.setSize(nw, nh)
      cssRenderer.setSize(nw, nh)
      controls.update()
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      container.removeEventListener('mouseenter', pauseRotate)
      container.removeEventListener('mouseleave', resumeRotate)
      viewportObserver?.disconnect()
      stopAnimation()
      controls.dispose()
      glRenderer.dispose()
      twinkles.forEach(t => t.mat.dispose())
      shellGeometry.dispose()
      shellMaterial.dispose()
      orbitGeometries.forEach(geometry => geometry.dispose())
      orbitMaterial.dispose()
      centerGlowMaterial.dispose()
      glowTexture.dispose()
      if (container.contains(glRenderer.domElement)) container.removeChild(glRenderer.domElement)
      if (container.contains(cssRenderer.domElement)) container.removeChild(cssRenderer.domElement)
    }
  }, [theme])

  return (
    <div
      ref={containerRef}
      className="procedure-sphere"
      style={{
        position: 'relative',
        cursor: 'grab',
        touchAction: 'pan-y',
      }}
    />
  )
}
