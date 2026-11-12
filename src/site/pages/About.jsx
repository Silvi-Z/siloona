import Reveal from '../Reveal'

const VALUES = [
  { title: 'Նրբություն', desc: 'Ամեն դետալ ծառայում է ընդհանուր տպավորությանը՝ առանց ավելորդության։' },
  { title: 'Անհատականություն', desc: 'Յուրաքանչյուր հրավիրատոմս պատմում է կոնկրետ զույգի կամ ընտանիքի պատմությունը։' },
  { title: 'Վստահելիություն', desc: 'Գեղեցիկ դիզայնը ուղեկցվում է կայուն և պարզ փորձառությամբ՝ ինչպես հյուրերի, այնպես էլ կազմակերպիչների համար։' },
]

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <p className="eyebrow">Փիլիսոփայություն</p>
          <h1>Մեր մասին</h1>
          <p>
            Siloona-ն թվային հրավիրատոմսերի բրենդ է, որը ստեղծված է Հայաստանում՝
            հարսանիքների և կյանքի կարևոր իրադարձությունների համար։
          </p>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <Reveal>
            <p className="pull-quote">
              Հրավիրատոմսը ոչ միայն տեղեկացնում է իրադարձության մասին.
              այն փոխանցում է տոնի առաջին հուզական տպավորությունը։
            </p>
          </Reveal>
        </div>
      </section>

      <section className="block tight">
        <div className="wrap">
          <Reveal as="div" className="values">
            {VALUES.map((v) => (
              <div key={v.title}>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  )
}
