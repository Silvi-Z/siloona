import { MenuItem } from './Overlays';
import { invUrl, evStatus, orgEvents } from '../data/selectors';
import { openEventModal } from '../modals/EventModal';
import * as actions from '../data/actions';

export function openEventMenu(dash, anchorEl, ev) {
  const copyLink = () => navigator.clipboard?.writeText(`https://${invUrl(ev)}`).then(() => dash.toast('Հղումը պատճենվեց'));
  const del = () => dash.confirm('Ջնջե՞լ միջոցառումը', `«${ev.title}» միջոցառումը և նրա ${ev.guests.length} հյուրի ցուցակը կջնջվեն։`, 'Ջնջել', () => {
    actions.deleteEvent(ev);
    if (dash.orgEvent === ev.id) {
      const next = orgEvents().find(x => evStatus(x) !== 'done');
      if (next) dash.setOrgEvent(next.id);
    }
    dash.bump();
    dash.toast('Միջոցառումը ջնջվեց');
  });
  dash.openMenu(anchorEl, (
    <>
      <div className="mh">{ev.title}</div>
      <MenuItem label="Վահանակ" icon="overview" onClick={() => { dash.closeMenu(); dash.setOrgEvent(ev.id); dash.go('event'); }} />
      <MenuItem label="Հյուրեր" icon="guests" onClick={() => { dash.closeMenu(); dash.setOrgEvent(ev.id); dash.go('guests'); }} />
      <MenuItem label="Մանրամասներ" icon="edit" onClick={() => { dash.closeMenu(); dash.setOrgEvent(ev.id); dash.go('details'); }} />
      <MenuItem label="Պատճենել հղումը" icon="copy" onClick={() => { dash.closeMenu(); copyLink(); }} />
      <MenuItem label="Կրկնօրինակել" icon="layers" onClick={() => { dash.closeMenu(); openEventModal(dash, ev.id); }} />
      {evStatus(ev) === 'draft' && <><hr /><MenuItem label="Ջնջել միջոցառումը" icon="trash" danger onClick={() => { dash.closeMenu(); del(); }} /></>}
    </>
  ));
}
