import Reveal from '../Reveal'
import { useText } from '../i18n'

const TEXT = {
  hy: {
    eyebrow: 'Փիլիսոփայություն', h1: 'Մեր մասին',
    p: 'Siloona-ն թվային հրավիրատոմսերի բրենդ է, որը ստեղծված է Հայաստանում՝ հարսանիքների և կյանքի կարևոր իրադարձությունների համար։',
    quote: 'Հրավիրատոմսը ոչ միայն տեղեկացնում է իրադարձության մասին. այն փոխանցում է տոնի առաջին հուզական տպավորությունը։',
    values: [
      { title: 'Նրբություն', desc: 'Ամեն դետալ ծառայում է ընդհանուր տպավորությանը՝ առանց ավելորդության։' },
      { title: 'Անհատականություն', desc: 'Յուրաքանչյուր հրավիրատոմս պատմում է կոնկրետ զույգի կամ ընտանիքի պատմությունը։' },
      { title: 'Վստահելիություն', desc: 'Գեղեցիկ դիզայնը ուղեկցվում է կայուն և պարզ փորձառությամբ՝ ինչպես հյուրերի, այնպես էլ կազմակերպիչների համար։' },
    ],
  },
  ru: {
    eyebrow: 'Философия', h1: 'О нас',
    p: 'Siloona — бренд цифровых приглашений, созданный в Армении для свадеб и других важных событий в жизни.',
    quote: 'Приглашение не только сообщает о событии — оно передаёт первое эмоциональное впечатление о празднике.',
    values: [
      { title: 'Изящество', desc: 'Каждая деталь работает на общее впечатление — без лишнего.' },
      { title: 'Индивидуальность', desc: 'Каждое приглашение рассказывает историю конкретной пары или семьи.' },
      { title: 'Надёжность', desc: 'Красивый дизайн сопровождается стабильной и понятной работой — и для гостей, и для организаторов.' },
    ],
  },
  en: {
    eyebrow: 'Philosophy', h1: 'About Siloona',
    p: 'Siloona is a digital invitation brand created in Armenia for weddings and life’s other meaningful events.',
    quote: 'An invitation does more than announce an event: it carries the first emotional impression of the celebration.',
    values: [
      { title: 'Refinement', desc: 'Every detail serves the overall impression, with nothing superfluous.' },
      { title: 'Individuality', desc: 'Each invitation tells the story of a particular couple or family.' },
      { title: 'Reliability', desc: 'Beautiful design comes with a stable, simple experience, for guests and hosts alike.' },
    ],
  },
}

export default function About() {
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
          <Reveal>
            <p className="pull-quote">{t.quote}</p>
          </Reveal>
        </div>
      </section>

      <section className="block tight">
        <div className="wrap">
          <Reveal as="div" className="values">
            {t.values.map((v) => (
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
