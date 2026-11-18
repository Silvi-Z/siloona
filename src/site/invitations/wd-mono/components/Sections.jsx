import { useEffect, useRef, useState } from 'react'
import Editable from '../../shared/Editable'
import EditablePhoto from '../../shared/EditablePhoto'
import { RowAdd, RowRemove } from '../../shared/ListEdit'
import GuestGreeting, { fillName } from '../../shared/GuestGreeting'
import Section, { useSectionHidden } from '../../shared/Section'
import { useInvitationContent } from '../../shared/EditableContext'
import Icon, { ICON_NAMES } from './Icons'
import Torn from './Torn'
import { formatEventDate } from '../lib/date'

// One part of the paper. Gets `.in` once it scrolls into view; its `.r`
// children fade up from that, staggered by --i.
function Block({ className = '', children, label, id }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect() }
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <section ref={ref} id={id} className={`blk ${className}`} aria-label={label}>{children}</section>
}

// Armenian names are set in the light serif (italic); Latin ones in the
// script face (no script font draws Armenian well).
const isArmenian = (s) => /[Ա-և]/.test(s || '')
function Names({ className = '' }) {
  const { data } = useInvitationContent()
  const arm = isArmenian(data.couple.first) || isArmenian(data.couple.second)
  return (
    <span className={`${className} ${arm ? 'arm' : 'lat'}`}>
      <Editable path="couple.first" /><i className="amp"> &amp; </i><Editable path="couple.second" />
    </span>
  )
}

export function Hero() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <header className="hero">
      <EditablePhoto path="photos.hero" className="hero-ph" imgClassName="ph-img" loading="eager">
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-txt">
          <p className="kicker"><Editable path="hero.kicker" /></p>
          <h1><Names className="names" /></h1>
          <p className="hdate"><Editable path="eventDate" type="date" format={() => d.dots} /></p>
        </div>
      </EditablePhoto>
      <Torn side="bottom" seed={11} height={44} />
    </header>
  )
}

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.max(0, Math.floor((target - now) / 1000))
  return [[Math.floor(s / 86400), 'օր'], [Math.floor((s % 86400) / 3600), 'ժամ'], [Math.floor((s % 3600) / 60), 'րոպե'], [s % 60, 'վայրկյան']]
}

export function Countdown() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  const units = useCountdown(d.date.getTime())
  const isHidden = useSectionHidden()
  return (
    <Block className="count" label="Ամսաթիվ">
      <Section id="countdown">
        <p className="caps r"><Editable path="countdownTitle" /></p>
        <div className="cd r" style={{ '--i': 1 }} aria-live="off">
          {units.map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}
        </div>
      </Section>
      {!(isHidden('greeting') && isHidden('message')) && (
        <div className="msg r" style={{ '--i': 2 }}>
          <Section id="greeting">
            <p className="greet"><GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting></p>
          </Section>
          <Section id="message"><p className="body"><Editable path="message" /></p></Section>
        </div>
      )}
      <div className="dayrow r" style={{ '--i': 3 }}>
        <span className="side">{d.weekday}</span>
        <span className="day">{d.day}</span>
        <span className="side">{d.month}</span>
      </div>
    </Block>
  )
}

const PLACE_ICONS = ['church', 'glasses']

export function Places() {
  const { data, editing } = useInvitationContent()
  return (
    <Block className="places" label="Վայրերը">
      {data.places.map((p, i) => (
        <div key={i} className="place r" style={{ '--i': i }}>
          <Icon name={PLACE_ICONS[i] || 'pin'} size={54} className="ico" />
          <Editable as="h2" path={`places.${i}.label`} />
          <p className="body"><Editable path={`places.${i}.time`} /> · <Editable path={`places.${i}.name`} /></p>
          <Editable as="p" className="addr" path={`places.${i}.address`} />
          <a
            className="pill" target="_blank" rel="noopener noreferrer"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address || p.name || '')}`}
            onClick={editing ? (e) => e.preventDefault() : undefined}
          >
            <Editable path="mapButton" />
          </a>
        </div>
      ))}
    </Block>
  )
}

// A photo between torn paper edges.
export function PhotoBand({ path, seed, tall }) {
  return (
    <div className={`band${tall ? ' tall' : ''}`}>
      <Torn side="top" seed={seed} />
      <EditablePhoto path={path} className="band-ph" imgClassName="ph-img" />
      <Torn side="bottom" seed={seed + 5} />
    </div>
  )
}

export function Program() {
  const { data, editing, setField } = useInvitationContent()
  const cycle = (i) => {
    const cur = data.schedule[i].icon
    const next = ICON_NAMES[(ICON_NAMES.indexOf(cur) + 1) % ICON_NAMES.length]
    setField(`schedule.${i}.icon`, next)
  }
  return (
    <Block className="program" label="Օրվա ծրագիրը">
      <Editable as="h2" path="scheduleTitle" className="ttl r" />
      <ol className="tl">
        {data.schedule.map((s, i) => (
          <li key={i} className="r" style={{ '--i': Math.min(i + 1, 6) }}>
            {editing ? (
              <button type="button" className="ico-btn" onClick={() => cycle(i)} title="Փոխել պատկերակը" aria-label="Փոխել պատկերակը">
                <Icon name={s.icon || ICON_NAMES[i % ICON_NAMES.length]} size={50} />
              </button>
            ) : (
              <Icon name={s.icon || ICON_NAMES[i % ICON_NAMES.length]} size={50} className="ico" />
            )}
            <Editable as="time" path={`schedule.${i}.time`} />
            <Editable path={`schedule.${i}.label`} />
            <RowRemove list="schedule" index={i} />
          </li>
        ))}
      </ol>
      <RowAdd list="schedule" />
    </Block>
  )
}

const instagramUrl = (h) => {
  const v = String(h || '').trim()
  if (v.startsWith('#')) return `https://www.instagram.com/explore/tags/${encodeURIComponent(v.slice(1))}/`
  return `https://www.instagram.com/${encodeURIComponent(v.replace(/^@/, ''))}/`
}

export function Instagram() {
  const { data, editing } = useInvitationContent()
  return (
    <Block className="note" label="Instagram">
      <Icon name="photos" size={58} className="ico r" />
      <Editable as="h2" path="instagram.title" className="r" style={{ '--i': 1 }} />
      <Editable as="p" path="instagram.text" className="body r" style={{ '--i': 2 }} />
      <a className="pill r" style={{ '--i': 3 }} href={instagramUrl(data.instagram.handle)} target="_blank" rel="noopener noreferrer" onClick={editing ? (e) => e.preventDefault() : undefined}>
        <Editable path="instagram.handle" />
      </a>
    </Block>
  )
}

export function Playlist() {
  const { editing } = useInvitationContent()
  const isHidden = useSectionHidden()
  // The song is asked in the RSVP form: take the guest there.
  const toSong = () => {
    const f = document.getElementById('wmn-song')
    if (!f) return
    f.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => f.focus({ preventScroll: true }), 500)
  }
  return (
    <Block className="note" label="Երաժշտություն">
      <Icon name="music" size={58} className="ico r" />
      <Editable as="h2" path="playlist.title" className="r" style={{ '--i': 1 }} />
      <Editable as="p" path="playlist.text" className="body r" style={{ '--i': 2 }} />
      {!isHidden('rsvp') && (
        <button type="button" className="pill r" style={{ '--i': 3 }} onClick={editing ? undefined : toSong}>
          <Editable path="playlist.button" />
        </button>
      )}
    </Block>
  )
}

// Name, yes / no, party size and a song wish (yes only). Guest count is
// everyone coming (companions = index of the chosen option).
export function Rsvp() {
  const { data, editing, onRsvp } = useInvitationContent()
  const { rsvp } = data
  const [yes, setYes] = useState(true)
  const [err, setErr] = useState(false)
  const [thanks, setThanks] = useState('')
  const nameRef = useRef(null)

  function submit(e) {
    e.preventDefault()
    if (editing) return
    const f = e.target.elements
    const name = f.n.value.trim()
    setErr(!name)
    if (!name) { nameRef.current?.focus(); return }
    const idx = yes ? Math.max(0, f.g.selectedIndex) : 0
    const song = yes ? f.s.value.trim() : ''
    const note = yes ? [`Հյուրեր՝ ${rsvp.guestOptions[idx]}`, song && `Երգ՝ ${song}`].filter(Boolean).join(' · ') : ''
    onRsvp?.({ name, status: yes ? 'confirmed' : 'declined', plus: idx, note })
    setThanks(fillName(yes ? rsvp.thanksYes : rsvp.thanksNo, name.split(/\s+/)[0]))
  }

  return (
    <Block className="rsvp" label="Ներկայության հաստատում" id="wmn-rsvp">
      <Icon name="envelope" size={56} className="ico r" />
      <Editable as="h2" path="rsvp.title" className="r" style={{ '--i': 1 }} />
      <Editable as="p" path="rsvp.intro" className="body r" style={{ '--i': 2 }} />
      {thanks ? (
        <p className="thanks" role="status">{thanks}</p>
      ) : (
        <form className="form r" style={{ '--i': 3 }} noValidate onSubmit={submit}>
          <label className="field">
            <span className="lbl">Անուն, ազգանուն</span>
            <input
              ref={nameRef} type="text" name="n" autoComplete="name" required
              aria-invalid={err || undefined} aria-describedby={err ? 'wmn-err' : undefined}
              onInput={() => err && setErr(false)}
            />
            {err && <span id="wmn-err" className="err">{rsvp.nameError}</span>}
          </label>
          <div className="choice" role="radiogroup" aria-label="Ձեր պատասխանը">
            <label className={yes ? 'on' : ''}><input type="radio" name="a" checked={yes} onChange={() => setYes(true)} /><Editable path="rsvp.yes" /></label>
            <label className={!yes ? 'on' : ''}><input type="radio" name="a" checked={!yes} onChange={() => setYes(false)} /><Editable path="rsvp.no" /></label>
          </div>
          {yes && (
            <>
              <label className="field">
                <span className="lbl"><Editable path="rsvp.guestLabel" /></span>
                <select name="g">{rsvp.guestOptions.map((o) => <option key={o}>{o}</option>)}</select>
              </label>
              <label className="field">
                <span className="lbl"><Editable path="rsvp.songLabel" /></span>
                <input id="wmn-song" type="text" name="s" maxLength={120} placeholder="Երգը և կատարողը" />
              </label>
            </>
          )}
          <button className="pill send" type="submit"><Editable path="rsvp.button" /></button>
        </form>
      )}
    </Block>
  )
}

export function Closing() {
  const { data } = useInvitationContent()
  const d = formatEventDate(data.eventDate)
  return (
    <footer className="closing">
      <Torn side="top" seed={41} height={44} />
      <EditablePhoto path="photos.closing" className="close-ph" imgClassName="ph-img">
        <div className="close-shade" aria-hidden="true" />
        <div className="close-txt">
          <p className="kicker"><Editable path="closing.line" /></p>
          <p><Names className="names" /></p>
          <p className="hdate">{d.dots}</p>
        </div>
      </EditablePhoto>
    </footer>
  )
}
