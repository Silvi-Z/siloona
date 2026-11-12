import { useEffect } from 'react';
import './dashboard.css';
import { DashboardProvider, useDashboard } from './state/DashboardContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AuthScreen from './auth/AuthScreen';
import SetupScreen from './auth/SetupScreen';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import BulkBar from './components/BulkBar';
import EventTypeGate from './components/EventTypeGate';
import { ModalHost, DrawerHost, MenuHost, ToastHost } from './components/Overlays';
import { PAGES } from './pages';

function Shell() {
  const dash = useDashboard();
  const { mode, page, go, ctx, sidebarOpen, setSidebarOpen, drawer, closeDrawer } = dash;
  const Page = PAGES[page] ? PAGES[page].component : PAGES.overview.component;
  const ev = ctx();
  // The platform isn't wedding-only: a fresh couple-mode event has no type
  // yet, so nothing event-specific renders until one is picked.
  const gated = mode === 'couple' && !ev.type;

  useEffect(() => {
    const initial = location.hash.slice(1);
    go(PAGES[initial] ? initial : 'overview');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') { if (dash.modal) dash.closeModal(); else if (dash.menu) dash.closeMenu(); else closeDrawer(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dash.modal, dash.menu, dash, closeDrawer]);

  const scrimOn = sidebarOpen || !!drawer;

  return (
    <div className="siloona-dashboard">
      <div className="app">
        <Sidebar />
        <div className="main">
          {gated ? (
            <EventTypeGate dash={dash} ev={ev} />
          ) : (
            <>
              <TopBar />
              <main className="view" key={page + (page === 'event' || page === 'designs' || page === 'invitation' || page === 'guests' || page === 'rsvp' || page === 'details' ? dash.orgEvent : '') + ':' + ev?.type}>
                <Page />
              </main>
            </>
          )}
        </div>
      </div>
      <BulkBar dash={dash} ev={dash.ctx()} />
      <div className={`scrim ${scrimOn ? 'on' : ''}`} onClick={() => { setSidebarOpen(false); closeDrawer(); }} />
      <DrawerHost />
      <ModalHost />
      <MenuHost />
      <ToastHost />
    </div>
  );
}

function AuthGate() {
  const { isSupabaseConfigured, status, error, profile } = useAuth();

  if (!isSupabaseConfigured) return <SetupScreen />;
  if (status === 'loading') return <div className="siloona-dashboard"><div className="auth-screen"><p className="muted">Բեռնվում է…</p></div></div>;
  if (status === 'error') return <div className="siloona-dashboard"><div className="auth-screen"><div className="auth-card"><h1>Սխալ</h1><p className="muted">{error}</p></div></div></div>;
  if (status === 'signed-out') return <AuthScreen />;

  return (
    <DashboardProvider initialMode={profile.mode}>
      <Shell />
    </DashboardProvider>
  );
}

export default function Dashboard() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
