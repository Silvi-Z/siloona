import Editable from '../../shared/Editable'
import { useInvitationContent } from '../../shared/EditableContext'
import { HERO_ART } from '../lib/art'
import { formatEventDate } from '../lib/date'
import { Art } from './parts'

// The ivory curtain: drawn monogram, names letter by letter, tap hint.
// Its halves slide apart when the root gets `.opened`.
export function Curtain({ onOpen }) {
  const { data } = useInvitationContent()
  const { first, second } = data.couple
  const names = `${first} և ${second}`
  const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }
  return (
    <div className="curtain" role="button" tabIndex={0} aria-label="Բացել հրավերը" onClick={onOpen} onKeyDown={key}>
      <div className="half l grain" /><div className="half r grain" />
      <div className="cin">
        <svg className="mono draw" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
          <circle pathLength="1" cx="60" cy="60" r="54" /><circle pathLength="1" cx="60" cy="60" r="49" opacity=".5" />
          <path pathLength="1" d="M22 84c-6-14-2-30 10-40M98 84c6-14 2-30-10-40M30 92c10 8 50 8 60 0" />
          <text x="33" y="72">{Array.from(first || '')[0]}</text><text x="62" y="72">{Array.from(second || '')[0]}</text>
        </svg>
        <div className="cn" aria-label={names}>
          {Array.from(names).map((c, k) => <span key={k} style={{ '--k': k }}>{c === ' ' ? ' ' : c}</span>)}
        </div>
        <div className="ctap">{data.curtain.hint}</div>
      </div>
    </div>
  )
}

export function Hero({ shown }) {
  const { data, editing } = useInvitationContent()
  const rv = shown ? 'rv in' : 'rv'
  return (
    <header className="hero">
      <div className="art" aria-hidden="true">
        <Art svg={HERO_ART} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" data-m="6" />
        <div className="bokeh">
          <i style={{ left: '12%', top: '20%', width: 90, height: 90 }} />
          <i style={{ left: '62%', top: '14%', width: 140, height: 140, animationDelay: '-3s' }} />
          <i style={{ left: '82%', top: '46%', width: 70, height: 70, animationDelay: '-6s' }} />
          <i style={{ left: '30%', top: '58%', width: 110, height: 110, animationDelay: '-2s' }} />
        </div>
      </div>
      <div className="htxt">
        <p className={`std ${rv}`} style={{ '--i': 0 }}><Editable path="hero.kicker" /></p>
        <h1 className={`hn ${rv}`} style={{ '--i': 1 }}>
          {editing
            ? <><Editable path="couple.first" /><em>և</em><Editable path="couple.second" /></>
            : <>{data.couple.first}<em>և</em>{data.couple.second}</>}
        </h1>
        <p className={`hd ${rv}`} style={{ '--i': 2 }}>
          <Editable path="eventDate" type="date" format={(iso) => formatEventDate(iso).short} />
        </p>
      </div>
      <div className="cue" aria-hidden="true" />
    </header>
  )
}
