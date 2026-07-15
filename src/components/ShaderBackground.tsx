import { useEffect, useRef } from 'react'

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) return

    let animId: number
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const dpr = Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5)

    function resize() {
      if (!canvas || !gl) return
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const vertSrc = `
      attribute vec2 a_pos;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `

    const fragSrc = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec3 u_bg;
      uniform vec3 u_accent;
      uniform vec3 u_secondary;
      uniform vec3 u_star;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        vec2 center = vec2(0.5, 0.45);
        float dist = length(uv - center);

        // Radial gradient - dark blue center glow
        float glow = exp(-dist * dist * 4.0) * 0.12;
        float glow2 = exp(-dist * dist * 1.5) * 0.04;

        // Nebula noise
        float n = noise(uv * 3.0 + u_time * 0.02) * 0.5 + 0.5;
        float n2 = noise(uv * 5.0 - u_time * 0.015) * 0.5 + 0.5;
        float nebula = n * n2 * 0.06 * exp(-dist * 2.0);

        // Stars
        float stars = 0.0;
        for (float i = 1.0; i < 4.0; i++) {
          vec2 grid = floor(uv * (200.0 * i)) / (200.0 * i);
          float h = hash(grid + i * 100.0);
          if (h > 0.995) {
            float twinkle = sin(u_time * (1.0 + h * 3.0) + h * 10.0) * 0.3 + 0.7;
            float size = 1.0 / (200.0 * i * u_res.x);
            float starDist = length(uv - (grid + 0.5 / (200.0 * i)));
            stars += exp(-starDist * starDist * 200000.0 * i) * twinkle * (1.0 - dist * 0.5);
          }
        }

        // Shooting stars
        float shoot = 0.0;
        for (float i = 0.0; i < 3.0; i++) {
          float t = fract(u_time * 0.08 + i * 0.33);
          vec2 sp = vec2(
            fract(hash(vec2(i, 1.0)) + t * 0.4) * 1.4 - 0.2,
            fract(hash(vec2(i, 2.0)) - t * 0.3) * 1.2 + 0.1
          );
          vec2 dir = vec2(0.4, -0.3);
          vec2 toStar = uv - sp;
          float along = dot(toStar, dir);
          float across = abs(dot(toStar, vec2(-dir.y, dir.x)));
          float trail = exp(-across * across * 8000.0) * exp(-along * along * 200.0) * smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.7, t);
          shoot += trail * 0.26;
        }

        vec3 color = u_bg;
        // Theme-aware central glow
        color += u_accent * glow;
        color += u_secondary * glow2;
        // Subtle nebula
        color += u_secondary * nebula;
        // Stars
        color += u_star * stars * 0.7;
        // Shooting stars inherit the active palette
        color += mix(u_accent, u_star, 0.35) * shoot;

        gl_FragColor = vec4(color, 1.0);
      }
    `

    function compileShader(src: string, type: number) {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s, src)
      gl!.compileShader(s)
      return s
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compileShader(vertSrc, gl.VERTEX_SHADER))
    gl.attachShader(prog, compileShader(fragSrc, gl.FRAGMENT_SHADER))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uBg = gl.getUniformLocation(prog, 'u_bg')
    const uAccent = gl.getUniformLocation(prog, 'u_accent')
    const uSecondary = gl.getUniformLocation(prog, 'u_secondary')
    const uStar = gl.getUniformLocation(prog, 'u_star')

    const readCssColor = (token: string) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim().replace('#', '')
      const normalized = /^[0-9a-f]{6}$/i.test(value) ? value : 'ffffff'
      const number = Number.parseInt(normalized, 16)
      return new Float32Array([
        ((number >> 16) & 255) / 255,
        ((number >> 8) & 255) / 255,
        (number & 255) / 255,
      ])
    }

    const syncThemeColors = () => {
      gl.uniform3fv(uBg, readCssColor('--shader-bg'))
      gl.uniform3fv(uAccent, readCssColor('--shader-accent'))
      gl.uniform3fv(uSecondary, readCssColor('--shader-secondary'))
      gl.uniform3fv(uStar, readCssColor('--shader-star'))
    }
    syncThemeColors()
    window.addEventListener('dicare:themechange', syncThemeColors)

    resize()
    window.addEventListener('resize', resize)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const startTime = performance.now()
    const staticFrame = reduced || isMobile

    const drawFrame = () => {
      const t = (performance.now() - startTime) / 1000
      gl!.uniform1f(uTime, t)
      gl!.uniform2f(uRes, canvas!.width, canvas!.height)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
    }
    const loop = () => {
      drawFrame()
      animId = requestAnimationFrame(loop)
    }

    // На мобилно фонът е статичен: запазва визията, но освобождава GPU за
    // скрол, формите и 3D сферата. На десктоп остава напълно анимиран.
    if (staticFrame) drawFrame()
    else animId = requestAnimationFrame(loop)

    // Паузираме, докато табът е скрит — пести батерия/топлина на мобилни.
    const onVisibility = () => {
      cancelAnimationFrame(animId)
      if (!document.hidden && !staticFrame) animId = requestAnimationFrame(loop)
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('dicare:themechange', syncThemeColors)
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 'var(--shader-opacity)',
        transition: 'opacity 320ms ease',
      }}
    />
  )
}
