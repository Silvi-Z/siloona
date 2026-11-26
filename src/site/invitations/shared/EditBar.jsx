import { Link } from 'react-router-dom'
import { useInvitationContent } from './EditableContext'
import { useText } from '../../i18n'

const TEXT = {
  hy: { confirm: 'Վերակայե՞լ փոփոխությունները։', reset: 'Վերակայել', wizard: 'Քայլ առ քայլ', how: 'Ինչպես խմբագրել', done: 'Ավարտել խմբագրումը', edit: 'Խմբագրել', order: 'Պատվիրել' },
  ru: { confirm: 'Сбросить изменения?', reset: 'Сбросить', wizard: 'Пошагово', how: 'Как редактировать', done: 'Готово', edit: 'Изменить', order: 'Заказать' },
  en: { confirm: 'Discard your changes?', reset: 'Reset', wizard: 'Step by step', how: 'How to edit', done: 'Finish editing', edit: 'Edit', order: 'Order' },
}

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
// `onGuide` (optional): replays the edit-mode tour (EditGuide).
// `data-guide` marks the buttons the tour points at.
export default function EditBar({ orderTo, onWizard, onGuide }) {
  const { editing, setEditing, reset, dirty } = useInvitationContent()
  const t = useText(TEXT)

  return (
    <div style={barStyle}>
      {editing && dirty && (
        <button
          type="button"
          data-guide="reset"
          style={ghostBtnStyle}
          onClick={() => { if (confirm(t.confirm)) reset() }}
        >
          {t.reset}
        </button>
      )}
      {editing && onWizard && (
        <button type="button" data-guide="wizard" style={ghostBtnStyle} onClick={onWizard}>{t.wizard}</button>
      )}
      {editing && onGuide && (
        <button type="button" style={{ ...ghostBtnStyle, padding: '9px 13px' }} onClick={onGuide} aria-label={t.how} title={t.how}>?</button>
      )}
      <button type="button" data-guide={editing ? 'done' : undefined} style={btnStyle(editing)} onClick={() => setEditing(!editing)}>
        {editing ? t.done : t.edit}
      </button>
      {orderTo && !editing && (
        <Link to={orderTo} style={{ ...btnStyle(false), background: '#4A0611', textDecoration: 'none' }}>{t.order}</Link>
      )}
    </div>
  )
}
