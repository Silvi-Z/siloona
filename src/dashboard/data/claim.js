// Bringing a paid order into the customer's dashboard.
//
// The order page links to /dashboard?claim=<order id>&t=<order token>.
// The pair is kept on this device (the customer may first have to create
// an account and confirm their email) and used once they are signed in:
//   1. the server checks the order (paid, theirs to claim) and returns its
//      details — names, date, venue, the design and their edits;
//   2. their event is filled with those (the couple's own event, or a new
//      one for an organizer account) and saved;
//   3. the server links the order to that event. From then on the event's
//      guest links open, and the order's own /i/<code> link shows it too.
import { supabase } from '../../lib/supabaseClient';
import { findDesign } from '../../site/designCatalog';
import { defaultsFor } from '../../site/invitationDefaults';
import { contentFromDetails } from '../../site/invitationDetails';
import { eventFromCustomization, prefillFromCustomization } from '../../site/invitationPrefill';
import { deepMerge } from '../../site/invitations/shared/pathUtils';
import { TYPES } from './constants';
import { saveDesignEdit } from './designPrefill';
import { LINKS } from './orderLinks';
import { persistNow } from './sync';
import * as actions from './actions';
import { toISO } from '../utils/format';

const KEY = 'siloona.claim';

// /dashboard?claim=…&t=… → kept, and the address bar cleaned.
export function stashClaimFromUrl() {
  const q = new URLSearchParams(window.location.search);
  const id = q.get('claim');
  const t = q.get('t');
  if (!id || !t) return;
  try { localStorage.setItem(KEY, JSON.stringify({ id, t })); } catch { /* private mode: lost on reload */ }
  window.history.replaceState(null, '', window.location.pathname + window.location.hash);
}

export function pendingClaim() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}
export function dropClaim() {
  try { localStorage.removeItem(KEY); } catch { /* nothing kept */ }
}

async function ask(body) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const r = await fetch('/api/orders/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ action: 'claim', ...body }),
  });
  const json = await r.json().catch(() => null);
  if (!r.ok) {
    const e = new Error(json?.message || 'Չհաջողվեց կապվել սերվերի հետ։ Փորձեք կրկին։');
    e.final = r.status >= 400 && r.status < 500; // the claim itself is refused: don't retry
    throw e;
  }
  return json;
}

// The event takes the order's details — only where it has none of its own
// yet, so a couple who already started keeps what they wrote.
function fillFromOrder(ev, info, design) {
  const c = eventFromCustomization(info.customization || {});
  if (!ev.type) actions.setEventType(ev, design?.eventTypes?.[0] || 'other');
  if (!ev.title?.trim() && c.title) ev.title = c.title;
  const identity = TYPES[ev.type]?.identity;
  const empty = (p) => !p?.first?.trim();
  if (identity === 'pair') {
    if (empty(ev.person1) && c.person1.first) ev.person1 = { ...(ev.person1 || {}), first: c.person1.first, last: ev.person1?.last || '' };
    if (empty(ev.person2) && c.person2.first) ev.person2 = { ...(ev.person2 || {}), first: c.person2.first, last: ev.person2?.last || '' };
  } else if (identity === 'celebrant' && empty(ev.celebrant) && c.celebrant.first) ev.celebrant = { ...(ev.celebrant || {}), first: c.celebrant.first };
  else if ((identity === 'child' || identity === 'child-parents') && empty(ev.child) && c.child.first) ev.child = { ...(ev.child || {}), first: c.child.first };
  else if (identity === 'company' && !ev.company?.trim() && c.company) ev.company = c.company;
  if (c.date) ev.date = c.date;
  if (c.time) ev.time = c.time;
  if (!ev.locations?.length && c.locations.length) {
    ev.locations = c.locations.map((l, i) => ({ id: `l${Date.now().toString(36)}${i}`, kind: 'Վայր', name: l.name, address: '', time: l.time || '' }));
  }

  ev.inv.design = design?.id || info.designId;
  const slug = design?.previewSlug;
  if (slug) {
    // what the order's /i/ page showed: design ← checkout details ← their edits
    const lang = ['ru', 'en'].includes(info.content?.lang) ? info.content.lang : 'hy';
    const filled = info.details ? contentFromDetails(slug, info.details, lang) : prefillFromCustomization(slug, info.customization, lang);
    saveDesignEdit(ev, slug, deepMerge(deepMerge(defaultsFor(slug, lang), filled), info.content));
  }
  // the order's invitation was already public: it stays so, now from here
  if (ev.inv.status !== 'published') { ev.inv.status = 'published'; ev.inv.published = new Date(); }
}

// → { eventId, orderNumber, already }. `couple`: the couple's own event, or
// null for an organizer account (a new event is made).
export async function claimOrder({ id, t }, couple) {
  const info = await ask({ id, t });
  if (info.linked) {
    if (!LINKS.has(info.eventId)) LINKS.set(info.eventId, { orderNumber: info.orderNumber, designId: null, live: true });
    return { eventId: info.eventId, orderNumber: info.orderNumber, already: true };
  }
  const design = findDesign(info.designId);
  let ev = couple;
  if (ev && LINKS.has(ev.id)) {
    const e = new Error('Ձեր միջոցառումն արդեն կապված է մեկ այլ պատվերի հետ։ Գրեք մեզ՝ այս պատվերը ևս ավելացնելու համար։');
    e.final = true;
    throw e;
  }
  if (!ev) {
    const c = eventFromCustomization(info.customization || {});
    const made = actions.createEvent({
      type: design?.eventTypes?.[0] || 'other', title: c.title || `Պատվեր №${info.orderNumber}`,
      date: c.date ? toISO(c.date) : toISO(new Date(Date.now() + 60 * 86400000)), time: c.time || '', venue: '', client: '', description: '',
    });
    if (made.error) throw new Error(made.error);
    ev = made.event;
  }
  fillFromOrder(ev, info, design);
  await persistNow(ev);
  const done = await ask({ id, t, eventId: ev.id });
  LINKS.set(ev.id, { orderNumber: done.orderNumber, designId: info.designId, live: true });
  return { eventId: ev.id, orderNumber: done.orderNumber, already: false };
}
