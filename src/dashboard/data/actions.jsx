// Business-logic mutations, ported from the prototype's ACT handlers.
// Each function mutates the mock store in place and returns whatever the
// caller needs (the affected record, an error string, counts for toasts…).
// The caller is responsible for calling bump() + showing a toast afterwards —
// this file has no React/overlay concerns, matching "business logic separate
// from presentation."
import { nid } from './seed';
import { EVENTS, mkGroups, phoneGen, F_NAMES, M_NAMES, ORGANIZER } from './mockEvents';
import { GROUP_COLORS, TYPES, CHANNELS } from './constants';
import { grp, fullName, ppl } from './selectors';
import { logActivity, SETTINGS } from './mockMeta';
import { nowX, fromISO, addDays } from '../utils/format';
import { genInviteToken } from '../utils/inviteToken';
import { deleteRemote, persistProfile, persistNow } from './sync';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

/* ---------- Guests ---------- */
export function setRsvp(ev, g, st) {
  if (g.rsvp === st) return;
  g.rsvp = st; g.at = st === 'pending' ? null : nowX();
  if (st !== 'confirmed') g.att = 'unknown';
  if (st !== 'pending') logActivity(ev, <><b>{fullName(g)}</b> {st === 'confirmed' ? '· նշվեց որպես «Կգա»' : '· նշվեց որպես «Չի գա»'}</>, `guest:${ev.id}:${g.id}`, st === 'confirmed' ? 'var(--sage)' : 'var(--rose)');
}

export function deleteGuests(ev, ids) {
  const removed = ev.guests.map((g, i) => [g, i]).filter(([g]) => ids.includes(g.id));
  ev.guests = ev.guests.filter(g => !ids.includes(g.id));
  return removed;
}
export function undoDeleteGuests(ev, removed) {
  removed.forEach(([g, i]) => ev.guests.splice(Math.min(i, ev.guests.length), 0, g));
}

export function saveGuest(ev, id, form) {
  const first = form.first.trim();
  if (!first) return { error: 'Անունը պարտադիր է։' };
  const comp = +form.companions;
  if (!(comp >= 0 && comp <= 10)) return { error: 'Ուղեկցողների թիվը պետք է լինի 0–10։' };
  let group = form.group;
  if (group === '__new') {
    const name = (form.newGroup || '').trim();
    if (!name) return { error: 'Նշեք նոր խմբի անվանումը։' };
    const ng = { id: nid('gr'), name, kind: 'ind', w: 0, color: GROUP_COLORS[ev.groups.length % GROUP_COLORS.length] };
    ev.groups.push(ng); group = ng.id;
  }
  const data = { first, last: form.last.trim(), gender: form.gender, group, family: form.family.trim(), phone: form.phone.trim(), email: (form.email || '').trim(), channel: form.channel || 'whatsapp', rsvp: form.rsvp, companions: comp, notes: form.notes.trim(), side: form.side || null };
  if (form.att !== undefined) data.att = data.rsvp === 'confirmed' ? form.att : 'unknown';
  if (id) {
    const g = ev.guests.find(x => x.id === id);
    if (g.rsvp !== data.rsvp) data.at = data.rsvp === 'pending' ? null : nowX();
    // A channel/contact change invalidates any prior send attempt — it would
    // have gone through a different channel or a now-stale contact detail.
    if (g.channel !== data.channel || g[CHANNELS[data.channel].contact] !== data[CHANNELS[data.channel].contact]) {
      data.inviteStatus = 'draft'; data.inviteSentAt = null;
    }
    Object.assign(g, data);
    return { guest: g, isNew: false };
  }
  const g = { id: nid('g'), att: 'unknown', at: data.rsvp === 'pending' ? null : nowX(), reminded: null, inviteToken: genInviteToken(), inviteStatus: 'draft', inviteSentAt: null, inviteOpenedAt: null, ...data };
  ev.guests.unshift(g);
  logActivity(ev, <>Ավելացվեց հյուր <b>{fullName(g)}</b></>, `guest:${ev.id}:${g.id}`, 'var(--amber)');
  return { guest: g, isNew: true };
}

export function checkin(ev, guestId) {
  const g = ev.guests.find(x => x.id === guestId);
  g.att = 'arrived';
  logActivity(ev, <><b>{fullName(g)}</b> ժամանեց միջոցառմանը</>, `guest:${ev.id}:${g.id}`);
  return g;
}
export function undoCheckin(g) { g.att = 'unknown'; }

export function remindGuest(g) { g.reminded = nowX(); }
export function remindAll(ev) {
  const list = ev.guests.filter(g => g.rsvp === 'pending');
  if (!list.length) return 0;
  const t = nowX();
  list.forEach(g => g.reminded = t);
  logActivity(ev, `RSVP հիշեցում ${list.length} հյուրի`, 'page:rsvp', 'var(--amber)');
  return list.length;
}
export function bulkRemind(ev, ids) {
  const list = ev.guests.filter(g => ids.has(g.id) && g.rsvp === 'pending');
  const t = nowX();
  list.forEach(g => g.reminded = t);
  return list.length;
}

export function famRsvp(ev, family, st) {
  let n = 0;
  ev.guests.filter(g => g.family === family).forEach(g => { if (g.rsvp !== st) { setRsvp(ev, g, st); n++; } });
  return n;
}
export function bulkSetRsvp(ev, ids, st) { ev.guests.filter(g => ids.has(g.id)).forEach(g => setRsvp(ev, g, st)); }
export function bulkSetGroup(ev, ids, groupId) { ev.guests.forEach(g => { if (ids.has(g.id)) g.group = groupId; }); }

export function importGuests(ev, text, groupId, family) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { error: 'Տեղադրեք առնվազն մեկ տող։' };
  const added = lines.map(l => {
    const [name, phone = '', plus = '0'] = l.split(',').map(x => x.trim());
    const [first, ...rest] = name.split(/\s+/);
    const fem = F_NAMES.includes(first), mal = M_NAMES.includes(first);
    return { id: nid('g'), first, last: rest.join(' '), gender: fem ? 'f' : mal ? 'm' : 'n', group: groupId, family: family.trim(), phone, email: '', side: null, channel: 'whatsapp', rsvp: 'pending', att: 'unknown', companions: Math.min(10, Math.max(0, parseInt(plus) || 0)), notes: '', at: null, reminded: null, inviteToken: genInviteToken(), inviteStatus: 'draft', inviteSentAt: null, inviteOpenedAt: null };
  });
  ev.guests.unshift(...added);
  logActivity(ev, `Ներմուծվեց ${added.length} հյուր`, 'page:guests', 'var(--amber)');
  return { added };
}

/* ---------- Groups ---------- */
export function addGroup(ev, name) {
  if (!name.trim()) return { error: true };
  if (ev.groups.some(g => g.name === name)) return { error: 'exists' };
  const g = { id: nid('gr'), name, kind: 'ind', w: 0, color: GROUP_COLORS[ev.groups.length % GROUP_COLORS.length] };
  ev.groups.push(g);
  return { group: g };
}
export function renameGroup(ev, id, name) { grp(ev, id).name = name; }
export function deleteGroup(ev, id) {
  const g = grp(ev, id), n = ev.guests.filter(x => x.group === id).length;
  if (ev.groups.length < 2) return { error: 'Պետք է մնա առնվազն մեկ խումբ' };
  const fb = ev.groups.find(x => x.id !== id && /^Այլ/.test(x.name)) || ev.groups.find(x => x.id !== id);
  ev.guests.forEach(x => { if (x.group === id) x.group = fb.id; });
  ev.groups = ev.groups.filter(x => x.id !== id);
  return { name: g.name, fallbackName: fb.name, count: n };
}
export function finalizeGroups(ev) { ev.groups.forEach(g => { if (!g.name.trim()) g.name = 'Անանուն խումբ'; }); }

/* ---------- Locations / schedule / milestones ---------- */
// Custom venue types are stored per-event (not globally) so they ride the
// same autosave path as everything else in ev — see schedulePersist().
export function addCustomVenueType(ev, name) {
  const n = name.trim();
  if (!n) return { error: 'Նշեք տեսակի անվանումը։' };
  if (!ev.customVenueTypes.includes(n)) ev.customVenueTypes.push(n);
  return { kind: n };
}
export function saveLocation(ev, id, data) {
  if (!data.name.trim()) return { error: 'Նշեք վայրի անվանումը։' };
  const payload = { kind: data.kind.trim() || 'Վայր', name: data.name.trim(), address: data.address.trim(), time: data.time };
  if (id) Object.assign(ev.locations.find(x => x.id === id), payload);
  else ev.locations.push({ id: nid('l'), ...payload });
  ev.locations.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  return {};
}
export function deleteLocation(ev, id) { ev.locations = ev.locations.filter(x => x.id !== id); }

export function saveScheduleItem(ev, id, data) {
  if (!data.time || !data.title.trim()) return { error: 'Նշեք ժամը և անվանումը։' };
  const payload = { time: data.time, title: data.title.trim(), place: data.place.trim() };
  if (id) Object.assign(ev.schedule.find(x => x.id === id), payload);
  else ev.schedule.push({ id: nid('x'), ...payload });
  return {};
}
export function deleteScheduleItem(ev, id) { ev.schedule = ev.schedule.filter(x => x.id !== id); }

export function saveMilestone(ev, id, data) {
  if (!data.title.trim() || !data.date) return { error: 'Նշեք անվանումը և ամսաթիվը։' };
  const payload = { title: data.title.trim(), date: fromISO(data.date), note: data.note.trim() };
  if (id) Object.assign(ev.milestones.find(x => x.id === id), payload);
  else ev.milestones.push({ id: nid('x'), done: false, main: false, ...payload });
  return {};
}
export function deleteMilestone(ev, id) { ev.milestones = ev.milestones.filter(x => x.id !== id); }
export function toggleMilestone(ev, id) {
  const m = ev.milestones.find(x => x.id === id);
  if (m.main) return { goDetails: true };
  m.done = !m.done;
  return { milestone: m };
}

/* ---------- Invitation ---------- */
export function publishInvitation(ev) {
  ev.inv.status = 'published';
  ev.inv.published = ev.inv.published || new Date();
  logActivity(ev, 'Հրապարակվեց հրավիրատոմսը', 'page:invitation', 'var(--sage)');
}
export function unpublishInvitation(ev) { ev.inv.status = 'draft'; }
export function saveInvitationSettings(ev, data) {
  ev.inv.message = data.message.trim() || ev.inv.message;
  if (data.deadline) ev.inv.deadline = fromISO(data.deadline);
  ev.info.maxPlus = +data.maxPlus;
  ev.inv.langs = data.langs.length ? data.langs : ['hy'];
  ev.inv.rsvp = data.rsvp;
}
// The event's chosen invitation design (an id from site/designCatalog.js).
// Only the choice changes — every other event detail, and any content
// already customized for other designs, is left exactly as it was.
export function selectInvitationDesign(ev, design) {
  if (ev.inv.design === design.id) return;
  ev.inv.design = design.id;
  logActivity(ev, <>Ընտրվեց հրավիրատոմսի դիզայն <b>{design.code}</b></>, 'page:invitation', 'var(--champagne)');
}
// Per-design customized content, keyed by design slug, holding only the
// user's own edits (see shared/pathUtils.js diffData) — so switching designs
// back and forth never loses what was customized for each one.
export function saveDesignContent(ev, slug, edits) {
  const all = { ...(ev.inv.designContent || {}) };
  if (edits === undefined) delete all[slug];
  else all[slug] = edits;
  ev.inv.designContent = all;
}
// RSVP rules that live on the event (not in a design's texts): the answer
// deadline and how many companions one guest may bring. Saved on change.
export function saveRsvpSettings(ev, { deadline, maxPlus }) {
  if (deadline) ev.inv.deadline = fromISO(deadline);
  if (maxPlus != null) ev.info.maxPlus = +maxPlus;
}
export function submitPublicRsvp(ev, { name, status, plus, note }) {
  let g = ev.guests.find(x => fullName(x).toLowerCase() === name.toLowerCase());
  const isNew = !g;
  if (!g) {
    const [first, ...rest] = name.split(/\s+/);
    g = { id: nid('g'), first, last: rest.join(' '), gender: F_NAMES.includes(first) ? 'f' : M_NAMES.includes(first) ? 'm' : 'n', group: (ev.groups.find(x => /^Այլ/.test(x.name)) || ev.groups[ev.groups.length - 1])?.id ?? null, family: '', phone: '', email: '', side: null, channel: 'whatsapp', rsvp: 'pending', att: 'unknown', companions: 0, notes: '', at: null, reminded: null, inviteToken: genInviteToken(), inviteStatus: 'draft', inviteSentAt: null, inviteOpenedAt: null };
    ev.guests.unshift(g);
  }
  g.companions = status === 'confirmed' ? plus : 0;
  if (note.trim()) g.notes = note.trim();
  setRsvp(ev, g, status);
  if (g.rsvp === status && !g.at) g.at = nowX();
  return { guest: g, isNew };
}

/* ---------- Event type & details ---------- */
// Assigns the event's category. Group presets are only auto-populated the
// first time (an event that already has guests/groups keeps them even if
// the type changes later) — see "allow users to change the event type".
export function setEventType(ev, type) {
  ev.type = type;
  if (!ev.groups.length) ev.groups = mkGroups(type);
}

// Which identity fields apply is driven entirely by the event's type (see
// TYPES[*].identity in constants.js), not by couple/org mode — a wedding
// is a "pair" identity whether a couple or an organizer is managing it.
export function saveDetails(ev, mode, form) {
  if (!form.date) return { error: 'Նշեք ամսաթիվը' };
  const kind = TYPES[ev.type]?.identity || 'none';
  if (kind === 'pair') {
    if (!form.p1First?.trim() || !form.p2First?.trim()) return { error: 'Նշեք երկու անունները' };
    ev.person1 = { first: form.p1First.trim(), last: (form.p1Last || '').trim() };
    ev.person2 = { first: form.p2First.trim(), last: (form.p2Last || '').trim() };
    ev.title = `${ev.person1.first} & ${ev.person2.first}`;
  } else if (kind === 'child-parents') {
    if (!form.childFirst?.trim()) return { error: 'Նշեք երեխայի անունը' };
    ev.child = { first: form.childFirst.trim(), last: (form.childLast || '').trim() };
    ev.parents = { mother: (form.motherName || '').trim(), father: (form.fatherName || '').trim() };
    ev.title = `${ev.child.first} ${ev.child.last}`.trim();
  } else if (kind === 'celebrant') {
    if (!form.celebrantFirst?.trim()) return { error: 'Նշեք անունը' };
    ev.celebrant = { first: form.celebrantFirst.trim(), last: (form.celebrantLast || '').trim(), age: form.celebrantAge ? +form.celebrantAge : null };
    ev.title = `${ev.celebrant.first} ${ev.celebrant.last}`.trim();
  } else if (kind === 'child') {
    if (!form.childFirst?.trim()) return { error: 'Նշեք երեխայի անունը' };
    ev.child = { first: form.childFirst.trim(), last: (form.childLast || '').trim() };
    ev.title = `${ev.child.first} ${ev.child.last}`.trim();
  } else if (kind === 'company') {
    if (!form.title?.trim()) return { error: 'Նշեք միջոցառման անվանումը' };
    ev.company = (form.company || '').trim(); ev.title = form.title.trim();
  } else {
    if (!form.title?.trim()) return { error: 'Նշեք միջոցառման անվանումը' };
    ev.title = form.title.trim();
  }
  if (mode !== 'couple') {
    ev.client = form.client.trim(); ev.description = form.description.trim();
    ev.organizer = { name: form.oName.trim(), company: form.oCompany.trim(), phone: form.oPhone.trim(), email: form.oEmail.trim() };
  }
  ev.date = fromISO(form.date); ev.time = form.time || ev.time;
  Object.assign(ev.info, { dress: form.dress.trim(), dressColors: form.dressColors?.length ? form.dressColors : ['#6B1D2C'], kids: form.kids.trim(), parking: form.parking.trim(), maxPlus: +form.maxPlus, extra: form.extra.trim() });
  const main = (ev.milestones || []).find(m => m.main); if (main) main.date = ev.date;
  return {};
}

/* ---------- Organizer: events ---------- */
export function createEvent(form, srcEv) {
  const t = form.title.trim();
  if (!form.type) return { error: 'Ընտրեք միջոցառման տեսակը։' };
  if (!t) return { error: 'Նշեք անվանումը։' };
  if (!form.date) return { error: 'Նշեք ամսաթիվը։' };
  const id = nid('E'), parts = t.split(' & ');
  const e = {
    id, owner: 'org', type: form.type, title: t, client: form.client.trim(), date: fromISO(form.date), time: form.time || '18:00', description: form.description.trim(),
    locations: form.venue.trim() ? [{ id: nid('l'), kind: 'Վայր', name: form.venue.trim(), address: '', time: form.time }] : [],
    schedule: srcEv ? srcEv.schedule.map(x => ({ ...x, id: nid('x') })) : [],
    info: srcEv ? { ...srcEv.info } : { dress: '', dressColors: ['#6B1D2C'], kids: '', parking: '', maxPlus: 2, extra: '' },
    customVenueTypes: srcEv ? [...srcEv.customVenueTypes] : [],
    organizer: { ...SETTINGS.org.profile }, milestones: [], groups: [], guests: [],
    inv: { slug: `event-${id}`, status: 'draft', published: null, views: 0, deadline: addDays(fromISO(form.date), -10), message: 'Սիրով հրավիրում ենք Ձեզ։', langs: ['hy'], rsvp: true, personalize: true, greeting: 'Սիրով հրավիրում ենք Ձեզ, {name}, մեր հատուկ օրը միասին նշելու' },
  };
  if (TYPES[e.type]?.identity === 'pair' && parts.length === 2) { e.person1 = { first: parts[0].trim(), last: '' }; e.person2 = { first: parts[1].trim(), last: '' }; }
  // Duplicated guests are new invite records: fresh token/status, not the
  // source event's (a guest's link must stay unique to one event+guest).
  if (srcEv) { e.groups = srcEv.groups.map(g => ({ ...g })); e.guests = srcEv.guests.map(g => ({ ...g, id: nid('g'), rsvp: 'pending', att: 'unknown', at: null, reminded: null, inviteToken: genInviteToken(), inviteStatus: 'draft', inviteSentAt: null, inviteOpenedAt: null })); }
  else e.groups = mkGroups(e.type);
  EVENTS.push(e);
  logActivity(e, <>Ստեղծվեց միջոցառում <b>{t}</b></>, `event:${id}`, 'var(--amber)');
  // Don't wait for the next incidental bump() to persist this — bump()'s
  // ctx() still resolves to the previously-active event at this exact
  // point (setOrgEvent(e.id) hasn't re-rendered yet), so a brand-new event
  // could otherwise go unsaved if the user navigates away immediately.
  persistNow(e);
  return { event: e };
}
export function deleteEvent(ev) { const i = EVENTS.indexOf(ev); if (i >= 0) EVENTS.splice(i, 1); deleteRemote(ev.id); }

/* ---------- Invitation delivery ----------
   No channel here has a real backend/API integration — no server, no
   credentials, nothing to call (see CHANNELS in constants.js, all
   `auto: false`). "Sending" means handing the organizer a working,
   prefilled deep link (or a copy-ready message for Viber, which has no
   public web deep-link for messaging an arbitrary number) and letting
   them take the manual action themselves — we only ever record what we
   can honestly know: whether the guest has the contact detail their
   channel needs, and whether the organizer told us they went through
   with sending it. Nothing here is ever marked "sent" on its own. */
export function queueInvites(ev, guestIds) {
  const result = { manual: 0, failed: 0 };
  guestIds.forEach(id => {
    const g = ev.guests.find(x => x.id === id);
    if (!g || g.inviteStatus === 'sent') return; // already handled — don't un-send it
    const contact = g[CHANNELS[g.channel].contact];
    if (!contact) { g.inviteStatus = 'failed'; result.failed++; }
    else { g.inviteStatus = 'manual'; result.manual++; }
  });
  return result;
}
export function markInviteSent(ev, g) {
  g.inviteStatus = 'sent'; g.inviteSentAt = nowX();
  logActivity(ev, <>Հրավերն ուղարկվեց <b>{fullName(g)}</b>-ին · {CHANNELS[g.channel].l}</>, `guest:${ev.id}:${g.id}`, 'var(--sage)');
}
export function markInviteOpened(g) {
  if (!g.inviteOpenedAt) g.inviteOpenedAt = nowX();
}
export function savePersonalization(ev, { personalize, greeting }) {
  ev.inv.personalize = personalize;
  if (greeting.trim()) ev.inv.greeting = greeting.trim();
}

/* ---------- Settings ---------- */
export function saveProfile(mode, form) {
  const P = mode === 'couple' ? SETTINGS.couple.profile : SETTINGS.org.profile;
  Object.keys(P).forEach(k => { if (form[k] !== undefined) P[k] = form[k].trim(); });
  persistProfile(P);
}
export async function saveAccountSecurity(form) {
  if (form.pw1 || form.pw2 || form.cur) {
    if (!form.cur) return { error: 'Նշեք ընթացիկ գաղտնաբառը։' };
    if (form.pw1.length < 8) return { error: 'Նոր գաղտնաբառը պետք է լինի առնվազն 8 նիշ։' };
    if (form.pw1 !== form.pw2) return { error: 'Գաղտնաբառերը չեն համընկնում։' };
    if (isSupabaseConfigured) {
      const { error: err } = await supabase.auth.updateUser({ password: form.pw1 });
      if (err) return { error: err.message };
    }
  }
  // Real two-factor auth (SMS verification) needs phone-provider setup in
  // Supabase Auth beyond this pass's scope — the toggle stays UI-only.
  SETTINGS.account.twofa = form.twofa;
  return {};
}
export function saveLang(form) {
  SETTINGS.lang.ui = form.ui; SETTINGS.lang.inv = form.inv; SETTINGS.lang.dateFmt = form.dateFmt;
  return { changedUi: form.ui !== 'hy' };
}
export function saveNotif(form) { Object.keys(SETTINGS.notif).forEach(k => { if (form[k] !== undefined) SETTINGS.notif[k] = form[k]; }); }
