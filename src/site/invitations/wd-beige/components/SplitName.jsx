import React from 'react'

// Letter-by-letter reveal for the hero couple names, with the script
// ampersand on its own line between them. The stagger index (--i) runs
// continuously across both names and the ampersand, matching the demo.
export default function SplitName({ groomFirst, brideFirst }) {
  let i = 0
  const letters = (text) =>
    Array.from(text).map((ch) => (
      <span className="ch" key={i} style={{ '--i': i++ }}>{ch}</span>
    ))

  return (
    <h1 className="names">
      {letters(groomFirst)}
      <span className="am"><span className="ch" style={{ '--i': i++ }}>&amp;</span></span>
      {letters(brideFirst)}
    </h1>
  )
}
