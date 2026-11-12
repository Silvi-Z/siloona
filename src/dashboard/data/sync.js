// Persists events to Supabase whenever the dashboard's existing bump()
// signal fires — see state/DashboardContext.jsx. Deliberately NOT a full
// rewrite of actions.jsx into async calls: every mutation already ends in
// bump() today, so hooking there gives real persistence with no change to
// the ~30 existing mutation functions or the pages that call them. Writes
// are debounced and skipped when nothing actually changed since the last
// save (so, e.g., opening a menu — which also calls bump() — doesn't hit
// the network).
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { toISO } from '../utils/format';

let ownerId = null;
const timers = new Map(); // event id -> pending debounce timer, so editing event A then B within the debounce window can't cancel A's pending save
const lastSaved = new Map(); // event id -> last-persisted JSON, to skip no-op writes

export function setSyncOwner(id) { ownerId = id; }

function snapshot(ev) {
  const { id, owner, type, title, date, ...rest } = ev;
  return { id, owner, type, title, date, rest, serialized: JSON.stringify(rest) };
}

// Called right after a fresh fetch so the first bump() after loading
// doesn't immediately re-save the data that was just read.
export function markSaved(ev) {
  const { id, serialized } = snapshot(ev);
  lastSaved.set(id, serialized);
}

export function schedulePersist(ev) {
  if (!isSupabaseConfigured || !ownerId || !ev?.id) return;
  clearTimeout(timers.get(ev.id));
  timers.set(ev.id, setTimeout(() => persistNow(ev), 800));
}

export async function persistNow(ev) {
  if (!isSupabaseConfigured || !ownerId || !ev?.id) return;
  const { id, owner, type, title, date, rest, serialized } = snapshot(ev);
  if (lastSaved.get(id) === serialized) return;
  const { error } = await supabase.from('events').upsert({
    id, owner_id: ownerId, owner_mode: owner, type, title,
    event_date: date ? toISO(date) : null, data: rest,
  });
  if (!error) lastSaved.set(id, serialized);
  else console.error('Siloona: failed to save event', error);
}

export async function deleteRemote(eventId) {
  lastSaved.delete(eventId);
  if (!isSupabaseConfigured || !ownerId) return;
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) console.error('Siloona: failed to delete event', error);
}

export async function persistProfile(data) {
  if (!isSupabaseConfigured || !ownerId) return;
  const { error } = await supabase.from('profiles').update({ data }).eq('id', ownerId);
  if (error) console.error('Siloona: failed to save profile', error);
}
