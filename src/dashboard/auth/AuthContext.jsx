import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { EVENTS } from '../data/mockEvents';
import { SETTINGS } from '../data/mockMeta';
import { setSyncOwner, markSaved } from '../data/sync';
import { syncReplies } from '../data/replies';
import { loadLinks } from '../data/orderLinks';
import { fromISO, addDays } from '../utils/format';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

// Rebuilds one dashboard-shaped event object from a Supabase row. The
// dashboard's existing code (selectors, actions, every page) all work on
// plain objects shaped like mockEvents.js's addEvent() and assume
// ev.guests/groups/locations/etc. are always arrays/objects, never
// missing — a brand-new row (the handle_new_user() trigger inserts
// `data: {}`) needs those same defaults backfilled here, or every page
// that reads e.g. ev.guests.length would throw on first load.
// jsonb round-trips Date values as ISO strings, so every Date-typed field
// nested inside row.data needs reviving back into a real Date — pages like
// EventDashboard/Rsvp/Guests call .getDate()/dayDiff()/arithmetic on these
// unconditionally and would throw on the raw string.
const reviveDate = v => v ? new Date(v) : v;

function reviveEventDates(ev) {
  ev.inv.deadline = reviveDate(ev.inv.deadline);
  ev.inv.published = reviveDate(ev.inv.published);
  ev.milestones.forEach(m => { m.date = reviveDate(m.date); });
  ev.guests.forEach(g => { g.at = reviveDate(g.at); g.reminded = reviveDate(g.reminded); g.inviteSentAt = reviveDate(g.inviteSentAt); g.inviteOpenedAt = reviveDate(g.inviteOpenedAt); });
  return ev;
}

function rowToEvent(row) {
  const date = row.event_date ? fromISO(row.event_date) : (row.data.date ? new Date(row.data.date) : addDays(new Date(), 60));
  const defaults = {
    guests: [], groups: [], locations: [], schedule: [], milestones: [], customVenueTypes: [],
    description: '', client: '',
    info: { dress: '', dressColors: ['#6B1D2C'], kids: '', parking: '', maxPlus: 2, extra: '' },
    // deadline must be a real Date, never null — several pages compute
    // dayDiff(ev.inv.deadline, TODAY) unconditionally (not just once
    // published), same invariant mockEvents.js's seed data always upheld.
    inv: {
      slug: row.id, status: 'draft', published: null, deadline: addDays(date, -14), message: '',
      langs: ['hy'], rsvp: true, views: 0, personalize: true,
      greeting: 'Սիրով հրավիրում ենք Ձեզ, {name}, մեր հատուկ օրը միասին նշելու',
    },
  };
  return reviveEventDates({
    ...defaults, ...row.data,
    id: row.id, owner: row.owner_mode, type: row.type, title: row.title, date,
  });
}

async function loadEvents(userId) {
  const { data, error } = await supabase.from('events').select('*').eq('owner_id', userId);
  if (error) throw error;
  EVENTS.length = 0;
  (data || []).forEach(row => { const ev = rowToEvent(row); EVENTS.push(ev); markSaved(ev); });
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(isSupabaseConfigured ? 'loading' : 'unconfigured'); // loading | signed-out | ready | error
  const [error, setError] = useState('');
  // Siloona staff (rows in admin_users, see supabase/payments.sql) also get
  // the Orders page. Purely a UI switch — the data itself is protected by
  // RLS and by the server checking admin_users on every admin action.
  const [isAdmin, setIsAdmin] = useState(false);

  // Which user's data is currently loaded (or loading). Supabase reports the
  // same session more than once — getSession() plus the INITIAL_SESSION
  // event on load, then TOKEN_REFRESHED every hour — and each reload
  // replaces every object in EVENTS. Pages that already rendered keep the
  // old objects, so the next edit would mutate a stale copy and be lost
  // (and any not-yet-saved change would be discarded). Load once per user.
  const loadedFor = useRef(null);

  const bootstrap = useCallback(async (sess) => {
    if (!sess) { loadedFor.current = null; setSyncOwner(null); EVENTS.length = 0; setStatus('signed-out'); return; }
    if (loadedFor.current === sess.user.id) return;
    loadedFor.current = sess.user.id;
    try {
      const { data: prof, error: pErr } = await supabase.from('profiles').select('*').eq('id', sess.user.id).maybeSingle();
      if (pErr) throw pErr;
      if (!prof) {
        // The handle_new_user() trigger (see supabase/schema.sql) creates
        // this row synchronously on sign-up; a brief gap can still show up
        // right after signUp() resolves — one retry covers it.
        await new Promise(r => setTimeout(r, 600));
        const retry = await supabase.from('profiles').select('*').eq('id', sess.user.id).maybeSingle();
        if (retry.error || !retry.data) throw retry.error || new Error('Պրոֆիլը դեռ չի ստեղծվել։ Թարմացրեք էջը։');
        applyProfile(retry.data);
      } else {
        applyProfile(prof);
      }
      setSyncOwner(sess.user.id);
      await loadEvents(sess.user.id);
      // which events have a paid order behind them (only those open to guests)
      await loadLinks(sess.user.id);
      // Guests' answers from their invitation links since the last visit.
      await syncReplies();
      // A missing admin_users table (payments.sql not run yet) just means no admins.
      const adm = await supabase.from('admin_users').select('user_id').eq('user_id', sess.user.id).maybeSingle();
      setIsAdmin(!adm.error && !!adm.data);
      setStatus('ready');
    } catch (e) {
      loadedFor.current = null;
      setError(e.message || String(e));
      setStatus('error');
    }
  }, []);

  function applyProfile(prof) {
    setProfile(prof);
    const bucket = prof.mode === 'couple' ? SETTINGS.couple.profile : SETTINGS.org.profile;
    Object.assign(bucket, prof.data);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); bootstrap(data.session); });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (_event === 'SIGNED_OUT') { loadedFor.current = null; setProfile(null); setIsAdmin(false); setSyncOwner(null); EVENTS.length = 0; setStatus('signed-out'); }
      else bootstrap(sess);
    });
    return () => sub.subscription.unsubscribe();
  }, [bootstrap]);

  const signUp = async ({ email, password, mode, profileData }) => {
    const { data, error: err } = await supabase.auth.signUp({ email, password, options: { data: { mode, profile: { ...profileData, email } } } });
    if (err) return { error: err.message };
    // If the project has email confirmation off, signUp() already returns
    // an active session and onAuthStateChange is about to load the real
    // dashboard — no "check your email" step needed in that case.
    return { needsConfirmation: !data.session };
  };

  const logIn = async ({ email, password }) => {
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) return { error: err.message };
    return {};
  };

  const logOut = () => supabase.auth.signOut();

  const value = { isSupabaseConfigured, session, profile, isAdmin, status, error, signUp, logIn, logOut };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
