import React from 'react'

// Word-by-word reveal for a heading, used with the `.rv`/data-split
// treatment (each word slides up independently, staggered by --k).
export default function SplitWords({ text, as: Tag = 'h2', className = '', ...rest }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <Tag className={className} {...rest}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          {i > 0 ? ' ' : ''}
          <span className="w"><i style={{ '--k': i }}>{word}</i></span>
        </React.Fragment>
      ))}
    </Tag>
  )
}
