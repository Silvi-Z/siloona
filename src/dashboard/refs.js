import { EV } from './data/selectors';
import { openGuestDrawer } from './modals/GuestModal';
import { openMilestoneModal } from './modals/DetailsModals';

// Central "open this thing" navigator — mirrors the prototype's openRef().
// `ref` strings look like "page:rsvp", "event:O2", "guest:O2:g14", "ms:x3".
export function openRef(dash, ref) {
  const [k, a, b] = ref.split(':');
  if (k === 'page') return dash.go(a);
  if (k === 'event') { dash.setOrgEvent(a); return dash.go('event'); }
  if (k === 'guest') {
    if (dash.mode === 'org' && dash.orgEvent !== a) dash.setOrgEvent(a);
    return openGuestDrawer(dash, EV(a), b);
  }
  if (k === 'ms') return openMilestoneModal(dash, dash.ctx(), a);
}
