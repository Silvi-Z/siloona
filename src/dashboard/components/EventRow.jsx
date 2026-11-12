import Icon from '../utils/icons';
import { Badge, TypeTag } from './Badge';
import RsvpBar from './RsvpBar';
import { stats, evStatus } from '../data/selectors';
import { EV_ST, TYPES } from '../data/constants';
import { MONTHS_S } from '../utils/format';
import { useDashboard } from '../state/DashboardContext';
import { openEventMenu } from './eventMenu';

export default function EventRow({ ev }) {
  const s = stats(ev), st = evStatus(ev);
  const dash = useDashboard();
  const { go, setOrgEvent } = dash;
  const open = () => { setOrgEvent(ev.id); go('event'); };
  return (
    <div className="evr" onClick={open}>
      <div className="dblk"><div className="d">{ev.date.getDate()}</div><div className="m">{MONTHS_S[ev.date.getMonth()]} {String(ev.date.getFullYear()).slice(2)}</div></div>
      <div className="cell-2"><span className="strong">{ev.title}</span><small>{TYPES[ev.type].l} · {ev.time}{ev.client ? ' · ' + ev.client : ''}</small></div>
      <div className="c-venue c-hide muted">{ev.locations[0]?.name || '—'}</div>
      <div className="c-hide"><Badge map={EV_ST} value={st} /></div>
      <div className="c-hide">
        {st === 'draft'
          ? <span className="small muted">{s.people} հյուր · հրավերն ուղարկված չէ</span>
          : <><RsvpBar stats={s} /><div className="small muted" style={{ marginTop: 5 }}>{st === 'done' ? `${s.arrived} ներկա · ${s.confirmed} հաստատած` : `${s.confirmed} / ${s.people} կգա · ${s.rate}%`}</div></>}
      </div>
      <div className="c-hide url"><span className="mono small">/i/{ev.inv.slug}</span></div>
      <button className="icon-btn sm bare" onClick={e => { e.stopPropagation(); openEventMenu(dash, e.currentTarget, ev); }} aria-label="Գործողություններ"><Icon name="more" /></button>
    </div>
  );
}
