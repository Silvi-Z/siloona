import { useEffect, useRef } from 'react';

// The real invitation, running live (envelope, animations, scroll) — the
// public preview route in its `?embed` mode (see
// site/pages/InvitationPreview.jsx), fed this event's content over
// postMessage. Used by «Իմ հրավերը» (phone frame, scaled from a real phone
// width) and by the published/guest view (full size), so the dashboard,
// the preview and what guests open are always the same saved content.
//
//   editing    texts become editable in place; each committed change comes
//              back through onEdit(next), which returns the content as the
//              parent now holds it
//   guestName  personalizes the greeting, as on that guest's own link
//   onRsvp     receives RSVPs submitted through the design's form
//   focus      { id, intro, n } — scroll the preview to that section
export default function LivePreview({ slug, content, title, editing = false, onEdit, guestName = null, onRsvp, focus, variant = 'phone' }) {
  const frameRef = useRef(null);
  const json = JSON.stringify(content);
  const latest = useRef({});
  latest.current = { json, editing, onEdit, guestName, onRsvp };
  // Content the frame itself produced — already on screen there, so it
  // must not be pushed back (that would re-render it mid-edit).
  const fromFrame = useRef(null);

  const post = (msg) => frameRef.current?.contentWindow?.postMessage({ slug, ...msg }, location.origin);
  const sendContent = () => {
    const l = latest.current;
    post({ type: 'siloona:invitation-content', data: JSON.parse(l.json), editing: l.editing, guestName: l.guestName, rsvp: !!l.onRsvp });
  };

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== location.origin || e.source !== frameRef.current?.contentWindow || e.data?.slug !== slug) return;
      const { type, ...data } = e.data;
      if (type === 'siloona:embed-ready') sendContent();
      // Not gated on `editing`: the last field typed in is committed (on
      // blur) right as edit mode is being switched off, and must still be saved.
      else if (type === 'siloona:invitation-edit') {
        const result = latest.current.onEdit?.(data.data);
        fromFrame.current = JSON.stringify(result ?? data.data);
      } else if (type === 'siloona:rsvp') latest.current.onRsvp?.(data);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Content changed from outside the frame (section editor, full-screen
  // editor, reset, event details) or the guest changed — push it.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (json === fromFrame.current) return;
    sendContent();
  }, [json, guestName]); // eslint-disable-line react-hooks/exhaustive-deps

  const firstMode = useRef(true);
  useEffect(() => {
    if (firstMode.current) { firstMode.current = false; return; }
    post({ type: 'siloona:invitation-mode', editing });
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (focus) post({ type: 'siloona:invitation-focus', id: focus.id, intro: !!focus.intro });
  }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const frame = <iframe ref={frameRef} src={`/invitations/preview/${slug}?embed`} title={title} loading="lazy" />;
  if (variant === 'full') return <div className="live-full">{frame}</div>;
  return (
    <div className={`phone live-phone${editing ? ' is-editing' : ''}`}>
      <div className="live-screen">{frame}</div>
    </div>
  );
}
