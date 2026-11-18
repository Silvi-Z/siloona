import { useLayoutEffect, useRef } from 'react'
import { useInvitationContent } from './EditableContext'
import { getByPath } from './pathUtils'

// Add / remove items of a list in a design's content (the day's programme)
// while editing — shown only in edit mode, so guests never see them.
// Styled inline and in currentColor, so they sit on any design without
// touching its stylesheet (same idea as chromeStyles.js).

const FONT = '-apple-system,"Segoe UI",Roboto,"Noto Sans Armenian",sans-serif'

// × in the item's corner. Put it as the item's last child; the item is
// made the positioning parent if it isn't one already.
export function RowRemove({ list, index, label = 'Հեռացնել կետը' }) {
  const { data, editing, setField } = useInvitationContent()
  const ref = useRef(null)
  useLayoutEffect(() => {
    const parent = ref.current?.parentElement
    if (parent && getComputedStyle(parent).position === 'static') parent.style.position = 'relative'
  }, [editing])
  if (!editing) return null
  const items = getByPath(data, list) || []
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()} // keep a field being typed in from losing its text first
      onClick={() => setField(list, items.filter((_, j) => j !== index))}
      style={{
        position: 'absolute', top: '50%', right: -6, transform: 'translateY(-50%)', zIndex: 6, width: 24, height: 24, padding: 0,
        display: 'grid', placeItems: 'center', borderRadius: '50%', border: '2px solid #fff', cursor: 'pointer',
        background: 'rgba(20,18,16,.78)', color: '#fff', fontFamily: FONT, fontSize: 15, lineHeight: 1,
        boxShadow: '0 2px 6px rgba(0,0,0,.18)',
      }}
    >
      ×
    </button>
  )
}

// «+ Add» under the list: a copy of the last item with a placeholder text,
// ready to be typed over.
export function RowAdd({ list, field = 'label', text = 'Նոր կետ', label = 'Ավելացնել կետ', max = 20 }) {
  const { data, editing, setField } = useInvitationContent()
  if (!editing) return null
  const items = getByPath(data, list) || []
  if (items.length >= max) return null
  const add = () => {
    const last = items.at(-1)
    const next = last && typeof last === 'object' ? { ...last, [field]: text } : { time: '', [field]: text }
    setField(list, [...items, next])
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0 4px', position: 'relative', zIndex: 5 }}>
      <button
        type="button"
        onClick={add}
        style={{
          padding: '9px 18px', borderRadius: 999, border: '1.5px dashed currentColor', background: 'rgba(255,255,255,.55)',
          color: 'inherit', fontFamily: FONT, fontSize: 13, fontWeight: 600, letterSpacing: '.02em', cursor: 'pointer', opacity: 0.85,
        }}
      >
        + {label}
      </button>
    </div>
  )
}
