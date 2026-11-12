import { useEffect, useRef, useState } from 'react';
import { useDashboard } from '../state/DashboardContext';
import Icon from '../utils/icons';

export function ModalHeader({ title, sub }) {
  const { closeModal } = useDashboard();
  return (
    <div className="m-h">
      <div style={{ flex: 1 }}><h3>{title}</h3>{sub && <p>{sub}</p>}</div>
      <button className="icon-btn sm bare" onClick={closeModal} aria-label="Փակել"><Icon name="close" /></button>
    </div>
  );
}

export function ModalHost() {
  const { modal, closeModal } = useDashboard();
  const on = !!modal;
  return (
    <div className={`modal-wrap ${on ? 'on' : ''}`} onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className={`modal ${modal?.size || ''}`} role="dialog" aria-modal="true">{modal?.content}</div>
    </div>
  );
}

export function DrawerHost() {
  const { drawer } = useDashboard();
  return (
    <aside className={`drawer ${drawer ? 'on' : ''}`} aria-hidden={!drawer}>
      {drawer}
    </aside>
  );
}

export function MenuHost() {
  const { menu, closeMenu } = useDashboard();
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: -9999, top: -9999 });

  useEffect(() => {
    if (!menu) return;
    const el = ref.current, anchor = menu.anchorEl;
    if (!el || !anchor) return;
    const r = anchor.getBoundingClientRect();
    const w = el.offsetWidth, h = el.offsetHeight;
    let left = Math.min(r.right - w, window.innerWidth - w - 12); left = Math.max(12, left);
    let top = r.bottom + 6; if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 6);
    setPos({ left, top });
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const onDown = e => { if (ref.current && !ref.current.contains(e.target) && e.target !== menu.anchorEl && !menu.anchorEl?.contains(e.target)) closeMenu(); };
    const onKey = e => { if (e.key === 'Escape') closeMenu(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', closeMenu);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', closeMenu); };
  }, [menu, closeMenu]);

  return (
    <div ref={ref} className={`menu-pop ${menu ? 'on' : ''} ${menu?.cls || ''}`} style={{ left: pos.left, top: pos.top }}>
      {menu?.content}
    </div>
  );
}

export function MenuItem({ label, icon, onClick, active, danger }) {
  return (
    <button type="button" className={`mi ${active ? 'on' : ''} ${danger ? 'danger' : ''}`} onClick={onClick}>
      {icon && <Icon name={icon} />}{label}
    </button>
  );
}

export function ToastHost() {
  const { toasts, dismissToast } = useDashboard();
  return (
    <div className="toasts">
      {toasts.map(t => (
        <div className="toast" key={t.id}>
          <Icon name="check" />
          <span>{t.msg}</span>
          {t.undo && <button className="tu" onClick={() => dismissToast(t.id, true)}>Հետարկել</button>}
        </div>
      ))}
    </div>
  );
}

