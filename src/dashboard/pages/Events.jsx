import Icon from '../utils/icons';
import EmptyState from '../components/EmptyState';
import EventRow from '../components/EventRow';
import { SearchField, SelectField, Tabs } from '../components/Controls';
import { useDashboard } from '../state/DashboardContext';
import { orgEvents, evStatus } from '../data/selectors';
import { TYPES } from '../data/constants';
import { openEventModal } from '../modals/EventModal';

export default function Events() {
  const dash = useDashboard();
  const f = dash.ui.ev;
  const q = f.q.trim().toLowerCase();
  const base = orgEvents().filter(e => evStatus(e) !== 'done' && (f.type === 'all' || e.type === f.type) && (!q || `${e.title} ${e.client || ''} ${e.locations.map(l => l.name).join(' ')}`.toLowerCase().includes(q)));
  const tf = { all: () => true, upcoming: () => true, active: e => ['active', 'today'].includes(evStatus(e)), draft: e => evStatus(e) === 'draft' };
  const rows = base.filter(tf[f.tab] || tf.upcoming).sort((a, b) => a.date - b.date);
  const archived = orgEvents().filter(e => evStatus(e) === 'done').length;

  return (
    <>
      <div className="toolbar">
        <SearchField value={f.q} onChange={v => dash.setPath('ev.q', v)} placeholder="Որոնել միջոցառում…" />
        <div className="spacer" />
        <button className="btn" onClick={() => dash.go('calendar')}><Icon name="cal" /> Օրացույց</button>
        <button className="btn primary" onClick={() => openEventModal(dash, null)}><Icon name="plus" /> Նոր միջոցառում</button>
      </div>
      <Tabs value={f.tab === 'all' ? 'upcoming' : f.tab} onChange={v => dash.setPath('ev.tab', v)} items={[['upcoming', 'Առաջիկա', base.length], ['active', 'Ակտիվ', base.filter(tf.active).length], ['draft', 'Սևագրեր', base.filter(tf.draft).length]]} />
      <div className="filters">
        <SelectField value={f.type} onChange={v => dash.setPath('ev.type', v)} options={[['all', 'Բոլոր տեսակները'], ...Object.entries(TYPES).map(([k, v]) => [k, v.l])]} ariaLabel="Տեսակ" />
        <span className="count-l">{rows.length} միջոցառում · <button className="link" onClick={() => dash.go('archive')}>Արխիվ ({archived})</button></span>
      </div>
      <div className="evl">
        {rows.length ? rows.map(e => <EventRow key={e.id} ev={e} />) : <EmptyState title="Միջոցառումներ չեն գտնվել"><button className="btn primary" onClick={() => openEventModal(dash, null)}><Icon name="plus" /> Նոր միջոցառում</button></EmptyState>}
      </div>
    </>
  );
}
