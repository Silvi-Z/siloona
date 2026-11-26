import { useState } from 'react';
import Icon from '../utils/icons';
import { Badge } from '../components/Badge';
import SelectedInvitation from '../components/SelectedInvitation';
import InvitationEditor from '../components/InvitationEditor';
import { useDashboard } from '../state/DashboardContext';
import { invUrl } from '../data/selectors';
import { INV_ST } from '../data/constants';
import { TODAY, dayDiff, fmtDay, fmtDL, num } from '../utils/format';
import { findDesign } from '../../site/designCatalog';
import { eventDesignContent, designSections } from '../data/designPrefill';
import { getByPath } from '../../site/invitations/shared/pathUtils';
import * as actions from '../data/actions';
import { openPublicPreview } from '../modals/PublicPreviewModal';
import { NOT_LINKED, linkedOrder } from '../data/orderLinks';

// «Իմ հրավերը» — organized around what the user actually does:
//   left   the invitation itself, live (what guests will see)
//   right  1. Հրապարակում — link, publish, a one-line status, share text
//          2. Հրավերի բովանդակություն — every real part of the selected
//             design, with its fields and show/hide (InvitationEditor)
// Everything saves on change; there are no separate Save buttons.
export default function Invitation() {
  const dash = useDashboard();
  const ev = dash.ctx();
  const design = findDesign(ev.inv.design);
  const [focus, setFocus] = useState(null);

  return (
    <div className="two inv-layout">
      <SelectedInvitation dash={dash} ev={ev} focus={focus} />
      <div>
        <PublishPanel dash={dash} ev={ev} design={design} />
        <InvitationEditor dash={dash} ev={ev} design={design} onFocus={setFocus} />
      </div>
    </div>
  );
}

// The design's general message, for the share text's default.
function designMessage(ev, design) {
  if (!design?.previewSlug) return ev.inv.message;
  const sec = designSections(design.previewSlug).find((s) => s.role === 'message');
  const data = eventDesignContent(design.previewSlug, ev);
  return (sec && data && getByPath(data.content, sec.fields[0].path)) || ev.inv.message;
}

// Which paid order this invitation is (only those open to guests), and
// which design guests see — always the one that was paid for.
function OrderNote({ ev }) {
  const o = linkedOrder(ev);
  if (!o) return <p className="small" style={{ margin: '0 0 12px', color: 'var(--terracotta, #9b4a2e)' }}>{NOT_LINKED} <a href="/invitations" target="_blank" rel="noopener noreferrer">Դիտել դիզայնները</a></p>;
  const paid = findDesign(o.designId);
  return (
    <p className="small muted" style={{ margin: '0 0 12px' }}>
      Պատվեր №{o.orderNumber}{paid ? ` · ${paid.code}` : ''}{!o.live && ' · պատվերը վճարված չէ կամ չեղարկված է, հղումը փակ է'}
      {o.live && paid && ev.inv.design && ev.inv.design !== paid.id && <> · հյուրերը տեսնում են պատվիրված դիզայնը՝ <b>{paid.code}</b></>}
    </p>
  );
}

function PublishPanel({ dash, ev, design }) {
  const pub = ev.inv.status === 'published';
  const answered = ev.guests.filter((g) => g.rsvp !== 'pending').length;
  const daysLeft = Math.max(0, dayDiff(ev.inv.deadline, TODAY));
  const [shareText, setShareText] = useState(() => `${ev.title}\n${fmtDay(ev.date)}${ev.time ? `, ${ev.time}` : ''}\n\n${designMessage(ev, design) || ''}\n\nՀրավիրատոմսը և RSVP-ն՝ https://${invUrl(ev)}`.replace(/\n{3,}/g, '\n\n'));

  const copy = (text, msg) => navigator.clipboard?.writeText(text).then(() => dash.toast(msg));
  const publish = () => { const r = actions.publishInvitation(ev); if (r?.error) { dash.toast(r.error); return; } dash.bump(); dash.toast('Հրավիրատոմսը հրապարակվեց · հղումն ակտիվ է'); };
  const unpublish = () => dash.confirm('Դադարեցնե՞լ հրապարակումը', <>Հղումը <span className="mono">{invUrl(ev)}</span> կդառնա անհասանելի հյուրերի համար։ Ստացված պատասխանները կպահպանվեն։</>, 'Դադարեցնել', () => {
    actions.unpublishInvitation(ev); dash.bump(); dash.toast('Հրապարակումը դադարեցվեց');
  });

  return (
    <section className="panel" style={{ marginBottom: 20 }}>
      <div className="panel-h"><h3>Հրապարակում</h3><div className="spacer" /><Badge map={INV_ST} value={ev.inv.status} /></div>
      <div className="panel-b">
        <p className="muted" style={{ margin: '0 0 12px' }}>{pub ? `Հասանելի է հղումով ${fmtDL(ev.inv.published)}-ից։` : 'Հրավերը տեսանելի է միայն Ձեզ, մինչև այն հրապարակեք։'}</p>
        <OrderNote ev={ev} />
        <div className="url pub-url">
          <span className="mono" style={{ flex: 1 }}>https://{invUrl(ev)}</span>
          <button className="btn sm" onClick={() => copy(`https://${invUrl(ev)}`, 'Հղումը պատճենվեց')}><Icon name="copy" /> Պատճենել</button>
          <button className="btn sm" onClick={() => openPublicPreview(dash, ev)}><Icon name="ext" /> Բացել</button>
        </div>
        <div className="pub-row">
          {pub ? <button className="btn" onClick={unpublish}>Դադարեցնել հրապարակումը</button> : <button className="btn primary" onClick={publish}>Հրապարակել հրավերը</button>}
          <div className="pub-stats small muted">
            <span><b>{num(ev.inv.views)}</b> դիտում</span>
            <span><b>{answered}</b>/{ev.guests.length} պատասխան</span>
            <span><b>{daysLeft}</b> օր մինչև պատասխանների ժամկետը</span>
          </div>
        </div>
        <details className="disclose">
          <summary>Կիսվելու տեքստ <span className="muted small">· մեսենջերով ուղարկելու համար</span></summary>
          <textarea className="input" style={{ minHeight: 120, marginTop: 10 }} value={shareText} onChange={(e) => setShareText(e.target.value)} />
          <div style={{ textAlign: 'right', marginTop: 8 }}><button className="btn sm" onClick={() => copy(shareText, 'Տեքստը պատճենվեց')}><Icon name="copy" /> Պատճենել տեքստը</button></div>
        </details>
      </div>
    </section>
  );
}
