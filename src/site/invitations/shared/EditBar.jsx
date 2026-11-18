import { Link } from 'react-router-dom'
import { useInvitationContent } from './EditableContext'

const barStyle = {
  position: 'fixed', top: 16, right: 16, zIndex: 200,
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap-reverse', gap: 8,
  // Leave room for the page's «← back» button at top left: on a phone the
  // extra buttons wrap under the main one instead of covering it.
  maxWidth: 'calc(100vw - 170px)',
  fontFamily: '-apple-system,"Segoe UI",Roboto,sans-serif', fontSize: 12.5,
}
const btnStyle = (active) => ({
  padding: '9px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
  fontWeight: 600, letterSpacing: '.03em',
  background: active ? '#2b2927' : 'rgba(20,18,16,.55)', color: '#fff',
  backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
})
const ghostBtnStyle = {
  padding: '9px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,.5)', cursor: 'pointer',
  fontWeight: 600, letterSpacing: '.03em', background: 'rgba(20,18,16,.4)', color: '#fff',
  backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
}

// Rendered once by InvitationPreview for whichever design is loaded —
// every invitation gets edit mode "for free" this way, with no
// per-design wiring beyond registering defaultData.
// `orderTo` (optional): the checkout for this design — your edits go with the order.
// `onWizard` (optional): reopens the step-by-step questions (EditWizard).
export default function EditBar({ orderTo, onWizard }) {
  const { editing, setEditing, reset, dirty } = useInvitationContent()

  return (
    <div style={barStyle}>
      {editing && dirty && (
        <button
          type="button"
          style={ghostBtnStyle}
          onClick={() => { if (confirm('Վերակայե՞լ փոփոխությունները։')) reset() }}
        >
          Վերակայել
        </button>
      )}
      {editing && onWizard && (
        <button type="button" style={ghostBtnStyle} onClick={onWizard}>Քայլ առ քայլ</button>
      )}
      <button type="button" style={btnStyle(editing)} onClick={() => setEditing(!editing)}>
        {editing ? 'Ավարտել խմբագրումը' : 'Խմբագրել'}
      </button>
      {orderTo && !editing && (
        <Link to={orderTo} style={{ ...btnStyle(false), background: '#6B1D2C', textDecoration: 'none' }}>Պատվիրել</Link>
      )}
    </div>
  )
}
