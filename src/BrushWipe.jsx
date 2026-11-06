import { useEffect, useRef } from 'react'

// Colours sampled from Sahana's paintings. Each stroke paints itself as the band scrolls through.
const STROKES = [
  { c: '#6fb7e8', w: 62, from: 0, to: .4, d: 'M-120 118 C 260 60, 520 170, 820 104 S 1300 70, 1580 128' },
  { c: '#b9a4e6', w: 46, from: .08, to: .46, d: 'M1560 170 C 1180 214, 900 136, 600 186 S 140 214, -120 160' },
  { c: '#3f7d4c', w: 86, from: .16, to: .58, d: 'M-120 238 C 240 186, 560 296, 900 226 S 1320 206, 1580 252' },
  { c: '#d9365a', w: 44, from: .28, to: .66, d: 'M1560 300 C 1200 262, 880 340, 560 288 S 120 276, -120 318' },
  { c: '#a8532a', w: 78, from: .38, to: .78, d: 'M-120 360 C 300 318, 620 408, 960 346 S 1360 332, 1580 376' },
  { c: '#f3c978', w: 130, from: .52, to: .92, d: 'M1560 408 C 1160 374, 800 452, 460 398 S 80 390, -120 424' },
  { c: '#f3c978', w: 150, from: .66, to: 1, d: 'M-120 486 C 300 452, 700 520, 1040 470 S 1400 462, 1580 492' },
]

const clamp01 = v => Math.min(1, Math.max(0, v))

export default function BrushWipe() {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    const paths = [...svg.querySelectorAll('[data-stroke]')]
    const paint = p => paths.forEach((el, i) => {
      const { from, to } = STROKES[i]
      el.style.strokeDashoffset = 1 - clamp01((p - from) / (to - from))
    })
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { paint(1); return }

    let raf = 0
    const update = () => {
      raf = 0
      const r = svg.getBoundingClientRect()
      const vh = window.innerHeight
      paint(clamp01((vh - r.top) / (r.height + vh * .45)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <svg ref={svgRef} className="brush" viewBox="0 0 1440 560" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id="bristle" x="-5%" y="-20%" width="110%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".006 .11" numOctaves="3" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="34" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g className="brush-strokes" filter="url(#bristle)" fill="none" strokeLinecap="round">
        {STROKES.map(s => (
          <path key={s.d} data-stroke d={s.d} stroke={s.c} strokeWidth={s.w} pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
        ))}
      </g>
      <rect x="0" y="524" width="1440" height="36" fill="#f3c978" />
    </svg>
  )
}
