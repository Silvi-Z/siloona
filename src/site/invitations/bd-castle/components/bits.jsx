import { useState } from 'react'
import { sparkle } from '../lib/sparkle'
import arielImg from '../assets/ariel.webp'
import jasmineImg from '../assets/jasmine.webp'
import cinderellaImg from '../assets/cinderella.webp'
import belleImg from '../assets/belle.webp'
import auroraImg from '../assets/aurora.webp'

// A small three-point crown, drawn in currentColor.
export function Crown({ className = '' }) {
  return (
    <svg className={`crown ${className}`} viewBox="0 0 64 40" aria-hidden="true">
      <path d="M6 32 3 10l15 11L32 3l14 18 15-11-3 22Z" fill="currentColor" />
      <rect x="6" y="34" width="52" height="5" rx="2" fill="currentColor" />
      <circle cx="3" cy="9" r="3" fill="currentColor" />
      <circle cx="32" cy="3" r="3" fill="currentColor" />
      <circle cx="61" cy="9" r="3" fill="currentColor" />
    </svg>
  )
}

// A thin gold flourish with a diamond at its centre, used between lines.
export function Flourish({ className = '', i = 0 }) {
  return (
    <svg className={`flourish r ${className}`} style={{ '--i': i }} viewBox="0 0 200 16" aria-hidden="true">
      <path d="M2 8h70c8 0 12-6 20-6M198 8h-70c-8 0-12-6-20-6M72 8c8 0 12 6 20 6M128 8c-8 0-12 6-20 6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="m100 2 6 6-6 6-6-6Z" fill="currentColor" />
    </svg>
  )
}

const PORTRAITS = { ariel: arielImg, jasmine: jasmineImg, cinderella: cinderellaImg, belle: belleImg, aurora: auroraImg }

// A pair of characters from the artwork in an oval gold portrait frame with
// a crown on top. Tapping it makes the glass shine and scatters stars.
export function Portrait({ img, className = '', i = 0 }) {
  const [shine, setShine] = useState(0)
  function tap(e) {
    setShine((n) => n + 1)
    const r = e.currentTarget.getBoundingClientRect()
    sparkle(e.currentTarget.closest('.bdc'), r.left + r.width / 2, r.top + r.height * 0.4, 10, r.width * 0.7)
  }
  return (
    <div className={`portrait r ${className}`} style={{ '--i': i }} aria-hidden="true" onClick={tap}>
      <Crown className="ptop" />
      <span className="frame">
        <img src={PORTRAITS[img]} alt="" loading="lazy" decoding="async" />
        <span key={shine} className={`glass${shine ? ' on' : ''}`} />
      </span>
    </div>
  )
}
