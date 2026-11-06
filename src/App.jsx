import { useCallback, useEffect, useState } from 'react'
import CharacterCanvas from './CharacterCanvas.jsx'
import BrushWipe from './BrushWipe.jsx'
import Desk from './Desk.jsx'
import PaintPad from './PaintPad.jsx'

// ✎ Edit your copy here. Empty fields ('') are hidden on the page until you fill them in.
const content = {
  name: 'Sahana',
  fullName: 'Sahana C.',
  title: 'CMA Intermediate Qualified | Accounting & Taxation Professional',
  eyebrow: 'CMA Intermediate Qualified · Evolving Artist',
  line: ['By day, the ledger.', 'By heart, the canvas.'],
  blurb: 'Cleared both CMA Intermediate groups in the first attempt. Now pursuing CMA Final, and painting whenever the books are closed.',
  nav: [['The Ledger', '#ledger'], ['The Canvas', '#art'], ['Contact', '#contact']],
  marquee: ['GST', 'Drawing', 'Tally', 'Painting', 'Bank reconciliation', 'Colour', 'TDS', 'Landscapes', 'Winman', 'Experiments', 'Tax audit', 'Imagination'],

  // ✎ The closing "balance sheet": each row pairs one side of her with the other.
  balance: [
    ['Analytical and logical thinking', 'Imagination beyond conventional boundaries'],
    ['Attention to detail', 'Observation of everyday details'],
    ['Practical problem-solving', 'Experimentation with techniques and materials'],
    ['Professional discipline', 'Freedom of expression'],
    ['Continuous improvement', 'Every artwork, a step forward'],
  ],

  contact: {
    location: 'Malappuram, Kerala, India',
    email: 'sahanacsahanac36@gmail.com',
    phone: '',    // e.g. '+91 98765 43210'
    linkedin: 'https://www.linkedin.com/in/sahana-c-6951bb384',
  },

  profile: {
    lead: 'An aspiring Cost and Management Accounting professional with a strong academic foundation in accounting, taxation, financial management and cost management.',
    body: [
      'A CMA Intermediate-qualified candidate who cleared both groups in the first attempt and is currently pursuing CMA Final while gaining practical experience in accounting and taxation.',
      'Currently developing hands-on experience in GST compliance, bookkeeping, financial records, statutory filings, LLP registrations and tax-related activities, with an interest in how financial information supports business decisions, cost control, budgeting and organisational performance.',
      'A responsible, adaptable and detail-oriented individual who values continuous learning, professional discipline and practical problem-solving.',
    ],
  },

  education: [
    {
      title: 'CMA Final',
      org: 'The Institute of Cost Accountants of India (ICMAI)',
      status: 'Pursuing',
      note: 'Advancing knowledge in strategic financial management, corporate reporting, taxation and professional management accounting.',
    },
    {
      title: 'CMA Intermediate',
      org: 'The Institute of Cost Accountants of India (ICMAI)',
      status: 'Both groups cleared,',
      ring: 'first attempt',
      note: 'Strong academic foundation in financial accounting, cost accounting, corporate accounting, taxation, financial management and management accounting.',
    },
    // ✎ Hidden until a programme is added: fill in `programme` and `status` (current year).
    { title: 'IGNOU', org: 'Indira Gandhi National Open University', status: '', programme: '' },
  ],

  experience: {
    role: 'Practical Training — Accounting & Taxation',
    period: '2026 – Present',
    summary: 'Gaining practical exposure to accounting, taxation and statutory compliance through professional training.',
    duties: [
      'Assisting with GST return preparation and filing',
      'Bookkeeping and maintenance of accounting records',
      'Working with Tally for accounting entries and verification',
      'Using Winman for tax-related work and computations',
      'Assisting with LLP registration and statutory compliance',
      'Supporting tax audit documentation and verification',
      'Handling financial records, reconciliations and accounting discrepancies',
      'Working with TDS-related documentation and compliance',
      'Assisting in reviewing financial transactions and supporting documents',
    ],
  },

  skills: [
    'Accounting and bookkeeping',
    'GST compliance and return filing',
    'Tally accounting software',
    'Winman tax software',
    'Microsoft Excel (Basic)',
    'Financial statement understanding',
    'Bank reconciliation',
    'TDS compliance',
    'Tax audit documentation',
    'LLP statutory compliance',
  ],

  strengths: [
    'Analytical and logical thinking',
    'Attention to detail',
    'Willingness to learn',
    'Adaptability to new responsibilities',
    'Accountability and professional discipline',
    'Interest in practical problem-solving',
    'Continuous improvement mindset',
  ],

  objective: [
    'To build a meaningful career in Cost and Management Accounting and financial analysis, where I can combine my academic knowledge with practical business experience.',
    'My long-term objective is to develop expertise in financial planning, budgeting, cost management and strategic decision-making, contributing to organisations through accurate financial insights and effective management practices.',
  ],

  interests: [
    'Cost and Management Accounting',
    'Financial Planning and Analysis (FP&A)',
    'Budgeting and Forecasting',
    'Cost Control and Cost Reduction',
    'Financial Reporting and Analysis',
    'Business Decision-Making',
    'Management Information Systems (MIS)',
    'SAP and Enterprise Resource Planning (ERP)',
  ],

  philosophy: 'I believe professional growth comes from combining knowledge with practical experience, maintaining discipline and continuously improving the way we understand and solve problems.',
}

const art = {
  tagline: 'Art • Creativity • Visual Expression',
  lead: 'I am a creatively curious individual who enjoys exploring ideas through art, colours, design and visual expression.',
  body: [
    'For me, creativity is not limited to technical skills or perfect execution. It is about imagination, experimentation and the freedom to turn an idea into something meaningful.',
    'I enjoy observing details, experimenting with different artistic approaches and discovering beauty in ordinary things. I believe every creative attempt is an opportunity to learn, improve and express a different part of myself.',
    'I consider myself an evolving artist, always curious to explore new techniques, perspectives and possibilities.',
  ],
  // ✎ Images live in public/art. Captions are descriptive, so rename them to your own titles if you like.
  gallery: [
    { src: '/art/daisy-meadow.webp', w: 736, h: 731, title: 'Daisy meadow', alt: 'Painting on canvas of a winding path through a green meadow of white daisies under a blue and lilac sky' },
    { src: '/art/sunset-miniatures.webp', w: 736, h: 916, title: 'Sunset miniatures', alt: 'Two small paintings of copper-brown sunset skies with silhouetted foliage, resting on an open book' },
    { src: '/art/garden-path.webp', w: 736, h: 1040, title: 'Garden path', alt: 'Painting on canvas of a stone garden path and steps lined with red roses and colourful flowers' },
    { src: '/art/pencil-sketch.webp', w: 736, h: 835, title: 'Pencil sketch', alt: 'Pencil sketch in a spiral notepad of a long-haired woman beside a small dog holding flowers, next to a tin of pencils' },
    { src: '/art/strawberries.webp', w: 736, h: 1040, title: 'Strawberries', alt: 'Small painting of ripe strawberries and green leaves, taped to a wooden table with a hand adding details' },
  ],
  interests: [
    'Drawing and sketching',
    'Painting and canvas art',
    'Landscape and nature-inspired artwork',
    'Colour combinations and visual aesthetics',
    'Creative experimentation',
    'Interior aesthetics and visual design',
    'Digital art and creative concepts',
  ],
  approach: [
    ['Imagination', 'Exploring ideas beyond conventional boundaries.'],
    ['Experimentation', 'Learning through trying different techniques and materials.'],
    ['Observation', 'Finding inspiration in everyday surroundings, nature and details.'],
    ['Expression', 'Using visual elements to communicate feelings, ideas and perspectives.'],
    ['Growth', 'Treating every artwork as a step towards developing my creative identity.'],
  ],
  philosophy: 'Art doesn’t always have to be perfect to be meaningful. Sometimes, the beauty lies in the process of creating something that didn’t exist before.',
  vision: 'To continue exploring my creative abilities, develop my artistic style and build a collection of work that reflects my imagination, personality and growth.',
}

function Section({ id, number, title, children }) {
  return (
    <section id={id} className="row">
      <header className="row-head" data-reveal>
        <span className="num">{number}</span>
        <h2>{title}</h2>
      </header>
      <div className="row-body">{children}</div>
    </section>
  )
}

function Chapter({ book, title, line }) {
  return (
    <header className="chapter" data-reveal>
      <p className="chapter-book">{book}</p>
      <h2>{title}</h2>
      <p className="chapter-line">{line}</p>
    </header>
  )
}

// A ledger list. Each entry gets a red auditor's tick, drawn when it scrolls into view.
const Ledger = ({ items }) => (
  <ul className="ledger" data-reveal="draw">
    {items.map((item, i) => (
      <li key={item} style={{ '--i': i }}>
        <span>{item}</span>
        <svg className="tick" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M3 13 C 6 15, 8 18, 9 21 C 12 13, 16 8, 22 3" /></svg>
      </li>
    ))}
  </ul>
)

const Ring = ({ children }) => (
  <span className="ring" data-reveal="draw">
    {children}
    <svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength="1" d="M34 12 C 84 -1, 176 0, 192 24 C 204 46, 124 59, 62 56 C 14 54, -6 36, 10 20 C 24 7, 76 3, 128 8" />
    </svg>
  </span>
)

const SWATCHES = ['#6fb7e8', '#d9365a', '#3f7d4c', '#a78fe0', '#a8532a']

export default function App() {
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const { contact } = content

  useEffect(() => {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { rootMargin: '0px 0px -8% 0px' })
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <main id="top" className={`hero ${ready ? 'is-ready' : ''}`}>
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
          <h1 aria-label={content.name}>
            {[...content.name].map((letter, i) => (
              <span className="letter" aria-hidden="true" key={i} style={{ '--d': `${.25 + i * .07}s` }}>{letter}</span>
            ))}
          </h1>
          <p className="line rise" style={{ '--d': '.8s' }}>{content.line.map(part => <span key={part}>{part}</span>)}</p>
        </section>

        <aside className="aside rise" style={{ '--d': '1s' }}>
          <p>{content.blurb}</p>
          <a className="cta" href="#ledger">Open the ledger <span aria-hidden>→</span></a>
        </aside>

        <footer className="foot rise" style={{ '--d': '1.2s' }}>
          <span>Move your cursor</span>
          <span className="rule" />
          <span>Scroll</span>
        </footer>
      </main>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map(copy => (
            <span key={copy}>{content.marquee.map(word => <span key={word}>{word}<i>✦</i></span>)}</span>
          ))}
        </div>
      </div>

      <div id="ledger" className="sheet book">
        <Chapter book="Book one" title="The Ledger" line="Everything here adds up." />

        <Section id="about" number="Folio 01" title="Profile">
          <p className="lead" data-reveal>{content.profile.lead}</p>
          <div className="prose" data-reveal>
            {content.profile.body.map(p => <p key={p}>{p}</p>)}
          </div>
        </Section>

        <Section id="education" number="Folio 02" title="Qualifications">
          {content.education.filter(q => q.note || q.programme).map(q => (
            <article className="entry" key={q.title} data-reveal>
              <div className="entry-top">
                <h3>{q.title}</h3>
                <span className="status">{q.status}{q.ring && <> <Ring>{q.ring}</Ring></>}</span>
              </div>
              <p className="org">{q.org}</p>
              <p className="note">{q.note || q.programme}</p>
            </article>
          ))}
        </Section>

        <Section id="experience" number="Folio 03" title="Experience">
          <article className="entry">
            <div className="entry-top" data-reveal>
              <h3>{content.experience.role}</h3>
              <span className="status">{content.experience.period}</span>
            </div>
            <p className="note" data-reveal>{content.experience.summary}</p>
            <h4>Key responsibilities and exposure</h4>
            <Ledger items={content.experience.duties} />
          </article>
        </Section>

        <Section id="skills" number="Folio 04" title="Skills">
          <div className="split">
            <div>
              <h4>Technical skills</h4>
              <Ledger items={content.skills} />
            </div>
            <div>
              <h4>Professional strengths</h4>
              <Ledger items={content.strengths} />
            </div>
          </div>
        </Section>

        <Section id="direction" number="Folio 05" title="Direction">
          <h4>Career objective</h4>
          <p className="lead" data-reveal>{content.objective[0]}</p>
          <div className="prose" data-reveal><p>{content.objective[1]}</p></div>
          <h4>Areas of professional interest</h4>
          <Ledger items={content.interests} />
        </Section>

        <p className="turn" data-reveal>But the numbers are only half the story.</p>
      </div>

      <BrushWipe />

      <div id="art" className="sheet studio">
        <Chapter book="Book two" title="The Canvas" line={art.tagline} />

        <Section id="artist" number="Plate 01" title="About me">
          <p className="lead" data-reveal>{art.lead}</p>
          <div className="prose" data-reveal>
            {art.body.map(p => <p key={p}>{p}</p>)}
          </div>
        </Section>

        <section id="work" className="wide">
          <header className="row-head" data-reveal>
            <span className="num">Plate 02</span>
            <h2>On the desk</h2>
          </header>
          <Desk works={art.gallery} />
        </section>

        <section id="approach" className="wide">
          <header className="row-head" data-reveal>
            <span className="num">Plate 03</span>
            <h2>My creative approach</h2>
          </header>
          <dl className="approach">
            {art.approach.map(([term, text], i) => (
              <div key={term} data-reveal style={{ '--c': SWATCHES[i] }}>
                <span className="dab" aria-hidden="true" />
                <dt>{term}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
          <h4 className="interests-head">Creative interests</h4>
          <ul className="interests" data-reveal>
            {art.interests.map(item => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section id="yourturn" className="wide turn-yours">
          <figure data-reveal>
            <figcaption>Creative philosophy</figcaption>
            <blockquote>“{art.philosophy}”</blockquote>
          </figure>
          <PaintPad />
        </section>

        <section className="wide vision-block" data-reveal>
          <h4>My vision</h4>
          <p>{art.vision}</p>
        </section>
      </div>

      <section id="balance" className="balance">
        <div className="bs" data-reveal="draw">
          <header>
            <p className="chapter-book">Closing entry</p>
            <h2>The Balance Sheet</h2>
          </header>
          <table>
            <thead>
              <tr><th scope="col">The Ledger</th><th scope="col">The Canvas</th></tr>
            </thead>
            <tbody>
              {content.balance.map(([left, right]) => <tr key={left}><td>{left}</td><td>{right}</td></tr>)}
            </tbody>
            <tfoot>
              <tr><td>{content.fullName}</td><td>{content.fullName}</td></tr>
            </tfoot>
          </table>
          <div className="dbl" aria-hidden="true" />
          <p className="stamp">Balanced</p>
        </div>
      </section>

      <footer id="contact" className="close">
        <div className="close-inner">
          <figure data-reveal>
            <figcaption>Professional philosophy</figcaption>
            <blockquote>“{content.philosophy}”</blockquote>
          </figure>

          <div className="card" data-reveal>
            <p className="card-name">{content.fullName}</p>
            <p className="card-title">{content.title}</p>
            <ul className="links">
              <li>{contact.location}</li>
              {contact.email && <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
              {contact.phone && <li><a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a></li>}
              {contact.linkedin && <li><a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>}
            </ul>
          </div>
        </div>
        <p className="colophon">© 2026 {content.fullName}</p>
      </footer>
    </>
  )
}
