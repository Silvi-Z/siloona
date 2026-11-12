import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// `isSupabaseConfigured` lets the app tell "backend not set up yet" apart
// from "backend is down" — the former gets clear setup instructions
// instead of a broken screen or (worse) a silent fake-data fallback.
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;
