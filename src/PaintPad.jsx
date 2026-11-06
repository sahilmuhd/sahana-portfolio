import { useEffect, useRef, useState } from 'react'

const COLOURS = [
  ['Rose', '#d9365a'], ['Meadow', '#3f7d4c'], ['Sky', '#4fa6e0'],
  ['Lilac', '#a78fe0'], ['Copper', '#a8532a'], ['Ink', '#2b1410'],
]
const WIDTH = 1000, HEIGHT = 640, PAPER = '#fffdf7'
const BRISTLES = Array.from({ length: 22 }, () => ({
  a: Math.random() * Math.PI * 2, r: Math.sqrt(Math.random()), w: .8 + Math.random() * 3.4,
}))

export default function PaintPad() {
  const canvasRef = useRef(null)
  const stroke = useRef(null)
  const [colour, setColour] = useState(COLOURS[0][1])
  const [blank, setBlank] = useState(true)

  const clear = () => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = PAPER
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    setBlank(true)
  }
  useEffect(clear, [])

  const point = e => {
    const r = canvasRef.current.getBoundingClientRect()
    return { x: (e.clientX - r.left) * WIDTH / r.width, y: (e.clientY - r.top) * HEIGHT / r.height }
  }

  const onDown = e => {
    e.currentTarget.setPointerCapture(e.pointerId)
    stroke.current = point(e)
    setBlank(false)
    onMove(e)
  }

  const onMove = e => {
    if (!stroke.current) return
    const ctx = canvasRef.current.getContext('2d')
    const from = stroke.current, to = point(e)
    // Slow strokes spread the brush wide; quick ones pull it thin.
    const radius = Math.max(9, 30 - Math.hypot(to.x - from.x, to.y - from.y) * .35)
    ctx.strokeStyle = colour
    ctx.lineCap = 'round'
    ctx.globalAlpha = .62
    for (const b of BRISTLES) {
      const ox = Math.cos(b.a) * b.r * radius, oy = Math.sin(b.a) * b.r * radius
      ctx.lineWidth = b.w
      ctx.beginPath()
      ctx.moveTo(from.x + ox, from.y + oy)
      ctx.lineTo(to.x + ox + .01, to.y + oy)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    stroke.current = to
  }

  const onUp = () => { stroke.current = null }

  return (
    <div className="pad">
      <div className="pad-paper">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          role="img"
          aria-label="A blank canvas you can paint on with your mouse or finger"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
        {blank && <p className="pad-hint">your turn. paint something.</p>}
      </div>
      <div className="pad-tools">
        <div className="pad-colours" role="group" aria-label="Paint colour">
          {COLOURS.map(([name, value]) => (
            <button
              key={value}
              type="button"
              aria-label={name}
              aria-pressed={colour === value}
              style={{ background: value }}
              onClick={() => setColour(value)}
            />
          ))}
        </div>
        <button type="button" className="pad-clear" onClick={clear}>Start over</button>
      </div>
    </div>
  )
}
