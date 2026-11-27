import { useEffect, useMemo, useState } from 'react'
import { useFeature, useInvitationContent } from './EditableContext'
import { directionsUrl, liveState, scheduleParts, taxiUrl, yerevanMs } from './liveTimes'
import './liveSchedule.css'

// «Կենդանի ծրագիր + տաքսի» on the event's day: in the design's own
// programme list, the part on now is marked «Հիմա», the parts already over
// fade, and by the next part «Ճանապարհ» (maps) and «Տաքսի» (Yandex Go)
// appear. Before and after that day the programme is as it always is.
// Only on invitations with the live_schedule add-on.
//
// A design uses it in its programme:
//   const live = useLiveSchedule()
//   <li className={live.cls(i, 'r')}> … <LiveStep live={live} i={i} /> </li>
//
// Testing: ?now=2027-06-12T15:30 (Yerevan time) shows any moment of the
// day — only in development and on preview deployments, never on the
// live site.

const TEXT = {
  hy: { now: 'Հիմա', next: 'Հաջորդը', route: 'Ճանապարհ', taxi: 'Տաքսի' },
  ru: { now: 'Сейчас', next: 'Далее', route: 'Маршрут', taxi: 'Такси' },
  en: { now: 'Now', next: 'Next', route: 'Directions', taxi: 'Taxi' },
}

// ?now= is honoured only off the production site.
export function testNowAllowed(host = typeof location !== 'undefined' ? location.hostname : '') {
  if (import.meta.env?.DEV) return true
  return /^(localhost|127\.\d+\.\d+\.\d+)$/.test(host) || host.endsWith('.vercel.app')
}
function testNow() {
  if (typeof location === 'undefined' || !testNowAllowed()) return null
  const v = new URLSearchParams(location.search).get('now')
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{1,2}:\d{2})/.exec(v || '')
  return m ? yerevanMs(m[1], m[2]) : null
}

const OFF = { active: false, now: null, next: null, past: new Set() }
const isApple = () => typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document

export function useLiveSchedule() {
  const { data, editing } = useInvitationContent()
  const on = useFeature('live_schedule') && !editing
  const fixed = useMemo(() => (on ? testNow() : null), [on])
  const [now, setNow] = useState(() => fixed ?? Date.now())
  // keeps itself current, without reloading the page
  useEffect(() => {
    if (!on || fixed != null) return undefined
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 30 * 1000)
    return () => clearInterval(id)
  }, [on, fixed])
  const state = on ? liveState(data, fixed ?? now) : OFF
  const parts = useMemo(() => (state.active ? scheduleParts(data).parts : []), [state.active, data])
  const lang = TEXT[data?.lang] ? data.lang : 'hy'
  return {
    ...state,
    parts,
    lang,
    cls: (i, base = '') => [base, state.past.has(i) && 'live-past', state.now === i && 'live-now', state.next === i && 'live-next'].filter(Boolean).join(' ') || undefined,
  }
}

const same = (a, b) => !!a && !!b && a.name === b.name && a.address === b.address

// «Հիմա» on the part going on; «Ճանապարհ» + «Տաքսի» by the next one when
// it is somewhere else than where the guests are now.
export function LiveStep({ live, i }) {
  if (!live.active) return null
  const t = TEXT[live.lang]
  if (live.now === i) return <span className="ls-now">{t.now}</span>
  if (live.next !== i) return null
  const place = live.parts[i]?.place
  const here = live.now != null ? live.parts[live.now]?.place : null
  if (!place || same(place, here)) return <span className="ls-next">{t.next}</span>
  const route = directionsUrl(place, isApple())
  return (
    <span className="ls-acts" aria-label={t.next}>
      {route && <a className="ls-btn" href={route} target="_blank" rel="noopener noreferrer">{t.route}</a>}
      <a className="ls-btn" href={taxiUrl(place, live.lang)} target="_blank" rel="noopener noreferrer">{t.taxi}</a>
    </span>
  )
}
