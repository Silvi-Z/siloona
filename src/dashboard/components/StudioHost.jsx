import { lazy, Suspense } from 'react';

// Only fetched when a design is actually opened — it pulls in every
// invitation design's own (heavy) component, styles and assets.
const InvitationStudio = lazy(() => import('./InvitationStudio'));

// Shared by «Բոլոր հրավերները» and «Իմ հրավերը»: `studio` is
// { design, editing } while a design is open full-page, or null.
export default function StudioHost({ dash, ev, studio, onClose }) {
  if (!studio) return null;
  return (
    <Suspense fallback={null}>
      <InvitationStudio dash={dash} ev={ev} design={studio.design} initialEditing={studio.editing} onClose={onClose} />
    </Suspense>
  );
}
