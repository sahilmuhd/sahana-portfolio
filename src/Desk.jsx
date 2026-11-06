import { useRef, useState } from 'react'

// Where each print lands on the desk: left %, top %, tilt in degrees (same order as the gallery).
const SPOTS = [[1, 3, -6], [50, 16, -3], [25, 7, 3], [6, 52, 4], [72, 3, 5]]
const DRAG_THRESHOLD = 5

export default function Desk({ works }) {
  const [open, setOpen] = useState(null)
  const dialogRef = useRef(null)
  const topZ = useRef(10)
  const drag = useRef(null)
  const justDragged = useRef(false)

  const onPointerDown = e => {
    // Touch keeps normal swiping; phones get a swipeable strip instead.
    if (e.pointerType === 'touch' || window.matchMedia('(max-width: 820px)').matches) return
    const el = e.currentTarget
    drag.current = {
      el, x: e.clientX, y: e.clientY, moved: false,
      dx: parseFloat(el.style.getPropertyValue('--dx')) || 0,
      dy: parseFloat(el.style.getPropertyValue('--dy')) || 0,
    }
    el.setPointerCapture(e.pointerId)
    el.style.zIndex = ++topZ.current
    el.classList.add('lifted')
  }

  const onPointerMove = e => {
    const d = drag.current
    if (!d) return
    const mx = e.clientX - d.x, my = e.clientY - d.y
    if (Math.hypot(mx, my) > DRAG_THRESHOLD) d.moved = true
    d.el.style.setProperty('--dx', `${d.dx + mx}px`)
    d.el.style.setProperty('--dy', `${d.dy + my}px`)
  }

  const onPointerUp = () => {
    const d = drag.current
    if (!d) return
    d.el.classList.remove('lifted')
    justDragged.current = d.moved
    drag.current = null
  }

  const view = work => {
    if (justDragged.current) { justDragged.current = false; return }
    setOpen(work)
    dialogRef.current.showModal()
  }

  return (
    <>
      <div className="desk" data-reveal="draw">
        {works.map((work, i) => (
          <button
            key={work.src}
            type="button"
            className="piece"
            aria-label={`View ${work.title}`}
            style={{ left: `${SPOTS[i][0]}%`, top: `${SPOTS[i][1]}%`, '--r': `${SPOTS[i][2]}deg`, '--i': `${i * 110}ms` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={() => view(work)}
          >
            <img src={work.src} alt={work.alt} width={work.w} height={work.h} loading="lazy" draggable={false} />
            <span className="piece-title">{work.title}</span>
          </button>
        ))}
        <p className="desk-hint desk-hint-drag">go on, move them around. click one for a closer look.</p>
      </div>
      <p className="desk-hint desk-hint-swipe">swipe through, tap one for a closer look</p>

      <dialog
        ref={dialogRef}
        className="lightbox"
        onClick={e => { if (e.target === dialogRef.current) dialogRef.current.close() }}
      >
        {open && (
          <figure>
            <img src={open.src} alt={open.alt} width={open.w} height={open.h} />
            <figcaption>{open.title}</figcaption>
          </figure>
        )}
        <button type="button" className="lightbox-close" onClick={() => dialogRef.current.close()}>Close</button>
      </dialog>
    </>
  )
}
