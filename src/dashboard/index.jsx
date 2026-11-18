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
import { CUSTOMER_DASHBOARD } from '../site/features';

function Shell() {
  const dash = useDashboard();
  const { isAdmin } = useAuth();
  const { mode, page, go, ctx, sidebarOpen, setSidebarOpen, drawer, closeDrawer } = dash;
  const def = PAGES[page] && (!PAGES[page].admin || isAdmin) ? PAGES[page] : PAGES.overview;
  const Page = def.component;
  const ev = ctx();
  // The platform isn't wedding-only: a fresh couple-mode event has no type
  // yet, so nothing event-specific renders until one is picked. Admin pages
  // aren't about the event, so they never wait for that.
  const gated = mode === 'couple' && !ev.type && !def.admin;

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

// While the customer dashboard is off (site/features.js): Siloona staff get
// the Orders page alone, and any other signed-in account gets nothing.
export function StaffOrders() {
  const { sidebarOpen, setSidebarOpen, drawer, closeDrawer } = useDashboard();
  const { logOut } = useAuth();
  const Orders = PAGES.orders.component;
  return (
    <div className="siloona-dashboard">
      <main className="view">
        <button type="button" className="link" style={{ padding: 0, marginBottom: 16 }} onClick={logOut}>Դուրս գալ</button>
        <Orders />
      </main>
      <div className={`scrim ${sidebarOpen || drawer ? 'on' : ''}`} onClick={() => { setSidebarOpen(false); closeDrawer(); }} />
      <DrawerHost />
      <ModalHost />
      <MenuHost />
      <ToastHost />
    </div>
  );
}

function NoAccess() {
  const { logOut } = useAuth();
  return (
    <div className="siloona-dashboard">
      <div className="auth-screen">
        <div className="auth-card">
          <p className="eyebrow">Siloona</p>
          <h1>Մուտքն արգելված է</h1>
          <button type="button" className="btn primary full" onClick={logOut}>Դուրս գալ</button>
        </div>
      </div>
    </div>
  );
}

function AuthGate() {
  const { isSupabaseConfigured, status, error, profile, isAdmin } = useAuth();

  if (!isSupabaseConfigured) return <SetupScreen />;
  if (status === 'loading') return <div className="siloona-dashboard"><div className="auth-screen"><p className="muted">Բեռնվում է…</p></div></div>;
  if (status === 'error') return <div className="siloona-dashboard"><div className="auth-screen"><div className="auth-card"><h1>Սխալ</h1><p className="muted">{error}</p></div></div></div>;
  if (status === 'signed-out') return <AuthScreen />;
  if (!CUSTOMER_DASHBOARD && !isAdmin) return <NoAccess />;

  return (
    <DashboardProvider initialMode={profile.mode}>
      {CUSTOMER_DASHBOARD ? <Shell /> : <StaffOrders />}
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
