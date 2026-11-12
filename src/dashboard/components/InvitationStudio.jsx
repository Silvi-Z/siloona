import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { INVITATION_PREVIEWS } from '../../site/invitationRegistry';
import { InvitationContentProvider } from '../../site/invitations/shared/EditableContext';
import { diffData } from '../../site/invitations/shared/pathUtils';
import EditBar from '../../site/invitations/shared/EditBar';
import { floatingBtnStyle, floatingTopLeft } from '../../site/invitations/shared/chromeStyles';
import { eventDesignContent } from '../data/designPrefill';
import * as actions from '../data/actions';

const selectedStyle = { ...floatingBtnStyle, background: 'rgba(107,29,44,.85)', cursor: 'default' };

// Full-page view/edit of one invitation design for one event — the
// dashboard host for the exact same editing stack the public
// /invitations/preview/:slug page uses (InvitationContentProvider +
// Editable + EditBar + the design's own component). Only the host
// differs: edits are written to this event's own record (ev.inv.
// designContent[slug]) and saved through the dashboard's usual bump() →
// Supabase sync, instead of the browser's localStorage.
//
// Rendered into <body>, outside .siloona-dashboard, so dashboard CSS can
// never leak into the invitation — and in normal document flow (the
// dashboard is hidden meanwhile, not unmounted) because every design's
// motion/reveal code is written against real window scroll.
export default function InvitationStudio({ dash, ev, design, initialEditing, onClose }) {
  const slug = design.previewSlug;
  const entry = INVITATION_PREVIEWS[slug];
  const [editing, setEditing] = useState(initialEditing);
  const [selected, setSelected] = useState(ev.inv.design === design.id);

  // Base = the design's demo content, overlaid with this event's real
  // details. Computed once per opening; saved edits are diffed against it.
  const { base, saved } = useMemo(() => eventDesignContent(slug, ev), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const y = window.scrollY;
    document.body.classList.add('inv-studio-open');
    window.scrollTo(0, 0);
    return () => {
      document.body.classList.remove('inv-studio-open');
      window.scrollTo(0, y);
    };
  }, []);

  // Escape is already the dashboard's "close the top overlay" key.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !editing) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [editing, onClose]);

  const onSave = (next) => { actions.saveDesignContent(ev, slug, diffData(base, next)); dash.bump(); };
  const onReset = () => { actions.saveDesignContent(ev, slug, undefined); dash.bump(); };
  // (No toast here: the dashboard — and its toast host — is hidden while
  // the studio is open; the button turning into "✓ Ընտրված" is the feedback.)
  const select = () => {
    actions.selectInvitationDesign(ev, design);
    setSelected(true);
    dash.bump();
  };

  const Invitation = entry.component;
  return createPortal(
    <div className="inv-studio">
      <InvitationContentProvider
        defaultData={base}
        saved={saved}
        onSave={onSave}
        onReset={onReset}
        editing={editing}
        setEditing={setEditing}
      >
        <div style={{ ...floatingTopLeft, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <button type="button" style={floatingBtnStyle} onClick={onClose} aria-label="Վերադառնալ վահանակ">← Վահանակ</button>
          {selected
            ? <span style={selectedStyle} aria-live="polite">✓ Ընտրված</span>
            : <button type="button" style={floatingBtnStyle} onClick={select}>Ընտրել այս դիզայնը</button>}
        </div>
        <EditBar />
        <Invitation />
      </InvitationContentProvider>
    </div>,
    document.body,
  );
}
