import { createClient } from '@supabase/supabase-js'

// Sanitize the URL: remove spaces, trailing slashes, and accidental path suffixes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
    .replace(/\/+$/, '')         // Remove trailing slashes
    .replace(/\/auth\/v1$/, '')  // Remove accidental auth suffix
    .replace(/\/rest\/v1$/, '')  // Remove accidental rest suffix

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Supabase environment variables are missing! Please create a .env file at the project root with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)