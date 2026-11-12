import { EVENTS } from './mockEvents';
import { TYPES } from './constants';
import { TODAY, dayDiff, pct } from '../utils/format';

export const EV = id => EVENTS.find(e => e.id === id);
export const orgEvents = () => EVENTS.filter(e => e.owner === 'org');
// The couple's one personal event — looked up by owner, not a hardcoded
// id, because a real (Supabase-backed) account's event gets a generated
// uuid, not the mock seed's literal 'C1'.
export const coupleEvent = () => EVENTS.find(e => e.owner === 'couple');
export const grp = (ev, id) => ev.groups.find(g => g.id === id) || { name: '—', color: '#ccc' };
export const fullName = g => `${g.first} ${g.last}`.trim();
export const ppl = g => 1 + (+g.companions || 0);
export const evDateTime = e => { const [h, m] = (e.time || '00:00').split(':').map(Number); return new Date(e.date.getFullYear(), e.date.getMonth(), e.date.getDate(), h || 0, m || 0); };
export const invUrl = e => `siloona.am/i/${e.inv.slug}`;
// A guest's own link is addressed by an unguessable token, not by name or
// a sequential id — opening it is how the invitation recognizes the guest.
export const guestInviteUrl = (e, g) => `${invUrl(e)}/${g.inviteToken}`;
export const personalizedGreeting = (e, g) => {
  if (!e.inv.personalize || !g) return e.inv.message;
  return e.inv.greeting.replace('{name}', g.first);
};
// What the event is fundamentally "about" — drives which identity fields
// (Details form, invitation summary, title) apply. See TYPES in constants.js.
export const identityKind = e => TYPES[e.type]?.identity || 'none';

export function evStatus(e) {
  const d = dayDiff(e.date, TODAY);
  if (d < 0) return 'done';
  if (e.inv.status !== 'published') return 'draft';
  return d === 0 ? 'today' : 'active';
}

export function stats(e, list = e.guests) {
  const s = { records: list.length, people: 0, confirmed: 0, declined: 0, pending: 0, cR: 0, dR: 0, pR: 0, arrived: 0, m: 0, f: 0, n: 0 };
  list.forEach(g => {
    const p = ppl(g); s.people += p; s[g.gender]++;
    if (g.rsvp === 'confirmed') { s.confirmed += p; s.cR++; if (g.att === 'arrived') s.arrived += p; }
    else if (g.rsvp === 'declined') { s.declined += p; s.dR++; }
    else { s.pending += p; s.pR++; }
  });
  s.responded = s.cR + s.dR; s.rate = pct(s.responded, s.records);
  return s;
}

// Returns ['Name1', 'Name2'] for "Name1 & Name2" titles, else null.
export const titleParts = e => e.title.includes(' & ') ? e.title.split(' & ') : null;
