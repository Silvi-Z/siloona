import { useEffect, useState } from 'react'
import Editable from '../../shared/Editable'
import GuestGreeting from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import Rv from './Rv'

const pad = (n) => String(n).padStart(2, '0')

function useCountdown(iso) {
  const [left, setLeft] = useState(null)
  useEffect(() => {
    const target = new Date(iso).getTime()
    function tick() {
      const diff = target - Date.now()
      if (!(diff > 0)) { setLeft({ done: true }); return false }
      setLeft({
        d: pad(Math.floor(diff / 864e5)),
        h: pad(Math.floor((diff % 864e5) / 36e5)),
        m: pad(Math.floor((diff % 36e5) / 6e4)),
        s: pad(Math.floor((diff % 6e4) / 1e3)),
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
  if (!left) return null
  if (left.done) return <Editable as="p" path="countdownDone" className="count-done" />
  const units = [['d', 'ՕՐ'], ['h', 'ԺԱՄ'], ['m', 'ՐՈՊԵ'], ['s', 'ՎԱՅՐԿՅԱՆ']]
  return (
    <Rv className="count">
      {units.map(([k, label]) => <div key={k}><b>{left[k]}</b><span>{label}</span></div>)}
    </Rv>
  )
}

// Greeting, message and countdown share one page section; each can be
// hidden on its own, and the section disappears only when all three are.
export default function InviteSection() {
  const isHidden = useSectionHidden()
  if (isHidden('greeting') && isHidden('message') && isHidden('countdown')) return null
  return (
    <section id="gpb-invite">
      <div className="wrap">
        <Section id="greeting">
          <Rv as="h2">
            <GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting>
          </Rv>
        </Section>
        <Section id="message">
          <Rv><Editable as="p" path="message" className="lead" /></Rv>
        </Section>
        <Section id="countdown"><Countdown /></Section>
      </div>
    </section>
  )
}
