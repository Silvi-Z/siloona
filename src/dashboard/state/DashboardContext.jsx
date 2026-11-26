import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { EV, coupleEvent, orgEvents } from '../data/selectors';
import { schedulePersist } from '../data/sync';
import { syncReplies } from '../data/replies';
import Icon from '../utils/icons';
import { TODAY } from '../utils/format';

const initialUi = () => ({
  g: { q: '', rsvp: 'all', gender: 'all', group: 'all', att: 'all', channel: 'all', side: 'all', view: 'table', by: 'group', sort: 'name', dir: 1, page: 1, per: 50, sel: new Set(), open: {} },
  r: { q: '', tab: 'pending', page: 1 },
  ev: { q: '', tab: 'upcoming', type: 'all', view: 'list' },
  cal: { view: 'cal', month: new Date(TODAY.getFullYear(), TODAY.getMonth(), 1), mini: new Date(TODAY.getFullYear(), TODAY.getMonth(), 1) },
  set: { tab: 'profile' },
});

const DashboardCtx = createContext(null);
export const useDashboard = () => useContext(DashboardCtx);

export function DashboardProvider({ children, initialMode = 'couple' }) {
  const [rev, setRev] = useState(0);

  const [mode, setModeState] = useState(initialMode);
  const [page, setPage] = useState('overview');
  // An organizer who already has events must land with one of them as the
  // current event — with none selected, ctx() is undefined and every
  // event-scoped component (Sidebar switcher, TopBar, pages) would throw.
  // EVENTS is fully loaded before this provider mounts (see AuthGate).
  const [orgEvent, setOrgEventState] = useState(() => {
    const evs = orgEvents().sort((a, b) => a.date - b.date);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return (evs.find(e => e.date >= now) || evs[evs.length - 1])?.id ?? null;
  });
  const uiRef = useRef(initialUi());

  // Every mutation already ends in bump() — piggyback the debounced
  // Supabase save on the same signal instead of touching every action.
  const bump = useCallback(() => {
    setRev(r => r + 1);
    schedulePersist(mode === 'couple' ? coupleEvent() : EV(orgEvent));
  }, [mode, orgEvent]);

  const resetGuestUi = useCallback(() => {
    Object.assign(uiRef.current.g, { q: '', rsvp: 'all', gender: 'all', group: 'all', att: 'all', channel: 'all', side: 'all', page: 1, open: {} });
    uiRef.current.g.sel.clear();
    uiRef.current.r.page = 1; uiRef.current.r.q = '';
  }, []);

  const setPath = useCallback((path, v) => {
    const [ns, k] = path.split('.');
    const cur = uiRef.current[ns][k];
    uiRef.current[ns][k] = typeof cur === 'number' ? +v : v;
    if ('page' in uiRef.current[ns] && k !== 'page') uiRef.current[ns].page = 1;
    bump();
  }, [bump]);
  const patchUi = useCallback((ns, patch) => { Object.assign(uiRef.current[ns], patch); bump(); }, [bump]);

  const go = useCallback((p) => {
    setPage(p);
    try { if (location.hash !== '#' + p) history.replaceState(null, '', '#' + p); } catch { /* no-op */ }
    window.scrollTo(0, 0);
  }, []);
  const setMode = useCallback((m) => { setModeState(prev => { if (prev === m) return prev; resetGuestUi(); return m; }); }, [resetGuestUi]);
  const setOrgEvent = useCallback((id) => { setOrgEventState(prev => { if (prev === id) return prev; resetGuestUi(); return id; }); }, [resetGuestUi]);

  const ctx = useCallback(() => mode === 'couple' ? coupleEvent() : EV(orgEvent), [mode, orgEvent]);

  // New answers from guests' links while the dashboard is open: check every
  // minute (and when the tab comes back into view) and redraw if any came.
  useEffect(() => {
    const pull = () => { if (document.visibilityState !== 'hidden') syncReplies().then(n => { if (n) setRev(r => r + 1); }); };
    const t = setInterval(pull, 60000);
    document.addEventListener('visibilitychange', pull);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', pull); };
  }, []);

  useEffect(() => {
    const onHash = () => { const h = location.hash.slice(1); if (h) setPage(h); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  /* Overlays */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [menu, setMenu] = useState(null);
  const [toasts, setToasts] = useState([]);

  const openModal = useCallback((content, size = '') => { setMenu(null); setModal({ content, size }); }, []);
  const closeModal = useCallback(() => setModal(null), []);
  const openDrawer = useCallback((content) => { setMenu(null); setDrawer(content); }, []);
  const closeDrawer = useCallback(() => setDrawer(null), []);
  const openMenu = useCallback((anchorEl, content, cls = '') => {
    setMenu(prev => (prev && prev.anchorEl === anchorEl) ? null : { anchorEl, content, cls });
  }, []);
  const closeMenu = useCallback(() => setMenu(null), []);
  const closeOverlays = useCallback(() => { setDrawer(null); setSidebarOpen(false); }, []);

  const toastSeq = useRef(0);
  const toast = useCallback((msg, undo) => {
    const id = ++toastSeq.current;
    setToasts(t => [...t, { id, msg, undo }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), undo ? 5200 : 2800);
  }, []);
  const dismissToast = useCallback((id, runUndo) => {
    setToasts(t => { const found = t.find(x => x.id === id); if (runUndo && found?.undo) found.undo(); return t.filter(x => x.id !== id); });
  }, []);
  const confirm = useCallback((title, text, okLabel, onOk, danger = true) => {
    const body = (
      <>
        <div className="m-h">
          <div style={{ flex: 1 }}><h3>{title}</h3></div>
          <button className="icon-btn sm bare" onClick={closeModal} aria-label="Փակել"><Icon name="close" /></button>
        </div>
        <div className="m-b"><p style={{ margin: 0, color: 'var(--ink-2)' }}>{text}</p></div>
        <div className="m-f">
          <button className="btn ghost" onClick={closeModal}>Չեղարկել</button>
          <button className={`btn ${danger ? 'danger' : 'primary'}`} onClick={() => { closeModal(); onOk(); }}>{okLabel}</button>
        </div>
      </>
    );
    openModal(body, 'narrow');
  }, [openModal, closeModal]);

  const value = {
    rev, bump,
    mode, setMode,
    page, go, setPage,
    orgEvent, setOrgEvent,
    ctx,
    ui: uiRef.current, setPath, patchUi, resetGuestUi,
    sidebarOpen, setSidebarOpen, closeOverlays,
    modal, openModal, closeModal,
    drawer, openDrawer, closeDrawer,
    menu, openMenu, closeMenu,
    toasts, toast, dismissToast,
    confirm,
  };
  return <DashboardCtx.Provider value={value}>{children}</DashboardCtx.Provider>;
}
