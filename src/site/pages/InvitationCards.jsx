import { Link } from 'react-router-dom'
import Reveal from '../Reveal'
import CardCatalog from '../CardCatalog'

export default function InvitationCards() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <p className="eyebrow">Տպագիր ապրանքատեսակ</p>
          <h1>Հրավերի քարտեր</h1>
          <p>
            Թվային փորձառությունից զատ՝ Siloona-ն մշակում է նաև տպագիր հրավերներ և
            հարակից թղթային պիտույքներ՝ նույն գեղագիտությամբ և ուշադրությամբ։
          </p>
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
            <h2>Հետաքրքրվա՞ծ եք տպագիր հրավերով</h2>
            <p>Գրեք մեզ՝ ձեր տոնի մանրամասներով, և մենք կպատասխանենք հնարավորինս շուտ։</p>
            <Link to="/about" className="btn btn-primary">Կապվել մեզ հետ</Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
