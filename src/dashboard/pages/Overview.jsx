import Icon from '../utils/icons';
import Kpi from '../components/Kpi';
import RsvpBar from '../components/RsvpBar';
import MiniCalendar from '../components/MiniCalendar';
import EmptyState from '../components/EmptyState';
import { Badge } from '../components/Badge';
import EventDashboard from './EventDashboard';
import { useDashboard } from '../state/DashboardContext';
import { orgEvents, evStatus, stats } from '../data/selectors';
import { SETTINGS, ACTIVITY } from '../data/mockMeta';
import { EV_ST, TYPES } from '../data/constants';
import { TODAY, NOW, MONTHS_S, MONTHS_G, WEEK_L, num, relTime } from '../utils/format';
import { openEventModal } from '../modals/EventModal';
import { openRef } from '../refs';

function OrgOverview() {
  const dash = useDashboard();
  const { go } = dash;
  const evs = orgEvents();
  const up = evs.filter(e => e.date >= TODAY).sort((a, b) => a.date - b.date);
  const cnt = st => evs.filter(e => evStatus(e) === st).length;
  const live = evs.filter(e => evStatus(e) !== 'done');
  const all = live.flatMap(e => e.guests);
  const s = stats({ guests: all }, all);
  const today = evs.find(e => evStatus(e) === 'today');
  const acts = ACTIVITY.filter(a => orgEvents().some(e => e.id === a.ev)).slice(0, 9);
  const evMap = Object.fromEntries(evs.map(e => [e.id, e]));

  const evTab = (tab) => { dash.patchUi('ev', { tab }); go('events'); };

  return (
    <>
      <div className="hello">
        <div>
          <h2>{NOW.getHours() < 12 ? 'Բարի լույս' : NOW.getHours() < 18 ? 'Բարի օր' : 'Բարի երեկո'}, {SETTINGS.org.profile.name.split(' ')[0]}</h2>
          <p className="muted">{WEEK_L[TODAY.getDay()]}, {TODAY.getDate()} {MONTHS_G[TODAY.getMonth()]} · {today ? `այսօր՝ «${today.title}», ${today.time}` : 'այսօր միջոցառումներ չկան'}</p>
        </div>
        <div className="spacer" />
        <button className="btn" onClick={() => go('calendar')}><Icon name="cal" /> Օրացույց</button>
        <button className="btn primary" onClick={() => openEventModal(dash, null)}><Icon name="plus" /> Նոր միջոցառում</button>
      </div>
      <div className="kpis k6">
        <Kpi label="Բոլոր միջոցառումները" value={evs.length} detail={`${cnt('draft')} սևագիր`} onClick={() => evTab('all')} />
        <Kpi label="Առաջիկա" value={up.length} detail={up[0] ? `մոտական՝ ${MONTHS_S[up[0].date.getMonth()]} ${up[0].date.getDate()}` : '—'} onClick={() => evTab('upcoming')} tone="gold" />
        <Kpi label="Ակտիվ" value={cnt('active') + cnt('today')} detail="հրապարակված հրավերով" onClick={() => evTab('active')} />
        <Kpi label="Ավարտված" value={cnt('done')} detail="արխիվում" onClick={() => go('archive')} />
        <Kpi label="Հյուրեր" value={num(s.people)} detail={`${live.length} ընթացիկ միջոցառումներում`} />
        <Kpi label="RSVP պատասխաններ" value={`${s.rate}%`} detail={`${num(s.confirmed)} հյուր հաստատել է`} />
      </div>
      <div className="grid g-21">
        <section className="panel">
          <div className="panel-h"><h3>Առաջիկա միջոցառումները</h3><div className="spacer" /><button className="link" onClick={() => go('events')}>Բոլորը</button></div>
          <div>
            {!evs.length && <EmptyState title="Միջոցառումներ դեռ չկան" sub="Ստեղծեք Ձեր առաջին միջոցառումը՝ հյուրերին հրավիրելու համար"><button className="btn primary" onClick={() => openEventModal(dash, null)}><Icon name="plus" /> Նոր միջոցառում</button></EmptyState>}
            {up.slice(0, 6).map(e => { const es = stats(e); return (
              <div className="list-row" key={e.id} onClick={() => openRef(dash, `event:${e.id}`)}>
                <div className="dblk"><div className="d">{e.date.getDate()}</div><div className="m">{MONTHS_S[e.date.getMonth()]}</div></div>
                <div className="cell-2" style={{ flex: 1.4 }}><span className="strong">{e.title}</span><small>{TYPES[e.type].l} · {e.locations[0]?.name || '—'}</small></div>
                <div className="c-sm" style={{ flex: 1, minWidth: 120 }}>
                  {es.records && e.inv.status === 'published' ? <><RsvpBar stats={es} /><div className="small muted" style={{ marginTop: 5 }}>{es.confirmed} / {es.people} կգա · {es.rate}%</div></> : <span className="small muted">{es.people} հյուր · հրավերը ուղարկված չէ</span>}
                </div>
                <div style={{ width: 96, textAlign: 'right' }}><Badge map={EV_ST} value={evStatus(e)} /></div>
              </div>
            ); })}
          </div>
        </section>
        <section className="panel">
          <div className="panel-h"><h3>Օրացույց</h3></div>
          <div className="panel-b"><MiniCalendar month={dash.ui.cal.mini} onDayEvents={(iso, list, anchorEl) => dash.openMenu(anchorEl, (
            <>
              <div className="mh">{list.length} միջոցառում</div>
              {list.map(e => <button key={e.id} className="mi" onClick={() => { dash.closeMenu(); openRef(dash, `event:${e.id}`); }}>{e.title}</button>)}
            </>
          ))} onOpenEvent={id => openRef(dash, `event:${id}`)} /></div>
        </section>
      </div>
      <div className="grid g-11">
        <section className="panel">
          <div className="panel-h"><h3>RSVP ըստ միջոցառումների</h3><span className="sub">ընթացիկ</span></div>
          <div className="panel-b">
            <RsvpBar stats={s} lg />
            <div className="legend" style={{ margin: '12px 0 14px' }}><span><i className="c-conf" /> Կգան {num(s.confirmed)}</span><span><i className="c-dec" /> Չեն գա {num(s.declined)}</span><span><i className="c-pend" /> Չեն պատասխանել {num(s.pending)}</span></div>
            {live.filter(e => e.inv.status === 'published').map(e => { const es = stats(e); return (
              <div key={e.id} style={{ cursor: 'pointer', padding: '9px 0', borderTop: '1px solid var(--line)' }} onClick={() => openRef(dash, `event:${e.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, marginBottom: 6 }}><span>{e.title}</span><span className="muted small nowrap">{es.rate}% · {e.date.getDate()} {MONTHS_S[e.date.getMonth()]}</span></div>
                <RsvpBar stats={es} />
              </div>
            ); })}
          </div>
        </section>
        <section className="panel">
          <div className="panel-h"><h3>Վերջին գործողությունները</h3></div>
          <ul className="feed">
            {acts.map((a, i) => (
              <li key={i} style={{ cursor: 'pointer' }} onClick={() => openRef(dash, a.open)}>
                <span className="fd" style={{ background: a.c }} /><span>{a.node}<span className="muted"> · {evMap[a.ev]?.title}</span></span><span className="ft">{relTime(a.at)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

export default function Overview() {
  const { mode, ctx } = useDashboard();
  return mode === 'couple' ? <EventDashboard ev={ctx()} /> : <OrgOverview />;
}
