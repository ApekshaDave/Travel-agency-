import { createClient } from '@supabase/supabase-js'

// Sanitize the URL: remove spaces, trailing slashes, and accidental path suffixes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
    .replace(/\/+$/, '')         // Remove trailing slashes
    .replace(/\/auth\/v1$/, '')  // Remove accidental auth suffix
    .replace(/\/rest\/v1$/, '')  // Remove accidental rest suffix

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey)

if (!hasSupabase) {
    console.warn('Supabase configuration not found. VoyageAI is running in Mock/Offline mode.')
}

export const supabase = hasSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null