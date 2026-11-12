import Icon from '../utils/icons';
import { fmtDay, untilLabel } from '../utils/format';
import * as actions from '../data/actions';
import { openMilestoneModal } from '../modals/DetailsModals';

export default function MilestoneRow({ dash, ev, m }) {
  const toggle = () => {
    const res = actions.toggleMilestone(ev, m.id);
    if (res.goDetails) return dash.go('details');
    dash.bump();
    dash.toast(res.milestone.done ? `«${res.milestone.title}» · կատարված է` : 'Նշումը հանվեց');
  };
  return (
    <div className={`ms ${m.done ? 'done' : ''} ${m.main ? 'main' : ''}`}>
      <button className="ms-dot" onClick={toggle} aria-label="Կատարված">{(m.done || m.main) && <Icon name="check" />}</button>
      <div className="cell-2" style={{ flex: 1 }}><span>{m.title}</span><small>{fmtDay(m.date)}{m.note ? ' · ' + m.note : ''}</small></div>
      <span className="small muted nowrap">{untilLabel(m.date)}</span>
      {!m.main && <div className="row-edit"><button className="icon-btn sm bare" onClick={() => openMilestoneModal(dash, ev, m.id)} aria-label="Խմբագրել"><Icon name="edit" /></button></div>}
    </div>
  );
}
