// Guests' answers from their invitation links, folded into the events'
// guest lists. Guests never write to `events` (that's the owner's private
// document): the server stores what they do in `event_replies`
// (supabase/guest-links.sql), and this reads those rows — on load and
// then every minute — and applies them like the organizer would by hand:
//   open   the guest opened their link → inviteOpenedAt, the views count
//   rsvp   their answer → rsvp status, companions, note, answer time;
//          an answer through the general link finds the guest by name,
//          or adds them (submitPublicRsvp, same as the preview's form)
// Each event remembers the last reply it has taken in (inv.lastReply), so
// nothing is applied twice, across sessions too. The changed events are
// saved through the usual debounced sync.
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { EVENTS } from './mockEvents';
import { schedulePersist } from './sync';
import { submitPublicRsvp } from './actions';
import { logActivity } from './mockMeta';

function applyReply(ev, r) {
  const at = new Date(r.created_at);
  const guest = r.guest_token ? ev.guests.find(g => g.inviteToken === r.guest_token) : null;
  if (r.kind === 'open') {
    ev.inv.views = (ev.inv.views || 0) + 1;
    if (guest && !guest.inviteOpenedAt) guest.inviteOpenedAt = at;
    return;
  }
  // rsvp
  let g = guest;
  if (g) {
    g.rsvp = r.status;
    g.companions = r.status === 'confirmed' ? r.plus || 0 : 0;
    if (r.note) g.notes = g.notes ? `${g.notes} · ${r.note}` : r.note;
  } else {
    g = submitPublicRsvp(ev, { name: r.guest_name, status: r.status, plus: r.plus || 0, note: r.note || '' }).guest;
  }
  g.at = at;
  if (!g.inviteOpenedAt) g.inviteOpenedAt = at;
  logActivity(ev, `${r.guest_name} — ${r.status === 'confirmed' ? 'կգա' : 'չի գա'} (հրավերի հղումով)`, 'page:rsvp', r.status === 'confirmed' ? 'var(--sage)' : 'var(--rose)');
}

// Applies reply rows (in id order) to the loaded events, skipping the ones
// an event has already taken in. Returns the changed events and the count.
export function mergeReplies(rows) {
  const changed = new Set();
  let n = 0;
  for (const r of rows) {
    const ev = EVENTS.find(e => e.id === r.event_id);
    if (!ev || r.id <= (ev.inv.lastReply || 0)) continue;
    applyReply(ev, r);
    ev.inv.lastReply = r.id;
    changed.add(ev);
    n++;
  }
  return { changed, n };
}

let running = null;

// Returns how many replies were applied (0 when nothing new).
export function syncReplies() {
  if (!isSupabaseConfigured || !EVENTS.length) return Promise.resolve(0);
  if (running) return running;
  running = (async () => {
    const since = Math.min(...EVENTS.map(e => e.inv?.lastReply || 0));
    const { data, error } = await supabase
      .from('event_replies')
      .select('id, event_id, guest_token, kind, guest_name, status, plus, note, created_at')
      .in('event_id', EVENTS.map(e => e.id))
      .gt('id', since)
      .order('id')
      .limit(2000);
    if (error) {
      // e.g. supabase/guest-links.sql not run yet — the dashboard works as before
      if (!/event_replies/.test(error.message || '')) console.error('Siloona: replies not loaded', error);
      return 0;
    }
    const { changed, n } = mergeReplies(data || []);
    changed.forEach(schedulePersist);
    return n;
  })().finally(() => { running = null; });
  return running;
}
