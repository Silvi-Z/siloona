import React from 'react'
import Editable from '../../shared/Editable'
import { useInvitationContent } from '../../shared/EditableContext'
import { RowAdd, RowRemove } from '../../shared/ListEdit'

export default function Timeline({ items }) {
  const { editing } = useInvitationContent()
  return (
    <>
      <div className="tl">
        {items.map((_, i) => (
          <React.Fragment key={i}>
            <Editable as="time" path={`schedule.${i}.time`} />
            {/* While editing, dots show at once: a row added now isn't one the scroll reveal knows about. */}
            <i className={editing ? 'on' : undefined} />
            {editing ? (
              // The grid's third cell, so the × has a place of its own.
              <div style={{ position: 'relative' }}>
                <Editable as="span" path={`schedule.${i}.label`} className="on" />
                <RowRemove list="schedule" index={i} />
              </div>
            ) : (
              <Editable as="span" path={`schedule.${i}.label`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <RowAdd list="schedule" />
    </>
  )
}
