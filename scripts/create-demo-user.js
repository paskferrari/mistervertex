#!/usr/bin/env node

/**
 * Script per creare un utente demo in Supabase Auth e nella tabella `users`
 * Usa la service role key, quindi va eseguito solo in ambiente sicuro (dev/local).
 *
 * Utilizzo:
 *   node scripts/create-demo-user.js [email] [password] [role]
 * Esempio:
 *   node scripts/create-demo-user.js demo@vertex.com demo123 guest
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const email = process.argv[2] || 'demo@vertex.com'
const password = process.argv[3] || 'demo123'
const role = process.argv[4] || 'guest'

async function main() {
  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Variabili d\'ambiente Supabase mancanti. Verifica .env.local')
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
    console.error('- SUPABASE_SECRET_KEY:', !!process.env.SUPABASE_SECRET_KEY)
    console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    process.exit(1)
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  console.log('🚀 Creazione utente demo:', email, `(role: ${role})`)

  // 1) Crea l'utente in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError) {
    console.error('❌ Errore creazione utente Auth:', authError)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log('✅ Utente Auth creato:', userId)

  // 2) Inserisci l'utente nella tabella `users`
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .insert({ id: userId, email, role })

  if (dbError) {
    console.error('❌ Errore inserimento utente in tabella users:', dbError)
    // rollback: elimina l'utente da Auth se non riusciamo ad inserirlo in `users`
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId)
    } catch (e) {
      console.error('⚠️ Errore durante rollback utente Auth:', e)
    }
    process.exit(1)
  }

  console.log('✅ Utente inserito nella tabella users')
  console.log('🎉 Completato. Ora puoi effettuare il login con queste credenziali.')
}

main().catch((err) => {
  console.error('💥 Errore script:', err)
  process.exit(1)
})