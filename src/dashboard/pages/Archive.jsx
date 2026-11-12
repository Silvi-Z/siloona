import EmptyState from '../components/EmptyState';
import EventRow from '../components/EventRow';
import Kpi from '../components/Kpi';
import { SearchField } from '../components/Controls';
import { useDashboard } from '../state/DashboardContext';
import { orgEvents, evStatus, stats } from '../data/selectors';
import { num, pct } from '../utils/format';

export default function Archive() {
  const dash = useDashboard();
  const f = dash.ui.ev;
  const q = f.q.trim().toLowerCase();
  const rows = orgEvents().filter(e => evStatus(e) === 'done' && (!q || e.title.toLowerCase().includes(q))).sort((a, b) => b.date - a.date);
  const all = rows.flatMap(e => e.guests);
  const s = stats({ guests: all }, all);

  return (
    <>
      <div className="toolbar">
        <SearchField value={f.q} onChange={v => dash.setPath('ev.q', v)} placeholder="Որոնել արխիվում…" />
        <div className="spacer" />
        <span className="muted small">Ավարտված միջոցառումները պահվում են իրենց հյուրերի ցուցակներով և RSVP տվյալներով</span>
      </div>
      <div className="kpis k4">
        <Kpi label="Ավարտված միջոցառումներ" value={rows.length} detail="" />
        <Kpi label="Հրավիրված հյուրեր" value={num(s.people)} detail={`${s.records} հրավեր`} />
        <Kpi label="Ներկա են եղել" value={num(s.arrived)} detail={`${pct(s.arrived, s.confirmed)}% հաստատածներից`} tone="sage" icon="check" />
        <Kpi label="Միջին պատասխանի տոկոս" value={`${s.rate}%`} detail="" />
      </div>
      <div className="evl">{rows.length ? rows.map(e => <EventRow key={e.id} ev={e} />) : <EmptyState title="Արխիվը դատարկ է" />}</div>
    </>
  );
}
