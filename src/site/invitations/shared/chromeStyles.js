// Floating controls drawn over a full-page invitation (back / select),
// matching EditBar's buttons. Inline styles on purpose: they render on
// top of each design's own scoped stylesheet and must not depend on, or
// leak into, any site or dashboard CSS.
export const floatingBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '9px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
  background: 'rgba(20,18,16,.55)', color: '#fff',
  fontFamily: '-apple-system,"Segoe UI",Roboto,sans-serif', fontSize: 12.5, fontWeight: 600,
  letterSpacing: '.03em', textDecoration: 'none', backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
}

export const floatingTopLeft = { position: 'fixed', top: 16, left: 16, zIndex: 200 }
