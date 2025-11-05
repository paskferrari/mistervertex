const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addSettledAtColumn() {
  try {
    console.log('🔄 Aggiunta colonna settled_at...')

    // Istruzioni per esecuzione manuale (consigliata)
    console.log('📝 Istruzioni per aggiungere la colonna manualmente:')
    console.log('1. Vai su https://supabase.com/dashboard')
    console.log('2. Seleziona il tuo progetto')
    console.log('3. Vai su SQL Editor')
    console.log('4. Esegui questa query:')
    console.log('   ALTER TABLE xbank_custom_predictions ADD COLUMN IF NOT EXISTS settled_at TIMESTAMP WITH TIME ZONE;')
    console.log('   COMMENT ON COLUMN xbank_custom_predictions.settled_at IS \"Data/ora di chiusura del pronostico (won/lost/void/cashout)\";')

  } catch (error) {
    console.error('❌ Errore:', error.message)
  }
}

addSettledAtColumn()