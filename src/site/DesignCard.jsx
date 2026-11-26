import PhoneFrame from './PhoneFrame'
import './catalog.css'
import { designTitle } from './designI18n'
import { useLang } from './i18n'

const SOON = { hy: 'Շուտով', ru: 'Скоро', en: 'Coming soon' }

// Per-design accent tones, falling back to a per-category tone for designs
// that don't have a built, real visual yet. Keeps the thumbnail honest: a
// built design gets its own real palette, an unbuilt one gets a neutral
// "concept" tone rather than pretending to show a finished design.
const DESIGN_TONES = {
  'wd-beige': { bg: 'linear-gradient(160deg,#F3ECE1 0%,#EEE1D2 55%,#E7D7C2 100%)', ink: '#8A6A3F' },
}
const CATEGORY_TONES = {
  wedding: { bg: 'linear-gradient(160deg,#F6ECE9 0%,#F3E6EC 100%)', ink: '#B0893F' },
  birthday: { bg: 'linear-gradient(160deg,#F6ECE4 0%,#EAEFE1 100%)', ink: '#8A9A63' },
  baptism: { bg: 'linear-gradient(160deg,#F6EFE9 0%,#ECE6F2 100%)', ink: '#9B86B5' },
  genderReveal: { bg: 'linear-gradient(160deg,#F7ECEF 0%,#E8EEF5 100%)', ink: '#8C93B5' },
  corporate: { bg: 'linear-gradient(160deg,#EFEFEF 0%,#E6E6EC 100%)', ink: '#4B4256' },
}

function monogram(title) {
  const words = title.split(/\s+/).filter((w) => /[\p{L}]/u.test(w) && w.length > 1)
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join(' ')
}

// The design's face: a phone-framed screenshot for web invitations, the
// printed artwork itself for card invitations.
export function DesignThumb({ design }) {
  const { lang } = useLang()
  if (design.kind === 'card') {
    return <div className="thumb card-thumb"><design.Art /></div>
  }
  const tone = DESIGN_TONES[design.id] || CATEGORY_TONES[design.category]
  return (
    <div className="thumb">
      <PhoneFrame>
        {design.image ? (
          <img src={design.image} alt={designTitle(design, lang)} />
        ) : (
          <div className="phone-art" style={{ background: tone.bg }}>
            <span className="thumb-mono" style={{ color: tone.ink }}>{monogram(design.title)}</span>
          </div>
        )}
      </PhoneFrame>
      {design.available === false && <span className="thumb-soon">{SOON[lang]}</span>}
    </div>
  )
}

// One catalog card, shared by the public /invitations catalogs and the
// dashboard's design picker so both always present a design identically.
// Context-specific parts come in as props: `children` for extra body
// content (e.g. price options), `actions` for the button row.
export default function DesignCard({ design, label, className = '', badge, children, actions, actionsClassName = '' }) {
  return (
    <article className={`catalog-card ${className}`.trim()}>
      <div className="thumb-wrap">
        <DesignThumb design={design} />
        {badge && <span className="thumb-badge">{badge}</span>}
      </div>
      <div className="card-body">
        <p className="card-cat">{label}</p>
        <h3>{design.code}</h3>
        {design.desc && <p className="card-desc">{design.desc}</p>}
        {children}
      </div>
      <div className={`card-actions ${actionsClassName}`.trim()}>{actions}</div>
    </article>
  )
}
