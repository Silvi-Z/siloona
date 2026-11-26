import { Suspense, lazy, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Reveal from '../Reveal'
import '../home.css'
import '../prices.css'
import { useLang, useText } from '../i18n'
import { CONTACTS, opensTab } from '../contacts'
import { ASSISTED_FROM, Arrow, CUSTOM_HASH, DIY_FROM, TEXT as HOME, amt } from './Home'

const CustomRequestDialog = lazy(() => import('../custom/CustomRequestDialog'))

// «Գներ» — every current price option on one page. The tiers, the
// «what's included» list and the questions are the home page's own texts
// (pages/Home.jsx TEXT), the prices come from prices.js through the
// catalog (the lowest per option — designs differ, so always «from»).
// Built from the home page's classes (.hm …) so it looks like the site.
// No add-ons section: there is no add-ons config yet (src/config/addons.js).
const TEXT = {
  hy: {
    seoTitle: 'Գներ — Siloona',
    seoDesc: 'Siloona-ի թվային հրավիրատոմսերի գները՝ պատրաստի ձևանմուշ, հարմարեցված և անհատական դիզայն։',
    choose: 'Ընտրել դիզայն',
    byDesign: 'Գինը կախված է դիզայնից․ յուրաքանչյուրի գինը նշված է հավաքածուում։',
    orWrite: 'կամ գրեք մեզ՝',
    incEyebrow: 'Ներառված է',
    incH: 'Ինչ կա ամեն հրավերում',
    incNote: 'Հրավերի բաժինները կախված են ընտրած դիզայնից։',
    printEyebrow: 'Տպագրություն',
    printH: 'Տպագիր տարբերակ',
    printText: 'Նույն դիզայնով տպագիր հրավերներ և շնորհակալական քարտեր՝ ըստ պահանջի։ Գինը կախված է քանակից. գրեք մեզ։',
    write: 'Գրել մեզ՝',
    faqH: 'Հարցեր գների մասին',
    ctaBtn: 'Դիտել դիզայնները',
  },
  ru: {
    seoTitle: 'Цены — Siloona',
    seoDesc: 'Цены на цифровые приглашения Siloona: готовый шаблон, адаптированный и индивидуальный дизайн.',
    choose: 'Выбрать дизайн',
    byDesign: 'Цена зависит от дизайна — у каждого она указана в коллекции.',
    orWrite: 'или напишите нам:',
    incEyebrow: 'Включено',
    incH: 'Что есть в каждом приглашении',
    incNote: 'Разделы приглашения зависят от выбранного дизайна.',
    printEyebrow: 'Печать',
    printH: 'Печатная версия',
    printText: 'Печатные приглашения и благодарственные открытки в том же дизайне — по запросу. Цена зависит от количества: напишите нам.',
    write: 'Написать нам:',
    faqH: 'Вопросы о ценах',
    ctaBtn: 'Смотреть дизайны',
  },
  en: {
    seoTitle: 'Prices — Siloona',
    seoDesc: 'Prices for Siloona digital invitations: ready-made template, tailored design and custom design.',
    choose: 'Choose a design',
    byDesign: 'The price depends on the design — each one shows its price in the collection.',
    orWrite: 'or write to us:',
    incEyebrow: 'Included',
    incH: 'What every invitation includes',
    incNote: 'The invitation’s sections depend on the design you choose.',
    printEyebrow: 'Print',
    printH: 'Printed version',
    printText: 'Printed invitations and thank-you cards in the same design, on request. The price depends on the quantity — write to us.',
    write: 'Write to us:',
    faqH: 'Questions about prices',
    ctaBtn: 'View the designs',
  },
}

// The questions about money: cost, payment, changes, how long the link lasts.
const PRICE_FAQ = 4

// <title> and the meta description while this page is open; the previous
// ones come back on leaving (SiteLayout sets the title only once per language).
function useSeo(title, description) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]')
    const before = { title: document.title, description: meta?.getAttribute('content') }
    document.title = title
    meta?.setAttribute('content', description)
    return () => {
      document.title = before.title
      if (meta && before.description != null) meta.setAttribute('content', before.description)
    }
  }, [title, description])
}

function ContactLinks() {
  return CONTACTS.map((c) => (
    <a key={c.id} className="hm-link" href={c.href} {...(opensTab(c.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {c.name}
    </a>
  ))
}

export default function Prices() {
  const location = useLocation()
  const navigate = useNavigate()
  const { to } = useLang()
  const t = useText(TEXT)
  const h = useText(HOME)
  useSeo(t.seoTitle, t.seoDesc)
  const customOpen = location.hash === CUSTOM_HASH
  const closeCustom = () => navigate({ pathname: location.pathname, search: location.search }, { replace: true })

  // «from» on its own line above the figure, so the figure reads first
  const fromWord = h.from('').trim()
  const prices = [DIY_FROM, ASSISTED_FROM].map((v) => (v != null ? amt(v) : null))

  return (
    <main className="hm pr">
      <section className="hm-section pr-top" aria-labelledby="pr-h">
        <div className="hm-wrap">
          {/* the burgundy band hangs from this (not animated) wrapper */}
          <div className="pr-band">
            <Reveal className="pr-head">
              <p className="hm-eyebrow">{h.prEyebrow}</p>
              <h1 className="hm-h2" id="pr-h">{h.prH}</h1>
              <p className="pr-lede">{h.prP}</p>
            </Reveal>
          </div>

          <Reveal as="ul" className="pr-plans">
            {h.tiers.map((tier, i) => (
              <li key={tier.name} className={`pr-plan${i === 2 ? ' pr-plan--custom' : ''}`}>
                <p className="pr-plan-n" aria-hidden="true">0{i + 1}</p>
                <h2 className="pr-tier-h">{tier.name}</h2>
                {i < 2 ? (
                  <p className="pr-price"><small>{fromWord}</small><b>{prices[i]}</b></p>
                ) : (
                  <p className="pr-price pr-price--soft"><b>{h.customPrice}</b></p>
                )}
                <ul className="pr-plan-list">{tier.items.map((x) => <li key={x}>{x}</li>)}</ul>
                {i < 2 ? (
                  <Link className="hm-btn hm-btn-solid pr-btn" to={to('/invitations')}>{t.choose} <Arrow /></Link>
                ) : (
                  <div className="pr-custom">
                    <a className="hm-btn hm-btn-solid pr-btn" href={CUSTOM_HASH}>{tier.cta} <Arrow /></a>
                    <p className="pr-or">{t.orWrite} <ContactLinks /></p>
                  </div>
                )}
              </li>
            ))}
          </Reveal>
          <p className="pr-note">{t.byDesign}</p>
        </div>
      </section>

      <section className="hm-section pr-inc" aria-labelledby="pr-inc-h">
        <div className="hm-wrap">
          <Reveal>
            <p className="hm-eyebrow">{t.incEyebrow}</p>
            <h2 className="hm-h2" id="pr-inc-h">{t.incH}</h2>
          </Reveal>
          <Reveal as="ul" className="hm-benefit-grid pr-inc-list">
            {h.benefits.map((b, i) => (
              <li key={b.title}><span className="pr-inc-n" aria-hidden="true">0{i + 1}</span><h3>{b.title}</h3><p>{b.text}</p></li>
            ))}
          </Reveal>
          <p className="pr-note">{t.incNote}</p>
        </div>
      </section>

      <section className="hm-section pr-print hm-dark" aria-labelledby="pr-print-h">
        <div className="hm-wrap">
          <Reveal className="pr-print-in">
            <div>
              <p className="hm-eyebrow">{t.printEyebrow}</p>
              <h2 className="hm-h2" id="pr-print-h">{t.printH}</h2>
            </div>
            <div>
              <p className="pr-print-text">{t.printText}</p>
              <p className="pr-write"><span>{t.write}</span> <ContactLinks /></p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="hm-section hm-faq" aria-labelledby="pr-faq-h">
        <div className="hm-wrap">
          <Reveal>
            <p className="hm-eyebrow">{h.faqEyebrow}</p>
            <h2 className="hm-h2" id="pr-faq-h">{t.faqH}</h2>
          </Reveal>
          <Reveal className="hm-faq-list">
            {h.faq.slice(0, PRICE_FAQ).map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}<i aria-hidden="true" /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="hm-section pr-end" aria-label={t.ctaBtn}>
        <div className="hm-wrap">
          <Reveal className="pr-end-in">
            <h2 className="hm-h2">{h.ctaH}</h2>
            <Link className="hm-btn hm-btn-solid pr-btn" to={to('/invitations')}>{t.ctaBtn} <Arrow /></Link>
          </Reveal>
        </div>
      </section>

      {customOpen && (
        <Suspense fallback={null}>
          <CustomRequestDialog onClose={closeCustom} />
        </Suspense>
      )}
    </main>
  )
}
