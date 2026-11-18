import Icon from '../utils/icons';
import EventTitle from './EventTitle';
import { Badge } from './Badge';
import { MenuItem } from './Overlays';
import { useDashboard } from '../state/DashboardContext';
import { useAuth } from '../auth/AuthContext';
import { stats, evStatus, orgEvents } from '../data/selectors';
import { SETTINGS } from '../data/mockMeta';
import { EV_ST, TYPES } from '../data/constants';
import { fmtD, fmtDL, untilLabel } from '../utils/format';
import { NAV, SCOPED, ADMIN_NAV } from '../navConfig';

export default function Sidebar() {
  const { mode, page, go, orgEvent, setOrgEvent, ctx, sidebarOpen, openMenu, closeMenu } = useDashboard();
  const { logOut, isAdmin } = useAuth();
  const ev = ctx();
  const s = ev ? stats(ev) : null;
  const groups = NAV[mode];
  const hasOrgEvents = mode !== 'org' || orgEvents().length > 0;
  const gated = mode === 'couple' && !ev.type;

  const navLink = (key, label) => {
    const n = key === 'rsvp' && s ? s.pR : 0;
    const showCount = ev && n && ev.inv.status === 'published' && evStatus(ev) !== 'done';
    return (
      <a key={key} href={`#${key}`} className={page === key ? 'active' : ''}
        onClick={e => { e.preventDefault(); go(key); }}>
        <span className="nav-ic"><Icon name={key} /></span><span>{label}</span>
        {showCount ? <span className="count">{n}</span> : null}
      </a>
    );
  };

  const openEvSwitch = (anchorEl) => {
    const evs = orgEvents().sort((a, b) => a.date - b.date);
    const upcoming = evs.filter(e => evStatus(e) !== 'done');
    const archived = evs.filter(e => evStatus(e) === 'done').reverse();
    const pick = (id) => { setOrgEvent(id); go(SCOPED.includes(page) ? page : 'event'); closeMenu(); };
    const section = (title, list) => list.length > 0 && (
      <div key={title}>
        <div className="mh">{title}</div>
        {list.map(e => (
          <MenuItem key={e.id} active={e.id === orgEvent} onClick={() => pick(e.id)}
            label={<><span className={`gdot ${'ty-' + e.type}`} style={{ background: 'var(--tc)', margin: 0 }} /><span className="cell-2"><span>{e.title}</span><small>{fmtD(e.date)}</small></span></>} />
        ))}
      </div>
    );
    openMenu(anchorEl, (
      <>
        {section('Առաջիկա', upcoming)}
        {section('Արխիվ', archived)}
        <hr />
        <MenuItem label="Նոր միջոցառում" icon="plus" onClick={() => { closeMenu(); go('events'); }} />
      </>
    ));
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? 'on' : ''}`} id="sidebar" aria-label="Նավիգացիա">
      <a className="brand" href="#overview" onClick={e => { e.preventDefault(); go('overview'); }}><span className="word">Siloona</span></a>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {mode === 'couple' && ev.type && (
          <a className="wed-card" href="#overview" onClick={e => { e.preventDefault(); go('overview'); }}>
            <div className="eyebrow">{TYPES[ev.type].l}</div>
            <div className="wc-names"><EventTitle ev={ev} /></div>
            <div className="small muted">{fmtDL(ev.date)} · {untilLabel(ev.date)}</div>
          </a>
        )}
        <nav className="nav">
          {!gated && groups.map((g, i) => {
            if (g.switcher && !hasOrgEvents) return null;
            return (
              <div className="nav-group" key={i}>
                {g.label && <div className="nav-label">{g.label}</div>}
                {g.switcher && (
                  <button className="ev-switch" onClick={e => openEvSwitch(e.currentTarget)}>
                    <div className="cell-2"><span>{ev.title}</span><small>{fmtD(ev.date)} · {EV_ST[evStatus(ev)].l}</small></div>
                    <Icon name="upDown" />
                  </button>
                )}
                {g.items.map(([k, l]) => navLink(k, l))}
              </div>
            );
          })}
          {isAdmin && (
            <div className="nav-group">
              <div className="nav-label">{ADMIN_NAV.label}</div>
              {ADMIN_NAV.items.map(([k, l]) => navLink(k, l))}
            </div>
          )}
          {!gated && <div className="nav-group">{navLink('account', 'Կարգավորումներ')}</div>}
        </nav>
        <div className="sb-foot">
          <b>{mode === 'couple' ? 'Իմ հաշիվ' : SETTINGS.org.profile.company}</b><br />
          {mode === 'couple' ? 'Իմ միջոցառումը · siloona.am' : `${orgEvents().length} միջոցառում · siloona.am`}<br />
          <button type="button" className="link" style={{ marginTop: 6, padding: 0 }} onClick={logOut}>Դուրս գալ</button>
        </div>
      </div>
    </aside>
  );
}
