import { useEffect, useRef } from 'react'
import Editable from '../../shared/Editable'
import Section from '../../shared/Section'
import GuestGreeting from '../../shared/GuestGreeting'
import { useInvitationContent } from '../../shared/EditableContext'
import { ambientConfetti, burst } from '../lib/confetti'
import AnimalFigure from './AnimalFigure'
import zebra from '../assets/zebra.webp'
import lion from '../assets/lion.webp'
import giraffe from '../assets/giraffe.webp'

export default function Hero({ buntingRef, rootRef }) {
  const { data } = useInvitationContent()
  const confettiRef = useRef(null)

  useEffect(() => { ambientConfetti(confettiRef.current) }, [])

  const boop = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    burst(rootRef.current, r.left + r.width / 2, r.top + r.height * 0.2, 22)
  }

  return (
    <section className="hero" id="top">
      <div className="confetti" ref={confettiRef} aria-hidden="true" />
      <div className="bunting" aria-hidden="true"><svg ref={buntingRef} viewBox="0 0 600 160" /></div>
      <svg className="spr" viewBox="0 0 80 220" style={{ left: '1%', top: '44%' }} aria-hidden="true"><use href="#bda-sprig" /></svg>
      <svg className="spr" viewBox="0 0 80 220" style={{ right: '1%', top: '30%', animationDelay: '-3s', scale: '-1 1' }} aria-hidden="true"><use href="#bda-sprig" /></svg>

      <div className="col">
        <Section id="greeting">
          <p className="seq lab tag" style={{ '--i': 0 }}>
            <GuestGreeting personalPath="greeting.personal"><Editable path="greeting.general" /></GuestGreeting>
          </p>
        </Section>
        <h1>
          <span className="seq l1" style={{ '--i': 1 }}><Editable path="child.name" /> դառնում է</span>
          <span className="seq l2 g" style={{ '--i': 2 }}><Editable path="child.age" /> տարեկան!</span>
        </h1>
        <Section id="message">
          <Editable as="p" path="message" className="seq msg" style={{ '--i': 3 }} />
        </Section>
      </div>

      <div className="crew" aria-label="Ուրախ կենդանիներ — սեղմիր նրանց վրա">
        <AnimalFigure src={zebra} alt="Զեբր՝ տոնական գլխարկով" height="clamp(120px,24vw,230px)" duration="5.2s" k={-8} seq i={0} onClick={boop} />
        <AnimalFigure src={lion} alt="Առյուծիկ՝ տոնական գլխարկով" height="clamp(150px,30vw,290px)" duration="6s" delay="-1s" k={-4} seq i={1} onClick={boop} />
        <AnimalFigure src={giraffe} alt="Ընձուղտիկ՝ տոնական գլխարկով" height="clamp(140px,28vw,270px)" duration="5.6s" delay="-2.2s" k={6} seq i={2} onClick={boop} />
      </div>
    </section>
  )
}
