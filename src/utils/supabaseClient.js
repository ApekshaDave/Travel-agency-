import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verify if credentials are valid and not placeholders
const isConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url' &&
  supabaseUrl.startsWith('http')
)

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
export const hasSupabase = isConfigured
