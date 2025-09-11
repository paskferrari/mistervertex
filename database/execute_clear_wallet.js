// Script Node.js per svuotare la tabella wallet
// Esegui con: node database/execute_clear_wallet.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Errore: Variabili d\'ambiente Supabase mancanti')
  console.log('Assicurati che .env.local contenga:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function clearWalletTable() {
  try {
    console.log('🔍 Controllo record esistenti nella tabella wallet...')
    
    // Conta i record esistenti
    const { count: initialCount, error: countError } = await supabase
      .from('wallet')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Errore nel conteggio iniziale:', countError)
      return
    }

    console.log(`📊 Record trovati: ${initialCount || 0}`)

    if (initialCount === 0) {
      console.log('✅ La tabella wallet è già vuota!')
      return
    }

    console.log('🗑️  Svuotamento della tabella wallet in corso...')
    
    // Svuota la tabella wallet
    const { error: deleteError } = await supabase
      .from('wallet')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Condizione che matcha tutti i record

    if (deleteError) {
      console.error('❌ Errore durante lo svuotamento:', deleteError)
      return
    }

    // Verifica che la tabella sia vuota
    const { count: finalCount, error: finalCountError } = await supabase
      .from('wallet')
      .select('*', { count: 'exact', head: true })

    if (finalCountError) {
      console.error('⚠️  Errore nel conteggio finale:', finalCountError)
    }

    console.log('✅ Operazione completata!')
    console.log(`📊 Record eliminati: ${initialCount || 0}`)
    console.log(`📊 Record rimanenti: ${finalCount || 0}`)
    
    if (finalCount === 0) {
      console.log('🎉 La tabella wallet è stata svuotata con successo!')
    } else {
      console.log('⚠️  Attenzione: alcuni record potrebbero non essere stati eliminati')
    }

  } catch (error) {
    console.error('❌ Errore durante l\'operazione:', error)
  }
}

// Esegui lo script
clearWalletTable()
  .then(() => {
    console.log('🏁 Script terminato')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Errore fatale:', error)
    process.exit(1)
  })