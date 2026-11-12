import React from 'react'
import Editable from '../../shared/Editable'

export default function Timeline({ items }) {
  return (
    <div className="tl">
      {items.map((_, i) => (
        <React.Fragment key={i}>
          <Editable as="time" path={`schedule.${i}.time`} />
          <i />
          <Editable as="span" path={`schedule.${i}.label`} />
        </React.Fragment>
      ))}
    </div>
  )
}
