import Icon from '../utils/icons';
import { Badge } from '../components/Badge';
import { Seg } from '../components/Controls';
import MilestoneRow from '../components/MilestoneRow';
import { useDashboard } from '../state/DashboardContext';
import { orgEvents, evStatus } from '../data/selectors';
import { TYPES, EV_ST } from '../data/constants';
import { addDays, sameDay, toISO, cap, MONTHS, WEEK_S } from '../utils/format';
import { openRef } from '../refs';
import { openMilestoneModal } from '../modals/DetailsModals';
import { openEventModal } from '../modals/EventModal';

function calItems(dash, ev) {
  if (dash.mode === 'couple') return ev.milestones.map(m => ({ date: m.date, title: m.title, sub: m.note, cls: `ms-chip ${m.main ? 'main' : ''}`, open: `ms:${m.id}`, m }));
  return orgEvents().map(e => ({ date: e.date, title: e.title, sub: `${e.time} · ${TYPES[e.type].l} · ${e.locations[0]?.name || ''}`, cls: TYPES[e.type].cls, open: `event:${e.id}`, e }));
}

export default function Calendar() {
  const dash = useDashboard();
  const ev = dash.ctx();
  const c = dash.ui.cal;
  const items = calItems(dash, ev);

  const move = (d) => { c.month = new Date(c.month.getFullYear(), c.month.getMonth() + d, 1); dash.bump(); };
  const today = () => { c.month = new Date(); c.month.setDate(1); dash.bump(); };

  return (
    <>
      <div className="toolbar">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {c.view === 'cal' ? (
            <>
              <button className="icon-btn sm" onClick={() => move(-1)} aria-label="Նախորդ"><Icon name="chevL" /></button>
              <button className="icon-btn sm" onClick={() => move(1)} aria-label="Հաջորդ"><Icon name="chevR" /></button>
              <h3 className="serif" style={{ fontWeight: 500, fontSize: 18, margin: '0 8px', minWidth: 160 }}>{cap(MONTHS[c.month.getMonth()])} {c.month.getFullYear()}</h3>
              <button className="btn sm" onClick={today}>Այսօր</button>
            </>
          ) : <span className="muted small">{items.length} {dash.mode === 'couple' ? 'կարևոր ամսաթիվ' : 'միջոցառում'}</span>}
        </div>
        <div className="spacer" />
        {dash.mode === 'couple' ? <button className="btn" onClick={() => openMilestoneModal(dash, ev, null)}><Icon name="plus" /> Ավելացնել ամսաթիվ</button> : <button className="btn" onClick={() => openEventModal(dash, null)}><Icon name="plus" /> Նոր միջոցառում</button>}
        <Seg value={c.view} onChange={v => { c.view = v; dash.bump(); }} items={[['cal', <>{<Icon name="cal" />} Օրացույց</>], ['list', <>{<Icon name="list" />} Ցուցակ</>]]} />
      </div>
      {c.view === 'list' ? <ListView dash={dash} ev={ev} items={items} /> : <GridView dash={dash} month={c.month} items={items} />}
    </>
  );
}

function ListView({ dash, ev, items }) {
  const sorted = items.slice().sort((a, b) => a.date - b.date);
  const groups = [];
  sorted.forEach(it => { const k = it.date.getFullYear() * 12 + it.date.getMonth(); let g = groups.find(x => x.k === k); if (!g) groups.push(g = { k, d: it.date, items: [] }); g.items.push(it); });
  return (
    <>
      {groups.map(g => (
        <div key={g.k}>
          <div className="ev-month">{cap(MONTHS[g.d.getMonth()])} {g.d.getFullYear()}<span>{g.items.length}</span></div>
          <div className="ev-list">
            {g.items.map(it => dash.mode === 'couple' ? (
              <div style={{ padding: '0 18px' }} key={it.m.id}><MilestoneRow dash={dash} ev={ev} m={it.m} /></div>
            ) : (
              <div className={`list-row ${it.date < new Date() ? 'past' : ''}`} key={it.e.id} style={it.date < new Date() ? { opacity: .65 } : undefined} onClick={() => openRef(dash, it.open)}>
                <div className="dblk"><div className="d">{it.date.getDate()}</div><div className="m">{WEEK_S[it.date.getDay()]}</div></div>
                <div className="cell-2" style={{ flex: 1 }}><span className="strong">{it.title}</span><small>{it.sub}</small></div>
                <Badge map={EV_ST} value={evStatus(it.e)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function GridView({ dash, month, items }) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = addDays(first, -((first.getDay() + 6) % 7));
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const weeks = cells[35].getMonth() !== month.getMonth() ? 35 : 42;
  const today = new Date();

  return (
    <>
      <div className="cal">
        <div className="cal-head">{['Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուրբ', 'Շբթ', 'Կիր'].map(d => <div key={d}>{d}</div>)}</div>
        <div className="cal-grid">
          {cells.slice(0, weeks).map((d, i) => {
            const on = items.filter(it => sameDay(it.date, d));
            return (
              <div key={i} className={`cal-cell ${d.getMonth() !== month.getMonth() ? 'out' : ''} ${sameDay(d, today) ? 'today' : ''} ${d.getDay() === 0 || d.getDay() === 6 ? 'wknd' : ''}`}>
                <span className="dn">{d.getDate()}</span>
                {on.slice(0, 3).map((it, k) => <button key={k} className={`cal-ev ${it.cls}`} onClick={() => openRef(dash, it.open)} title={it.title}>{it.title}</button>)}
                {on.length > 3 && <button className="cal-more" onClick={e => dash.openMenu(e.currentTarget, (
                  <>
                    <div className="mh">{d.getDate()} {cap(MONTHS[d.getMonth()])}</div>
                    {on.map((it, k) => <button key={k} className="mi" onClick={() => { dash.closeMenu(); openRef(dash, it.open); }}>{it.title}</button>)}
                  </>
                ))}>+{on.length - 3}</button>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="legend" style={{ marginTop: 14 }}>
        {dash.mode === 'couple'
          ? <><span><i style={{ background: 'var(--wine)' }} /> Միջոցառման օր</span><span><i style={{ background: 'var(--amber)' }} /> Կարևոր ամսաթվեր</span></>
          : Object.values(TYPES).map(v => <span key={v.l} className={v.cls}><i style={{ background: 'var(--tc)' }} />{v.l}</span>)}
      </div>
    </>
  );
}
