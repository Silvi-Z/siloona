import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Lets the marketing site (a separate React app from the dashboard, see
// main.jsx) know whether the visitor is already signed in, so nav links
// can point at the dashboard instead of the sign-in stub.
export function useSession() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  return session;
}
