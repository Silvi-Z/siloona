import { useInvitationContent } from './EditableContext'

const barStyle = {
  position: 'fixed', top: 16, right: 16, zIndex: 200,
  display: 'inline-flex', alignItems: 'center', gap: 8,
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
  fontWeight: 600, letterSpacing: '.03em', background: 'transparent', color: '#fff',
}

// Rendered once by InvitationPreview for whichever design is loaded —
// every invitation gets edit mode "for free" this way, with no
// per-design wiring beyond registering defaultData.
export default function EditBar() {
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
      <button type="button" style={btnStyle(editing)} onClick={() => setEditing(!editing)}>
        {editing ? 'Ավարտել խմբագրումը' : 'Խմբագրել'}
      </button>
    </div>
  )
}
