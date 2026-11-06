import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Cursor-tracking character. No CSS 3D, no <video> at runtime — just 64 pre-extracted
 * WebP frames (i=0 is UP, increasing clockwise, 5.625° apart) + center.webp.
 * Each rAF tick draws EXACTLY ONE frame at 100% opacity: no cross-fades, so no ghosting.
 */
const TAU = Math.PI * 2
const RESPONSE = 0.26        // per-frame (60fps) angular response -> ~35ms to settle
const DEADZONE = 0.12        // fraction of the screen -> look straight at the visitor
const DEADZONE_EXIT = 1.15   // hysteresis so the boundary never flickers
const SEAL_DEADZONE = 70     // px around the corner seal -> look straight at the visitor
const SEAL_SIZE = 192        // seal canvas resolution
const SEAL_CROP = .54        // face crop for the seal, as a fraction of frame height

// shortest-path circular lerp
const lerpAngle = (a, b, t) => {
  const d = ((((b - a + Math.PI) % TAU) + TAU) % TAU) - Math.PI
  return a + d * t
}

async function loadBitmap(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  return createImageBitmap(blob)
}

export default function CharacterCanvas({ onReady }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const sealRef = useRef(null)
  const sealCanvasRef = useRef(null)
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/frames/meta.json').then(r => r.json()).then(m => {
      if (cancelled) return
      document.documentElement.style.setProperty('--bg', m.background) // exact decoded frame colour
      setMeta(m)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!meta) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    const N = meta.count
    const STEP = TAU / N
    const startAngle = (meta.startAngleDeg * Math.PI) / 180 // -90° = UP
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0, dead = false
    let center = null
    const frames = new Array(N).fill(null)
    let loaded = 0
    const pointer = { x: 0, y: 0, active: false }
    let angle = startAngle, inDead = true
    let drawn = null, cw = 0, ch = 0
    let rect = canvas.getBoundingClientRect()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      rect = canvas.getBoundingClientRect()
      cw = Math.round(rect.width * dpr); ch = Math.round(rect.height * dpr)
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch }
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
      drawn = null // force redraw
    }
    const ro = new ResizeObserver(resize); ro.observe(canvas); resize()

    const onMove = e => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true }
    const onLeave = () => { pointer.active = false }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    const onScroll = () => { rect = canvas.getBoundingClientRect() }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Once the hero scrolls away she keeps watching from a small seal in the corner.
    const seal = sealRef.current
    const sealCtx = sealCanvasRef.current.getContext('2d', { alpha: false })
    let sealOn = false
    const heroIO = new IntersectionObserver(([entry]) => {
      sealOn = entry.intersectionRatio < .3
      seal.classList.toggle('show', sealOn)
    }, { threshold: [0, .3, 1] })
    heroIO.observe(wrapRef.current)

    const draw = (bmp, key) => {
      if (!bmp || drawn === key) return
      ctx.drawImage(bmp, 0, 0, cw, ch) // one opaque frame, nothing blended
      const side = bmp.height * SEAL_CROP
      sealCtx.drawImage(bmp, bmp.width * meta.anchor[0] - side / 2, bmp.height * meta.anchor[1] - side / 2, side, side, 0, 0, SEAL_SIZE, SEAL_SIZE)
      drawn = key
    }

    let last = performance.now()
    const tick = now => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(now - last, 64); last = now
      if (!center) return

      let bmp = center, key = 'c'
      if (!reduceMotion && pointer.active && loaded === N) {
        const sealRect = sealOn ? seal.getBoundingClientRect() : null
        const fx = sealRect ? sealRect.left + sealRect.width / 2 : rect.left + rect.width * meta.anchor[0]
        const fy = sealRect ? sealRect.top + sealRect.height / 2 : rect.top + rect.height * meta.anchor[1]
        const dx = pointer.x - fx, dy = pointer.y - fy
        const dist = Math.hypot(dx, dy)
        const R = sealRect ? SEAL_DEADZONE : DEADZONE * Math.max(window.innerWidth, window.innerHeight)
        inDead = dist < R * (inDead ? DEADZONE_EXIT : 1)
        // fast circular smoothing (frame-rate independent: equals 0.26 at 60fps)
        const k = 1 - Math.pow(1 - RESPONSE, dt / 16.667)
        angle = lerpAngle(angle, Math.atan2(dy, dx), k)
        if (!inDead) {
          const idx = ((Math.round((angle - startAngle) / STEP) % N) + N) % N
          bmp = frames[idx]; key = idx
        }
      }
      draw(bmp, key)
    }

    ;(async () => {
      center = await loadBitmap('/frames/center.webp')
      if (dead) return
      draw(center, 'c'); onReady?.()
      raf = requestAnimationFrame(tick)
      if (reduceMotion) return
      await Promise.all(Array.from({ length: N }, (_, i) =>
        loadBitmap(`/frames/${String(i).padStart(2, '0')}.webp`).then(b => { frames[i] = b; loaded++ })))
    })()

    return () => {
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); heroIO.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      window.removeEventListener('scroll', onScroll)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      frames.forEach(f => f && f.close()); center && center.close()
    }
  }, [meta, onReady])

  return (
    <div className="character" ref={wrapRef} style={meta ? { aspectRatio: `${meta.width} / ${meta.height}` } : undefined}>
      <canvas ref={canvasRef} aria-label="Portrait of Sahana, whose gaze follows your cursor" role="img" />
      {createPortal(
        <a ref={sealRef} className="seal" href="#top" aria-label="Back to top">
          <canvas ref={sealCanvasRef} width={SEAL_SIZE} height={SEAL_SIZE} />
          <svg className="seal-ring" viewBox="0 0 100 100" aria-hidden="true">
            <defs><path id="seal-circle" d="M50 50 m-41 0 a41 41 0 1 1 82 0 a41 41 0 1 1 -82 0" /></defs>
            <text><textPath href="#seal-circle">SAHANA C. • THE LEDGER • THE CANVAS •</textPath></text>
          </svg>
        </a>,
        document.body,
      )}
    </div>
  )
}
