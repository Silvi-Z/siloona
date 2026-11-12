import { EVENTS } from './mockEvents';
import { rint } from './seed';
import { fullName, ppl } from './selectors';
import { TODAY, NOW, nowX, dayDiff } from '../utils/format';

/* Settings — mutable singleton, saved in-place by data/actions.jsx */
export const SETTINGS = {
  couple: { profile: { name: 'Անի Հովհաննիսյան', email: 'ani.davit@gmail.com', phone: '+374 91 23 45 67' } },
  org: { profile: { name: 'Նարինե Պետրոսյան', company: 'Narine Events', role: 'Միջոցառումների կազմակերպիչ', email: 'narine@narine-events.am', phone: '+374 99 45 67 89' } },
  account: { twofa: false },
  lang: { ui: 'hy', inv: ['hy', 'en'], dateFmt: 'long' },
  notif: { rsvp: true, digest: true, deadline: true, views: false, email: true, sms: false, telegram: true },
};

/* Recent-activity feed: initial responses from the last few days + live user actions appended via logActivity() */
export const ACTIVITY = [];
EVENTS.forEach(e => e.guests.filter(g => g.at && dayDiff(TODAY, g.at) <= 4).forEach(g => ACTIVITY.push({
  at: g.at, ev: e.id, c: g.rsvp === 'confirmed' ? 'var(--sage)' : 'var(--rose)',
  node: <><b>{fullName(g)}</b> {g.rsvp === 'confirmed' ? <>հաստատեց մասնակցությունը{ppl(g) > 1 ? ` · ${ppl(g)} հոգի` : ''}</> : 'մերժեց հրավերը'}</>,
  open: `guest:${e.id}:${g.id}`,
})));
EVENTS.filter(e => e.owner === 'org').forEach(e => e.guests.filter(g => g.att === 'arrived' && dayDiff(e.date, TODAY) === 0).slice(0, 4).forEach(g => ACTIVITY.push({
  at: new Date(NOW.getTime() - rint(5, 50) * 6e4), ev: e.id, c: 'var(--wine)',
  node: <><b>{fullName(g)}</b> ժամանեց միջոցառմանը</>,
  open: `guest:${e.id}:${g.id}`,
})));
ACTIVITY.sort((a, b) => b.at - a.at);
export function logActivity(ev, node, open, c = 'var(--wine)') {
  ACTIVITY.unshift({ at: nowX(), ev: ev.id, c, node, open });
}

/* Notifications per mode — empty on first open. Real entries get pushed in
   (via logActivity-style calls, or a dedicated notifier) once there's
   actual guest/event activity to report. */
export const NOTIFS = { couple: [], org: [] };
