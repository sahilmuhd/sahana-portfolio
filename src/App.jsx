import { useCallback, useState } from 'react'
import CharacterCanvas from './CharacterCanvas.jsx'

// ✎ Edit your copy here
const content = {
  name: 'Sahana',
  eyebrow: 'Portfolio — 2026',
  line: 'Selected work, made with quiet intent.',
  blurb: 'A considered body of work across brand, product and story — crafted slowly, shipped with care.',
  nav: [['Work', '#work'], ['About', '#about'], ['Contact', '#contact']],
}

export default function App() {
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  return (
    <main className={`hero ${ready ? 'is-ready' : ''}`}>
      <div className="stage">
        <CharacterCanvas onReady={onReady} />
      </div>

      <header className="bar">
        <a className="mark" href="#top" aria-label={content.name}>S.</a>
        <nav>
          {content.nav.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
        </nav>
      </header>

      <section className="copy">
        <p className="eyebrow rise" style={{ '--d': '.15s' }}>{content.eyebrow}</p>
        <h1 className="rise" style={{ '--d': '.3s' }}>{content.name}</h1>
        <p className="line rise" style={{ '--d': '.5s' }}>{content.line}</p>
      </section>

      <aside className="aside rise" style={{ '--d': '.7s' }}>
        <p>{content.blurb}</p>
        <a className="cta" href="#work">View selected work <span aria-hidden>→</span></a>
      </aside>

      <footer className="foot rise" style={{ '--d': '.9s' }}>
        <span>Move your cursor</span>
        <span className="rule" />
        <span>01 / 04</span>
      </footer>
    </main>
  )
}
