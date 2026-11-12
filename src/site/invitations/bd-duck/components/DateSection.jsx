import { useEffect, useState } from 'react'
import Editable from '../../shared/Editable'
import Section from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import { formatEventDate } from '../lib/formatDate'
import { Decor, Rv } from './bits'

const pad = (n, l) => String(n).padStart(l, '0')

function useCountdown(iso) {
  const [left, setLeft] = useState(null)
  useEffect(() => {
    const target = new Date(iso).getTime()
    function tick() {
      const diff = target - Date.now()
      if (!(diff > 0)) { setLeft({ done: true }); return false }
      setLeft({
        d: pad(Math.floor(diff / 864e5), 3),
        h: pad(Math.floor((diff % 864e5) / 36e5), 2),
        m: pad(Math.floor((diff % 36e5) / 6e4), 2),
        s: pad(Math.floor((diff % 6e4) / 1e3), 2),
      })
      return true
    }
    if (!tick()) return
    const id = setInterval(() => { if (!tick()) clearInterval(id) }, 1000)
    return () => clearInterval(id)
  }, [iso])
  return left
}

function Countdown() {
  const { data } = useInvitationContent()
  const left = useCountdown(data.eventDate)
  return (
    <>
      <Rv as="p" className="lab rv" style={{ marginTop: 'clamp(44px,8vw,64px)' }}><Editable path="countdown.label" /></Rv>
      <Rv className="cnt rv" style={{ '--dl': '.1s' }}>
        {left?.done
          ? <Editable as="b" path="countdown.done" className="done" />
          : [['d', 'օր'], ['h', 'ժամ'], ['m', 'րոպե'], ['s', 'վրկ']].map(([k, label]) => (
            <div key={k}><b>{left ? left[k] : '00'}</b><span>{label}</span></div>
          ))}
      </Rv>
    </>
  )
}

// The arched date card. `eventDate` is the one editable control (the big
// day number doubles as it); weekday / month / time derive from it.
export default function DateSection() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <section className="datesec">
      <Decor id="d2" />
      <Rv className="card rv">
        <Editable as="p" path="dateNote" className="k" />
        <p className="dd">{d.weekday}</p>
        <Editable as="div" path="eventDate" type="date" className="dn" format={(iso) => formatEventDate(iso).day} />
        <p className="mn">{d.monthYear}</p>
        <hr />
        <p className="tm">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7V12L15 14" /></svg>
          ժամը {d.time}
        </p>
      </Rv>
      <div className="z3"><Section id="countdown"><Countdown /></Section></div>
    </section>
  )
}
