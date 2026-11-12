import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../Reveal'
import '../home.css'
import tulipShot from '../invitations/wd-tulip/assets/catalog-thumb.webp'
import gardenShot from '../invitations/wd-garden-soft/assets/catalog-thumb.webp'
import planetShot from '../invitations/bd-planet/assets/catalog-thumb.webp'

// Home page — an editorial spread: asymmetric columns, hairlines instead
// of cards, ivory pages interrupted by burgundy, charcoal and pale-rose
// plates. Everything is scoped under .hm (see ../home.css).

// The hero's three phones, each showing one of our real invitations
// (its catalog screenshot) and opening its live preview. Order = paint
// order: back-right, left, front-centre.
const PHONES = [
  { pos: 'back', src: gardenShot, to: '/invitations/preview/wd-garden-soft', title: 'Աննա & Միքայել' },
  { pos: 'left', src: planetShot, to: '/invitations/preview/bd-planet', title: 'Արսենը դառնում է 5' },
  { pos: 'front', src: tulipShot, to: '/invitations/preview/wd-tulip', title: 'Դավիթ & Մարիամ' },
]

const OCCASIONS = [
  { label: 'Հարսանիք', category: 'wedding' },
  { label: 'Նշանադրություն' },
  { label: 'Ծննդյան օր', category: 'birthday' },
  { label: 'Կնունք', category: 'baptism' },
  { label: 'Տարեդարձ' },
  { label: 'Այլ միջոցառումներ' },
]

const STEPS = [
  { title: 'Ընտրեք', text: 'Գտեք ձեր միջոցառմանը և ոճին համապատասխան հրավիրատոմսը։' },
  { title: 'Անհատականացրեք', text: 'Ավելացրեք անունները, ամսաթիվը, վայրը և ձեր նախընտրած մանրամասները։' },
  { title: 'Հրավիրեք', text: 'Ստացեք ձեր հրավիրատոմսի հղումը և կիսվեք այն հյուրերի հետ։' },
]

const BENEFITS = [
  { title: 'Հարմար խմբագրում', text: 'Տեքստն ու մանրամասները փոխում եք ինքներդ՝ անմիջապես կայքում։' },
  { title: 'Մեկ հղում բոլոր հյուրերին', text: 'Հրավերը հասնում է հյուրերին վայրկյանների ընթացքում՝ առանց տպագրության։' },
  { title: 'Կարևոր մանրամասները մեկ վայրում', text: 'Ամսաթիվը, ժամը և վայրը միշտ հյուրի ձեռքի տակ են։' },
  { title: 'Մասնակցության հաստատում', text: 'Հյուրերը պատասխանում են հենց հրավերից, իսկ դուք տեսնում եք ամբողջ ցուցակը։' },
]

// The dashboard illustration — clearly marked «Օրինակ» (sample).
const SAMPLE_GUESTS = [
  { name: 'Մարիամ Հակոբյան', n: '2 հոգի', st: 'yes', label: 'Կգա' },
  { name: 'Տիգրան Սարգսյան', n: '4 հոգի', st: 'yes', label: 'Կգա' },
  { name: 'Լիլիթ Պետրոսյան', n: '1 հոգի', st: 'wait', label: 'Սպասվում է' },
  { name: 'Արամ Գրիգորյան', n: '2 հոգի', st: 'no', label: 'Չի գա' },
  { name: 'Նարե Ավետիսյան', n: '3 հոգի', st: 'yes', label: 'Կգա' },
]

const FAQ = [
  { q: 'Ինչպե՞ս պատվիրել թվային հրավիրատոմս', a: 'Ընտրեք հրավիրատոմսը հավաքածուից, լրացրեք ձեր միջոցառման տվյալները և ձևակերպեք պատվերը կայքում։' },
  { q: 'Կարո՞ղ եմ անհատականացնել հրավիրատոմսը', a: 'Այո։ Անունները, ամսաթիվը, վայրը և տեքստը փոխում եք ինքներդ։ Եթե ուզում եք ավելին, կարող եք պատվիրել ընտրած դիզայնի հարմարեցում կամ ամբողջովին նոր դիզայն։' },
  { q: 'Ինչպե՞ս են հյուրերը հաստատում մասնակցությունը', a: 'Հյուրը բացում է հրավերի հղումը և նշում իր պատասխանը։ Բոլոր պատասխանները տեսնում եք ձեր անձնական վահանակում։' },
  { q: 'Կարո՞ղ եմ հրավիրատոմսն ուղարկել WhatsApp-ով կամ Telegram-ով', a: 'Այո։ Հրավիրատոմսը հղում է, ուստի կարող եք ուղարկել այն ցանկացած հավելվածով կամ հաղորդագրությամբ։' },
]

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  )
}

function Pomegranate(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M24 13c-8.5 0-14 6-14 14.5S16 42 24 42s14-6 14-14.5S32.5 13 24 13Z" />
      <path d="M20 13l-2-6 3.5 2.5L24 5l2.5 4.5L30 7l-2 6" />
      <path d="M24 20c-3.5 2-5 5-5 8.5M24 20c3.5 2 5 5 5 8.5" opacity=".6" />
    </svg>
  )
}

function Phone({ pos, src, to, title }) {
  return (
    <Link className={`hm-phone hm-phone--${pos}`} to={to} aria-label={`Դիտել «${title}» հրավիրատոմսը`}>
      <span className="hm-bezel">
        <span className="hm-screen">
          <img src={src} alt="" loading="eager" decoding="async" />
          <i className="hm-island" />
          <i className="hm-glare" />
        </span>
      </span>
    </Link>
  )
}

function HeroStage() {
  return (
    <div className="hm-stage">
      <i className="hm-floor" aria-hidden="true" />
      <i className="hm-arch" aria-hidden="true" />
      <i className="hm-arch-line" aria-hidden="true" />
      <i className="hm-shadow" aria-hidden="true" />
      {PHONES.map((p) => <Phone key={p.pos} {...p} />)}
      <span className="hm-stage-note" aria-hidden="true">Մեր հրավիրատոմսերից</span>
    </div>
  )
}

function Faq() {
  const listRef = useRef(null)
  // One answer open at a time.
  function onToggle(e) {
    if (!e.currentTarget.open) return
    listRef.current?.querySelectorAll('details').forEach((d) => { if (d !== e.currentTarget) d.open = false })
  }
  return (
    <div className="hm-faq-list" ref={listRef}>
      {FAQ.map((f, i) => (
        <details key={f.q} open={i === 0} onToggle={onToggle}>
          <summary>{f.q} <i aria-hidden="true" /></summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <main className="hm">
      {/* Hero */}
      <section className="hm-hero">
        <div className="hm-wrap">
          <div className="hm-hero-text">
            <p className="hm-eyebrow">Թվային հրավիրատոմսերի ատելիե</p>
            <h1>Ամեն տոն <span className="hm-nw">սկսվում է</span> <em>հրավերից</em></h1>
            <div className="hm-lede">
              <p>Գեղեցիկ և անհատական թվային հրավիրատոմսեր ձեր կյանքի կարևոր պահերի համար։</p>
              {/* <p>Ընտրեք դիզայնը, անհատականացրեք այն և հրավիրեք ձեր հյուրերին մեկ հղումով։</p> */}
            </div>
            <div className="hm-actions">
              <Link className="hm-btn hm-btn-solid" to="/invitations">Դիտել հրավիրատոմսերը <Arrow /></Link>
              <a className="hm-link" href="#services">Ստեղծել անհատական հրավեր</a>
            </div>
          </div>
          <HeroStage />
        </div>
      </section>

      {/* Occasions */}
      <section className="hm-occasions" aria-labelledby="hm-occ-h">
        <div className="hm-wrap">
          <Reveal>
            <p className="hm-eyebrow">Առիթներ</p>
            <h2 id="hm-occ-h">Յուրաքանչյուր կարևոր պահի համար</h2>
          </Reveal>
          <Reveal as="ul" className="hm-occ-list">
            {OCCASIONS.map((o) => (
              <li key={o.label}>
                <Link to={o.category ? `/invitations?category=${o.category}` : '/invitations'}>{o.label} <Arrow /></Link>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="hm-section" id="how" aria-labelledby="hm-how-h">
        <div className="hm-wrap">
          <Reveal className="hm-sec-head">
            <div>
              <p className="hm-eyebrow">Ինչպես է աշխատում</p>
              <h2 className="hm-h2" id="hm-how-h">Երեք քայլ մինչև ձեր հրավերը</h2>
            </div>
            <p>Ամեն ինչ անում եք կայքում՝ առանց հատուկ ծրագրերի և դիզայնի հմտությունների։</p>
          </Reveal>
          <Reveal as="ol" className="hm-steps">
            {STEPS.map((s) => (
              <li key={s.title}><h3>{s.title}</h3><p>{s.text}</p></li>
            ))}
          </Reveal>
          <p className="hm-steps-foot"><Link className="hm-link" to="/invitations">Ընտրել հրավիրատոմս <Arrow /></Link></p>
        </div>
      </section>

      {/* Benefits */}
      <section className="hm-section hm-benefits" aria-labelledby="hm-ben-h">
        <div className="hm-wrap">
          <Reveal>
            <p className="hm-eyebrow">Առավելություններ</p>
            <h2 className="hm-h2" id="hm-ben-h">Ավելին, քան պարզապես հրավիրատոմս</h2>
            <div className="hm-lead-benefit">
              <h3>Անհատականացված դիզայն</h3>
              <p>Ձեր անունները, ձեր խոսքերը և ձեր ոճը՝ մեկ ամբողջական հրավերում։</p>
            </div>
          </Reveal>
          <Reveal as="ul" className="hm-benefit-grid">
            {BENEFITS.map((b) => (
              <li key={b.title}><h3>{b.title}</h3><p>{b.text}</p></li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Dashboard */}
      <section className="hm-section hm-dash hm-dark" id="dashboard" aria-labelledby="hm-dash-h">
        <div className="hm-wrap">
          <Reveal>
            <p className="hm-eyebrow">Անձնական վահանակ</p>
            <h2 className="hm-h2" id="hm-dash-h">Ձեր միջոցառումը՝ մեկ հարմար վահանակում</h2>
            <p className="hm-dash-lede">Կառավարեք հրավերները, հետևեք հյուրերի պատասխաններին և կազմակերպեք ձեր միջոցառման մանրամասները մեկ վայրում։</p>
            <ul className="hm-feat">
              <li>Հյուրերի ցուցակ</li>
              <li>Մասնակցության պատասխաններ</li>
              <li>Առանձին հղում յուրաքանչյուր միջոցառման համար</li>
              <li>Մի քանի միջոցառում մեկ հաշվում</li>
            </ul>
            <Link className="hm-btn hm-btn-line" to="/login">Մուտք գործել վահանակ <Arrow /></Link>
          </Reveal>

          <Reveal className="hm-guest-sheet" role="img" aria-label="Վահանակի օրինակ. 120 հյուրից 86-ը հաստատել է մասնակցությունը">
            <div className="hm-gs-top">
              <div>
                <p className="hm-serif">Անի և Դավիթ</p>
                <small>12 հունիսի 2027 · Երևան</small>
              </div>
              <span className="hm-sample">Օրինակ</span>
            </div>
            <div className="hm-gs-stats">
              <div><b>86</b><span>Կգա</span></div>
              <div><b>9</b><span>Չի գա</span></div>
              <div><b>25</b><span>Սպասվում է</span></div>
            </div>
            <div className="hm-gs-bar">
              <i style={{ width: '71.7%', background: 'var(--sage)' }} />
              <i style={{ width: '7.5%', background: 'var(--burgundy)' }} />
            </div>
            <ul className="hm-gs-list">
              {SAMPLE_GUESTS.map((g) => (
                <li key={g.name}><span>{g.name}</span><span className="n">{g.n}</span><span className={`hm-st ${g.st}`}>{g.label}</span></li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="hm-section" id="services" aria-labelledby="hm-srv-h">
        <div className="hm-wrap">
          <Reveal className="hm-atelier-head">
            <p className="hm-eyebrow">Ծառայություններ</p>
            <h2 className="hm-h2" id="hm-srv-h">Ձեր պատմությունը՝ յուրահատուկ ձևավորմամբ</h2>
            <p>Ստեղծում ենք հրավիրատոմսեր, որոնք արտահայտում են ձեր միջոցառման տրամադրությունն ու անհատականությունը։</p>
          </Reveal>
          <Reveal className="hm-services">
            <article className="hm-service">
              <span className="hm-mark" aria-hidden="true">ա.</span>
              <h3>Թվային հրավիրատոմսեր</h3>
              <p>Պատրաստի դիզայններ, որոնք անհատականացնում և պատվիրում եք ինքներդ։</p>
              <Link className="hm-link" to="/invitations">Դիտել հրավիրատոմսերը <Arrow /></Link>
            </article>
            <article className="hm-service">
              <span className="hm-mark" aria-hidden="true">բ.</span>
              <h3>Անհատական դիզայն</h3>
              <p>Հարմարեցնում ենք ձեր ընտրած դիզայնը կամ ստեղծում ենք նորը՝ հատուկ ձեր միջոցառման համար։</p>
              <a className="hm-link" href="#contact">Պատվիրել անհատական դիզայն <Arrow /></a>
            </article>
          </Reveal>
        </div>
      </section>

      {/* Philosophy */}
      <section className="hm-credo" aria-label="Մեր մասին">
        <div className="hm-wrap">
          <Pomegranate />
          <Reveal>
            <blockquote>Հրավերը պարզապես միջոցառման մասին տեղեկություն չէ։ Այն ձեր պատմության առաջին էջն է։</blockquote>
            <p className="hm-by">Siloona · թվային հրավիրատոմսերի ատելիե</p>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="hm-section hm-faq" id="faq" aria-labelledby="hm-faq-h">
        <div className="hm-wrap">
          <div>
            <p className="hm-eyebrow">Հարցեր</p>
            <h2 className="hm-h2" id="hm-faq-h">Հաճախակի տրվող հարցեր</h2>
          </div>
          <Faq />
        </div>
      </section>

      {/* Closing */}
      <section className="hm-section hm-closing hm-dark" aria-labelledby="hm-cta-h">
        <div className="hm-wrap">
          <div>
            <p className="hm-eyebrow">Սկսենք</p>
            <h2 id="hm-cta-h">Ձեր պատմությունը սկսվում է այստեղ</h2>
          </div>
          <div>
            <p>Ստեղծեք հրավիրատոմս, որը կարտահայտի ձեր կարևոր պահի յուրահատուկ տրամադրությունը։</p>
            <div className="hm-actions">
              <Link className="hm-btn hm-btn-solid" to="/invitations">Դիտել հրավիրատոմսերը <Arrow /></Link>
              <a className="hm-btn hm-btn-line" href="#contact">Անհատական դիզայն</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
