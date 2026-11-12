import { useState } from 'react';
import Icon from '../utils/icons';
import EmptyState from './EmptyState';
import LivePreview from './LivePreview';
import StudioHost from './StudioHost';
import { DesignThumb } from '../../site/DesignCard';
import { findDesign } from '../../site/designCatalog';
import { eventDesignContent, saveDesignEdit, sampleGuestName } from '../data/designPrefill';

const KIND_LABELS = { web: 'Վեբ հրավիրատոմս', card: 'Քարտային հրավիրատոմս' };

// «Իմ հրավերը»'s preview column: only the design chosen for this event
// (ev.inv.design), large and live, with this event's details and saved
// customizations — or, with nothing chosen yet, a way to go choose one.
// The content itself is edited in the section editor next to it
// (InvitationEditor); «Խմբագրել նախադիտման մեջ» additionally lets the user
// click texts right in the preview. Both save to the same content.
export default function SelectedInvitation({ dash, ev, focus }) {
  const [studio, setStudio] = useState(null);
  const [editing, setEditing] = useState(false);
  const design = findDesign(ev.inv.design);

  if (!design) {
    return (
      <div className="preview-stage my-inv-stage">
        <EmptyState
          title="Դուք դեռ հրավեր չեք ընտրել"
          sub={<p className="muted" style={{ margin: '8px auto 0', maxWidth: '34ch' }}>Ընտրեք դիզայն «Բոլոր հրավերները» բաժնից․ այն կհայտնվի այստեղ՝ ձեր միջոցառման տվյալներով։</p>}
        >
          <button type="button" className="btn primary" onClick={() => dash.go('designs')}>Բոլոր հրավերները</button>
        </EmptyState>
      </div>
    );
  }

  const web = !!design.previewSlug; // web designs and cards with an editable page
  const slug = design.previewSlug;
  const data = web ? eventDesignContent(slug, ev) : null;

  // Same persistence as the section editor and InvitationStudio: a diff
  // against the event-derived base, saved through bump() → Supabase.
  const saveEdit = (next) => { const content = saveDesignEdit(ev, slug, next); dash.bump(); return content; };
  const openFull = (edit) => { setEditing(false); setStudio({ design, editing: edit }); };

  return (
    <div className="preview-stage my-inv-stage">
      {web
        ? <LivePreview slug={slug} content={data.content} title={design.code} editing={editing} onEdit={saveEdit} guestName={sampleGuestName(ev)} focus={focus} />
        : <div className="sil-catalog card-preview my-inv-card"><DesignThumb design={design} /></div>}

      <div className="my-inv-meta">
        <div className="small muted">{KIND_LABELS[design.kind]}</div>
        <div className="serif my-inv-code">{design.code}</div>
        {web && (editing
          ? <div className="small my-inv-hint" role="status">Սեղմեք նախադիտման ցանկացած տեքստի վրա՝ այն փոխելու համար։ Փոփոխությունները պահպանվում են ավտոմատ։</div>
          : <div className="small muted">Նախադիտում՝ ինչպես կտեսնի «{sampleGuestName(ev)}»-ն իր հղումով</div>)}
      </div>
      <div className="my-inv-actions">
        {web && (editing ? (
          <>
            <button type="button" className="btn sm primary" onClick={() => setEditing(false)}>Ավարտել խմբագրումը</button>
            <button type="button" className="btn sm ghost" onClick={() => openFull(true)}>Ամբողջ էկրանով</button>
          </>
        ) : (
          <>
            <button type="button" className="btn sm" onClick={() => setEditing(true)}><Icon name="edit" /> Խմբագրել նախադիտման մեջ</button>
            <button type="button" className="btn sm" onClick={() => openFull(false)}>Ամբողջ էկրանով</button>
            <button type="button" className="btn sm ghost" onClick={() => dash.go('designs')}>Փոխել դիզայնը</button>
          </>
        ))}
        {!web && <button type="button" className="btn sm ghost" onClick={() => dash.go('designs')}>Փոխել դիզայնը</button>}
      </div>

      <StudioHost dash={dash} ev={ev} studio={studio} onClose={() => setStudio(null)} />
    </div>
  );
}
