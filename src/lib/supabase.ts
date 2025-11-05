import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Client per il browser (disabilita auto refresh dei token in dev)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Client per il server (con service role key)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Funzione per verificare se Supabase è configurato correttamente
export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl !== 'your-supabase-url' && 
         supabaseAnonKey !== 'your-supabase-anon-key' &&
         supabaseUrl.startsWith('http')
}

// Client Supabase con gestione errori migliorata
export const safeSupabaseAuth = {
  signOut: async () => {
    if (!isSupabaseConfigured()) {
      // Se Supabase non è configurato, simula un logout locale
      return { error: null }
    }
    try {
      return await supabase.auth.signOut()
    } catch (error) {
      console.warn('Errore durante il logout:', error)
      return { error: null } // Ignora errori di rete durante il logout
    }
  },
  
  signInWithPassword: async (credentials: { email: string; password: string }) => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Supabase non configurato' } }
    }
    return await supabase.auth.signInWithPassword(credentials)
  },
  
  getUser: async () => {
    if (!isSupabaseConfigured()) {
      return { data: { user: null }, error: null }
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session
      if (!session) {
        // Evita di innescare un refresh token quando la sessione è assente/invalidata
        return { data: { user: null }, error: null }
      }
      return await supabase.auth.getUser()
    } catch (error) {
      console.warn('Errore durante getUser:', error)
      return { data: { user: null }, error: null }
    }
  }
}

// Tipi per il database
export interface EmailRequest {
  id: string
  email: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'guest' | 'abbonato_base' | 'abbonato_premium' | 'abbonato_vip'
  created_at: string
  approved_by?: string
  subscription_level?: number
}

export interface AdminUser {
  id: string
  email: string
  password_hash: string
  created_at: string
}