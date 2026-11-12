// Mutable mock "database" — mirrors the HTML prototype's module-level
// EVENTS array. Each event owns its own guests/groups/locations/schedule/
// milestones, so switching the active organizer event can never leak data
// from another event. Actions in `actions.jsx` mutate this store in place;
// `DashboardContext`'s bump() forces a re-render afterwards.
import { R, pick, rint, wpick, nid } from './seed';
import { GROUP_COLORS, GROUP_PRESETS } from './constants';
import { TODAY, addDays, dayDiff, sameDay, minD } from '../utils/format';
import { genInviteToken } from '../utils/inviteToken';

export const F_NAMES = ['Անի', 'Մարիամ', 'Լիլիթ', 'Սոնա', 'Էլեն', 'Նանե', 'Մանե', 'Լուսինե', 'Սիրանուշ', 'Արփի', 'Աննա', 'Գայանե', 'Հասմիկ', 'Նարինե', 'Տաթև', 'Մերի', 'Լիանա', 'Ռուզաննա', 'Կարինե', 'Նաիրա', 'Էմմա', 'Մարինե', 'Զառա', 'Սոֆի', 'Ալինա', 'Եվա', 'Շուշան', 'Արմինե'];
export const M_NAMES = ['Դավիթ', 'Արմեն', 'Նարեկ', 'Գոռ', 'Տիգրան', 'Արտակ', 'Հայկ', 'Վահե', 'Արամ', 'Կարեն', 'Սամվել', 'Ռուբեն', 'Էդգար', 'Արսեն', 'Լևոն', 'Միքայել', 'Գևորգ', 'Աշոտ', 'Սուրեն', 'Վարդան', 'Հովհաննես', 'Էրիկ'];
export const L_NAMES = ['Հովհաննիսյան', 'Սարգսյան', 'Պետրոսյան', 'Գրիգորյան', 'Մկրտչյան', 'Հակոբյան', 'Ավետիսյան', 'Վարդանյան', 'Խաչատրյան', 'Ղազարյան', 'Մանուկյան', 'Պողոսյան', 'Ստեփանյան', 'Աբրահամյան', 'Կարապետյան', 'Մարտիրոսյան', 'Բաղդասարյան', 'Միքայելյան', 'Հարությունյան', 'Դավթյան', 'Մելքոնյան', 'Ադամյան', 'Թորոսյան', 'Եղիազարյան', 'Զաքարյան', 'Սահակյան', 'Գևորգյան', 'Ալեքսանյան'];
export const NOTES = ['Բուսակեր', 'Կգա փոքր երեխայի հետ', 'Մանկական աթոռ է պետք', 'Ուշ կժամանի', 'Ալերգիա ընկույզից', 'Տրանսպորտ է պետք', 'Կլինի միայն արարողությանը', 'Սեղան պարահրապարակից հեռու'];
const OPS = ['91', '93', '94', '95', '96', '97', '98', '99', '77', '55', '44', '41', '43', '33'];
export const phoneGen = () => `+374 ${pick(OPS)} ${rint(10, 99)} ${rint(10, 99)} ${rint(10, 99)}`;
const emailGen = () => `${pick(['guest', 'contact', 'hello'])}${rint(100, 999)}@${pick(['gmail.com', 'mail.ru', 'yahoo.com'])}`;
const CHANNEL_WEIGHTS = { whatsapp: 50, telegram: 22, viber: 10, sms: 10, email: 8 };
export const D = (y, m, d) => new Date(y, m - 1, d);
const atOf = d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), sameDay(d, TODAY) ? rint(9, 16) : rint(9, 22), rint(0, 59));

export const mkGroups = type => (GROUP_PRESETS[type] || []).map(([name, kind, w], i) => ({ id: nid('gr'), name, kind, w, color: GROUP_COLORS[i % GROUP_COLORS.length] }));
const mkList = (rows, f) => rows.map(r => ({ id: nid('x'), ...f(r) }));

function statusWeights(ev) {
  if (!ev.inv.published) return null;
  const d = dayDiff(ev.date, TODAY);
  if (d < 0) return { confirmed: 80, declined: 13, pending: 7 };
  if (d === 0) return { confirmed: 84, declined: 11, pending: 5 };
  if (d <= 45) return { confirmed: 55, declined: 11, pending: 34 };
  return { confirmed: 28, declined: 6, pending: 66 };
}
function genGuests(ev, target) {
  const w = statusWeights(ev), d = dayDiff(ev.date, TODAY);
  const gw = Object.fromEntries(ev.groups.map(g => [g.id, g.w]));
  const end = d < 0 ? addDays(ev.date, -2) : TODAY;
  const respond = () => { const span = Math.max(0, dayDiff(end, ev.inv.published)); return atOf(minD(addDays(ev.inv.published, Math.floor(Math.pow(R(), 1.5) * (span + 1))), end)); };
  const att = st => st !== 'confirmed' ? 'unknown' : d < 0 ? (R() < .93 ? 'arrived' : 'absent') : d === 0 ? (R() < .42 ? 'arrived' : 'unknown') : 'unknown';
  const mk = (first, last, gender, group, family, companions, st, at) => {
    const channel = wpick(CHANNEL_WEIGHTS);
    const hasPhone = R() < .93;
    return {
      id: nid('g'), first, last, gender, group, family, side: null,
      phone: hasPhone ? phoneGen() : '', email: channel === 'email' || R() < .3 ? emailGen() : '',
      rsvp: st, att: att(st), companions, notes: R() < .08 ? pick(NOTES) : '', at, reminded: null,
      channel, inviteToken: genInviteToken(), inviteStatus: 'draft', inviteSentAt: null, inviteOpenedAt: null,
    };
  };
  let people = 0;
  while (people < target) {
    const gid = wpick(gw), gr = ev.groups.find(g => g.id === gid);
    const st = w ? wpick(w) : 'pending', at = st === 'pending' ? null : respond();
    if (gr.kind === 'family') {
      const ln = pick(L_NAMES), size = rint(2, 5), fam = `${ln}ների ընտանիք`;
      for (let k = 0; k < size; k++) {
        const male = k === 0 ? true : k === 1 ? false : R() < .5;
        const ms = R() < .9 ? st : (w ? wpick(w) : 'pending');
        const mat = ms === 'pending' ? null : ms === st ? at : respond();
        ev.guests.push(mk(pick(male ? M_NAMES : F_NAMES), ln, R() < .03 ? 'n' : male ? 'm' : 'f', gr.id, fam, 0, ms, mat));
        people++;
      }
    } else {
      const male = R() < .5, comp = +wpick({ 0: 6, 1: 3, 2: 1 });
      ev.guests.push(mk(pick(male ? M_NAMES : F_NAMES), pick(L_NAMES), R() < .04 ? 'n' : male ? 'm' : 'f', gr.id, '', comp, st, at));
      people += 1 + comp;
    }
  }
}
export function newGuest(overrides) {
  return {
    id: nid('g'), first: '', last: '', gender: 'n', group: '', family: '', phone: '', email: '', side: null,
    rsvp: 'pending', att: 'unknown', companions: 0, notes: '', at: null, reminded: null,
    channel: 'whatsapp', inviteToken: genInviteToken(), inviteStatus: 'draft', inviteSentAt: null, inviteOpenedAt: null,
    ...overrides,
  };
}
export function newGroup(ev, name) {
  return { id: nid('gr'), name, kind: 'ind', w: 0, color: GROUP_COLORS[ev.groups.length % GROUP_COLORS.length] };
}

export const ORGANIZER = { name: 'Նարինե Պետրոսյան', company: 'Narine Events', phone: '+374 99 45 67 89', email: 'narine@narine-events.am' };
export const EVENTS = [];
export function addEvent(e, target) {
  e.groups = mkGroups(e.type); e.guests = [];
  e.info = Object.assign({ dress: '', dressColors: ['#6B1D2C'], kids: '', parking: '', maxPlus: 2, extra: '' }, e.info || {});
  e.organizer = e.organizer || (e.owner === 'org' ? { ...ORGANIZER } : null);
  e.milestones = e.milestones || [];
  e.customVenueTypes = e.customVenueTypes || [];
  e.inv = Object.assign({ status: e.inv.published ? 'published' : 'draft', langs: ['hy'], rsvp: true, views: 0, personalize: true, greeting: 'Սիրով հրավիրում ենք Ձեզ, {name}, մեր հատուկ օրը միասին նշելու' }, e.inv);
  EVENTS.push(e);
  genGuests(e, target);
  e.inv.views = e.inv.published ? Math.round(e.guests.length * (1.4 + R())) : 0;
  return e;
}
export const loc = (kind, name, address, time) => ({ id: nid('l'), kind, name, address, time });
export const sched = rows => mkList(rows, ([time, title, place]) => ({ time, title, place }));

/* Couple: one personal event, kept as a genuinely empty shell on first
   open — no event type is pre-selected (the dashboard is not wedding-only;
   see EventTypeGate), so there's no title, identity, guests, milestones,
   schedule, locations or published invitation until the user both picks a
   type and fills it in. See 0 passed as the guest target (genGuests is a
   no-op), and `type: null` skips group-preset creation (mkGroups(null)). */
addEvent({
  id: 'C1', owner: 'couple', type: null, title: '',
  date: D(2026, 12, 19), time: '15:00', description: '',
  locations: [],
  schedule: [],
  inv: { slug: 'my-event', published: null, deadline: D(2026, 12, 5), message: '', langs: ['hy'] },
}, 0);

/* Organizer: starts with zero events — a fresh organizer account sees the
   "create your first event" empty state until they add one via the UI. */
