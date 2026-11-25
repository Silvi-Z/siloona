import Reveal from '../Reveal'
import CardCatalog from '../CardCatalog'
import { CONTACTS } from '../contacts'
import { useText } from '../i18n'

const TEXT = {
  hy: {
    eyebrow: 'Տպագիր ապրանքատեսակ', h1: 'Հրավերի քարտեր',
    p: 'Թվային փորձառությունից զատ՝ Siloona-ն մշակում է նաև տպագիր հրավերներ և հարակից թղթային պիտույքներ՝ նույն գեղագիտությամբ և ուշադրությամբ։',
    ctaH: 'Հետաքրքրվա՞ծ եք տպագիր հրավերով', ctaP: 'Գրեք մեզ՝ ձեր տոնի մանրամասներով, և մենք կպատասխանենք հնարավորինս շուտ։', cta: 'Կապվել մեզ հետ',
  },
  ru: {
    eyebrow: 'Печатная продукция', h1: 'Пригласительные открытки',
    p: 'Помимо цифровых приглашений, Siloona создаёт печатные приглашения и сопутствующую бумажную продукцию — с той же эстетикой и вниманием.',
    ctaH: 'Интересует печатное приглашение?', ctaP: 'Напишите нам о вашем празднике, и мы ответим как можно скорее.', cta: 'Связаться с нами',
  },
  en: {
    eyebrow: 'Printed stationery', h1: 'Invitation cards',
    p: 'Beyond digital invitations, Siloona also designs printed invitations and matching stationery, with the same aesthetic and care.',
    ctaH: 'Interested in a printed invitation?', ctaP: 'Write to us with the details of your celebration, and we’ll reply as soon as we can.', cta: 'Contact us',
  },
}
// «Կապվել մեզ հետ» opens a chat (there's no contact page).
const CHAT = CONTACTS.find((c) => c.id === 'telegram') || CONTACTS[0]

export default function InvitationCards() {
  const t = useText(TEXT)
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.h1}</h1>
          <p>{t.p}</p>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <Reveal as="div">
            <CardCatalog />
          </Reveal>
        </div>
      </section>

      <section className="block tight">
        <div className="wrap">
          <Reveal as="div" className="cta-band">
            <h2>{t.ctaH}</h2>
            <p>{t.ctaP}</p>
            {CHAT && <a href={CHAT.href} target="_blank" rel="noopener noreferrer" className="btn btn-primary">{t.cta}</a>}
          </Reveal>
        </div>
      </section>
    </>
  )
}
