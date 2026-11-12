import { useEffect, useState } from 'react';
import Icon from '../utils/icons';
import PublicInvitation from '../components/PublicInvitation';
import LivePreview from '../components/LivePreview';
import { findDesign } from '../../site/designCatalog';
import { eventDesignContent } from '../data/designPrefill';
import { grp, guestInviteUrl, fullName } from '../data/selectors';
import { invUrl } from '../data/selectors';
import * as actions from '../data/actions';
import { fmtDL } from '../utils/format';

function PublicPreviewBody({ dash, ev, guest }) {
  const [result, setResult] = useState(null);
  const url = guest ? guestInviteUrl(ev, guest) : invUrl(ev);

  // A real guest opening their link would ping the server; there is none
  // here, so this only reflects what this prototype can honestly know —
  // the organizer looking at this guest's personalized link themselves.
  useEffect(() => { if (guest) { actions.markInviteOpened(guest); dash.bump(); } }, [guest]); // eslint-disable-line react-hooks/exhaustive-deps

  const copyLink = () => navigator.clipboard?.writeText(`https://${url}`).then(() => dash.toast('Հղումը պատճենվեց'));
  const submit = (form) => {
    const res = actions.submitPublicRsvp(ev, form);
    dash.bump();
    setResult(res);
  };

  // With a web design selected, the published copy IS that design, rendered
  // from the same saved content as the dashboard editor and preview — with
  // the guest's own name when opened through their personal link. RSVPs
  // sent through the design's own form are recorded like before.
  const design = findDesign(ev.inv.design);
  const designData = design?.previewSlug ? eventDesignContent(design.previewSlug, ev) : null;
  const resultNote = result && (
    <p className="small muted" style={{ marginTop: 24 }}>Demo · պատասխանը {result.isNew ? `ավելացվեց հյուրերի ցուցակում («${grp(ev, result.guest.group).name}» խումբ)` : 'թարմացրեց առկա հյուրի կարգավիճակը'}։</p>
  );

  return (
    <>
      <div className="m-h" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="mono small">https://{url}</span>
          {guest && <div className="small muted" style={{ marginTop: 2 }}>Անհատականացված հղում՝ {fullName(guest)}</div>}
        </div>
        <button className="icon-btn sm bare" onClick={copyLink} aria-label="Պատճենել"><Icon name="copy" /></button>
        <button className="icon-btn sm bare" onClick={dash.closeModal} aria-label="Փակել"><Icon name="close" /></button>
      </div>
      <div className="m-b public">
        {designData ? (
          <>
            {ev.inv.status !== 'published' && <div className="pv-banner">Նախադիտում · հրավիրատոմսը դեռ հրապարակված չէ</div>}
            <LivePreview variant="full" slug={design.previewSlug} content={designData.content} title={design.code} guestName={guest?.first || null} onRsvp={submit} />
            {result && <div className="pv-result" role="status">{resultNote}</div>}
          </>
        ) : result ? (
          <div style={{ padding: '60px 30px', textAlign: 'center' }}>
            <div className="serif" style={{ fontSize: 26, color: '#7A2433', marginBottom: 10 }}>Շնորհակալություն</div>
            <p style={{ lineHeight: 1.7 }}>{result.guest.rsvp === 'confirmed' ? `Սպասում ենք Ձեզ ${fmtDL(ev.date)}-ին։` : 'Ցավում ենք, որ չեք կարողանա գալ։'}</p>
            {resultNote}
            <button className="btn" onClick={dash.closeModal} style={{ marginTop: 10 }}>Վերադառնալ վահանակ</button>
          </div>
        ) : <PublicInvitation ev={ev} guest={guest} compact={false} onSubmit={submit} />}
      </div>
    </>
  );
}

export function openPublicPreview(dash, ev, guest) { dash.openModal(<PublicPreviewBody dash={dash} ev={ev} guest={guest} />, 'public-m'); }
