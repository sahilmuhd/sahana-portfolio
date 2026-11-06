import { useCallback, useState } from 'react'
import CharacterCanvas from './CharacterCanvas.jsx'

// ✎ Edit your copy here. Empty fields ('') are hidden on the page until you fill them in.
const content = {
  name: 'Sahana',
  fullName: 'Sahana C.',
  title: 'CMA Intermediate Qualified | Accounting & Taxation Professional',
  eyebrow: 'Portfolio — 2026',
  line: 'CMA Intermediate Qualified. Accounting & Taxation Professional.',
  blurb: 'Cleared both CMA Intermediate groups in the first attempt. Now pursuing CMA Final while gaining practical experience in accounting and taxation.',
  nav: [['About', '#about'], ['Experience', '#experience'], ['Skills', '#skills'], ['Art', '#art'], ['Contact', '#contact']],

  contact: {
    location: 'Malappuram, Kerala, India',
    email: '',    // e.g. 'name@example.com'
    phone: '',    // e.g. '+91 98765 43210'
    linkedin: '', // full URL, e.g. 'https://www.linkedin.com/in/your-profile'
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
      status: 'Both groups cleared, first attempt',
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
      <header className="row-head">
        <span className="num">{number}</span>
        <h2>{title}</h2>
      </header>
      <div className="row-body">{children}</div>
    </section>
  )
}

const Ledger = ({ items }) => (
  <ul className="ledger">
    {items.map(item => <li key={item}>{item}</li>)}
  </ul>
)

export default function App() {
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const { contact } = content

  return (
    <>
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
          <a className="cta" href="#about">View profile <span aria-hidden>→</span></a>
        </aside>

        <footer className="foot rise" style={{ '--d': '.9s' }}>
          <span>Move your cursor</span>
          <span className="rule" />
          <span>Scroll to read</span>
        </footer>
      </main>

      <div className="sheet">
        <Section id="about" number="01" title="Profile">
          <p className="lead">{content.profile.lead}</p>
          <div className="prose">
            {content.profile.body.map(p => <p key={p}>{p}</p>)}
          </div>
        </Section>

        <Section id="education" number="02" title="Qualifications">
          {content.education.filter(q => q.note || q.programme).map(q => (
            <article className="entry" key={q.title}>
              <div className="entry-top">
                <h3>{q.title}</h3>
                <span className="status">{q.status}</span>
              </div>
              <p className="org">{q.org}</p>
              <p className="note">{q.note || q.programme}</p>
            </article>
          ))}
        </Section>

        <Section id="experience" number="03" title="Experience">
          <article className="entry">
            <div className="entry-top">
              <h3>{content.experience.role}</h3>
              <span className="status">{content.experience.period}</span>
            </div>
            <p className="note">{content.experience.summary}</p>
            <h4>Key responsibilities and exposure</h4>
            <Ledger items={content.experience.duties} />
          </article>
        </Section>

        <Section id="skills" number="04" title="Skills">
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

        <Section id="direction" number="05" title="Direction">
          <h4>Career objective</h4>
          <p className="lead">{content.objective[0]}</p>
          <div className="prose"><p>{content.objective[1]}</p></div>
          <h4>Areas of professional interest</h4>
          <Ledger items={content.interests} />
        </Section>
      </div>

      <div className="sheet studio">
        <Section id="art" number="06" title="Creative Side">
          <h4>{art.tagline}</h4>
          <p className="lead">{art.lead}</p>
          <div className="prose">
            {art.body.map(p => <p key={p}>{p}</p>)}
          </div>

          <div className="split studio-lists">
            <div>
              <h4>Creative interests</h4>
              <Ledger items={art.interests} />
            </div>
            <div>
              <h4>My creative approach</h4>
              <dl className="approach">
                {art.approach.map(([term, text]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <figure className="studio-quote">
            <figcaption>Creative philosophy</figcaption>
            <blockquote>“{art.philosophy}”</blockquote>
          </figure>

          <h4>My vision</h4>
          <p className="lead">{art.vision}</p>
        </Section>
      </div>

      <footer id="contact" className="close">
        <div className="close-inner">
          <figure>
            <figcaption>Professional philosophy</figcaption>
            <blockquote>“{content.philosophy}”</blockquote>
          </figure>

          <div className="card">
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
