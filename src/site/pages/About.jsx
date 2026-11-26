import Reveal from '../Reveal'
import '../home.css'
import '../about.css'
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

// Built like the prices page: the title and the quote on a burgundy band,
// the three values as panels across its lower edge (home.css .hm classes
// plus about.css). The texts are unchanged.
export default function About() {
  const t = useText(TEXT)
  return (
    <main className="hm ab">
      <section className="ab-top" aria-labelledby="ab-h">
        <div className="hm-wrap">
          {/* the burgundy band hangs from this (not animated) wrapper */}
          <div className="ab-band">
            <Reveal className="ab-head">
              <p className="hm-eyebrow">{t.eyebrow}</p>
              <h1 className="hm-h2" id="ab-h">{t.h1}</h1>
              <p className="ab-lede">{t.p}</p>
            </Reveal>
            <Reveal>
              <blockquote className="ab-quote">{t.quote}</blockquote>
            </Reveal>
          </div>

          <Reveal as="ul" className="ab-values">
            {t.values.map((v, i) => (
              <li key={v.title}>
                <span className="ab-n" aria-hidden="true">0{i + 1}</span>
                <h2>{v.title}</h2>
                <p>{v.desc}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>
    </main>
  )
}
