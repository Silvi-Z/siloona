import { orgEvents, evStatus } from '../data/selectors';
import { addDays, sameDay, sameMonth, toISO, MONTHS_S } from '../utils/format';
import { Badge } from './Badge';
import { EV_ST } from '../data/constants';

const DOW = ['Ե', 'Ե', 'Չ', 'Հ', 'Ու', 'Շ', 'Կ'];

export default function MiniCalendar({ month, onDayEvents, onOpenEvent }) {
  const evs = orgEvents();
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = addDays(first, -((first.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const list = evs.filter(e => sameMonth(e.date, month)).sort((a, b) => a.date - b.date);
  const today = new Date();
  return (
    <>
      <div className="mc">
        {DOW.map((x, i) => <div className="h" key={i}>{x}</div>)}
        {days.map((d, i) => {
          const on = evs.filter(e => sameDay(e.date, d));
          const cls = ['d', d.getMonth() !== month.getMonth() ? 'out' : '', sameDay(d, today) ? 'today' : '', on.length ? 'has' : ''].filter(Boolean).join(' ');
          return (
            <button key={i} className={cls} tabIndex={on.length ? 0 : -1}
              title={on.length ? on.map(e => e.title).join(', ') : undefined}
              onClick={on.length ? (e) => onDayEvents(toISO(d), on, e.currentTarget) : undefined}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}>
        {list.length ? list.map(e => (
          <div className="list-row" style={{ padding: '9px 0' }} key={e.id} onClick={() => onOpenEvent(e.id)}>
            <span className="serif" style={{ width: 26 }}>{e.date.getDate()}</span>
            <div className="cell-2" style={{ flex: 1 }}><span>{e.title}</span><small>{e.time} · {MONTHS_S[e.date.getMonth()]}</small></div>
            <Badge map={EV_ST} value={evStatus(e)} />
          </div>
        )) : <p className="muted small" style={{ margin: '6px 0 0' }}>Այս ամսին միջոցառումներ չկան</p>}
      </div>
    </>
  );
}
