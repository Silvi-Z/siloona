import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../utils/icons';
import { useDashboard } from '../state/DashboardContext';
import { useAuth } from '../auth/AuthContext';
import { MenuItem } from './Overlays';
import { orgEvents } from '../data/selectors';
import { fullName, grp } from '../data/selectors';
import { SETTINGS, NOTIFS } from '../data/mockMeta';
import { TYPES } from '../data/constants';
import { fmtD, relTime, initials } from '../utils/format';
import { TITLES, SCOPED } from '../navConfig';
import { openRef } from '../refs';

export default function TopBar() {
  const dash = useDashboard();
  const { logOut } = useAuth();
  const { mode, page, go, ctx, sidebarOpen, setSidebarOpen, openMenu, closeMenu } = dash;
  const ev = ctx();
  const [query, setQuery] = useState('');
  const [hl, setHl] = useState(-1);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); inputRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase(); if (!q) return { events: [], guests: [] };
    const evs = mode === 'couple' ? [ctx()] : orgEvents();
    const guests = [];
    evs.forEach(e => e.guests.forEach(g => { if (guests.length < 8 && `${fullName(g)} ${g.family} ${g.phone.replace(/\s/g, '')}`.toLowerCase().includes(q)) guests.push([e, g]); }));
    const events = mode === 'org' ? evs.filter(e => `${e.title} ${e.client || ''}`.toLowerCase().includes(q)).slice(0, 4) : [];
    return { events, guests };
  }, [query, mode, ctx]);
  const flat = [...results.events.map(e => ({ type: 'event', e })), ...results.guests.map(([e, g]) => ({ type: 'guest', e, g }))];
  const open = focused && query.trim().length > 0;

  const pick = (item) => {
    setQuery(''); setFocused(false);
    if (item.type === 'event') openRef(dash, `event:${item.e.id}`);
    else openRef(dash, `guest:${item.e.id}:${item.g.id}`);
  };

  const crumbRoot = mode === 'couple' ? ev.title : SETTINGS.org.profile.company;
  const showScoped = mode === 'org' && SCOPED.includes(page);

  const openNotifMenu = (anchorEl) => {
    const list = NOTIFS[mode];
    openMenu(anchorEl, (
      <div className="notif">
        <div className="nh"><b>Ծանուցումներ</b><div className="spacer" /><button className="link" onClick={() => { list.forEach(n => n.unread = false); closeMenu(); dash.bump(); }}>Նշել կարդացված</button></div>
        {list.map((n, i) => (
          <button key={i} className={`ni ${n.unread ? 'unread' : ''}`} onClick={() => { n.unread = false; closeMenu(); dash.bump(); openRef(dash, n.open); }}>
            <span className="nd" />
            <div className="cell-2"><b>{n.t}</b><span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{n.d}</span><small>{relTime(n.at)}</small></div>
          </button>
        ))}
        <div style={{ padding: '10px 16px' }}><button className="link" onClick={() => { closeMenu(); dash.ui.set.tab = 'notif'; go('account'); }}>Ծանուցումների կարգավորումներ</button></div>
      </div>
    ), 'notif');
  };

  const openProfileMenu = (anchorEl) => {
    openMenu(anchorEl, (
      <>
        <div className="mh">{mode === 'couple' ? SETTINGS.couple.profile.email : SETTINGS.org.profile.email}</div>
        <MenuItem label="Պրոֆիլ" icon="user" onClick={() => { closeMenu(); dash.ui.set.tab = 'profile'; go('account'); }} />
        <MenuItem label="Հաշիվ" icon="account" onClick={() => { closeMenu(); dash.ui.set.tab = 'account'; go('account'); }} />
        <MenuItem label="Լեզու" icon="globe" onClick={() => { closeMenu(); dash.ui.set.tab = 'lang'; go('account'); }} />
        <hr />
        <MenuItem label="Դուրս գալ" icon="out" onClick={() => { closeMenu(); dash.confirm('Դուրս գա՞լ', 'Կվերադառնաք մուտքի էջ։', 'Դուրս գալ', () => { logOut(); }, false); }} />
      </>
    ));
  };

  const hasUnread = NOTIFS[mode].some(n => n.unread);

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Մենյու"><Icon name="menu" /></button>
      <div>
        <div className="crumbs">
          <button onClick={() => go('overview')}>{crumbRoot}</button>
          {showScoped && <><span>/</span><button onClick={() => go('events')}>Միջոցառումներ</button>{page !== 'event' && <><span>/</span><button onClick={() => go('event')}>{ev?.title}</button></>}</>}
          {!showScoped && page !== 'overview' && <><span>/</span><span>{TITLES[mode][page]}</span></>}
        </div>
        <h1 className="page-title">{page === 'event' ? ev?.title : TITLES[mode][page]}</h1>
      </div>
      <div className="spacer-m" />
      <div className="top-search">
        <Icon name="search" />
        <input ref={inputRef} type="text" placeholder="Որոնել հյուր կամ միջոցառում…" autoComplete="off" aria-label="Որոնում"
          value={query}
          onChange={e => { setQuery(e.target.value); setHl(-1); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={e => {
            if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && flat.length) { e.preventDefault(); setHl(h => (h + (e.key === 'ArrowDown' ? 1 : -1) + flat.length) % flat.length); }
            if (e.key === 'Enter' && flat.length) { pick(flat[hl] || flat[0]); }
            if (e.key === 'Escape') { setQuery(''); setFocused(false); inputRef.current?.blur(); }
          }} />
        <span className="kbd">/</span>
        <div className={`search-pop ${open ? 'on' : ''}`}>
          {flat.length === 0 && <div className="sp-empty">«{query}» հարցմամբ արդյունքներ չկան</div>}
          {results.events.length > 0 && <div className="sp-h">Միջոցառումներ</div>}
          {results.events.map(e => (
            <button key={e.id} className={`sp-i ${flat[hl]?.e?.id === e.id && flat[hl]?.type === 'event' ? 'hl' : ''}`} onClick={() => pick({ type: 'event', e })}>
              <div className="cell-2"><span>{e.title}</span><small>{fmtD(e.date)} · {TYPES[e.type].l}</small></div><Icon name="arrow" />
            </button>
          ))}
          {results.guests.length > 0 && <div className="sp-h">Հյուրեր</div>}
          {results.guests.map(([e, g]) => (
            <button key={g.id} className={`sp-i ${flat[hl]?.g?.id === g.id ? 'hl' : ''}`} onClick={() => pick({ type: 'guest', e, g })}>
              <div className="cell-2"><span>{fullName(g)}</span><small>{mode === 'org' ? e.title + ' · ' : ''}{grp(e, g.group).name}</small></div><Icon name="arrow" />
            </button>
          ))}
        </div>
      </div>
      <button className="icon-btn" onClick={e => openNotifMenu(e.currentTarget)} aria-label="Ծանուցումներ"><Icon name="bell" />{hasUnread && <span className="dot" />}</button>
      <button className="profile" onClick={e => openProfileMenu(e.currentTarget)} aria-label="Պրոֆիլ">
        <span className="avatar">{initials(mode === 'couple' ? SETTINGS.couple.profile.name : SETTINGS.org.profile.name)}</span>
        <span className="pn"><span>{mode === 'couple' ? SETTINGS.couple.profile.name : SETTINGS.org.profile.name}</span><small>{mode === 'couple' ? 'Իմ հաշիվ' : SETTINGS.org.profile.company}</small></span>
      </button>
    </header>
  );
}
