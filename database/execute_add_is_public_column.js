const { createClient } = require('@supabase/supabase-js')

// Carica le variabili d'ambiente
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addIsPublicColumn() {
  try {
    console.log('🔄 Aggiunta colonna is_public...')
    
    // Usa una query SQL diretta tramite l'API REST di Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: 'ALTER TABLE xbank_prediction_groups ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;'
      })
    })
    
    console.log('📝 Istruzioni per aggiungere la colonna manualmente:')
    console.log('1. Vai su https://supabase.com/dashboard')
    console.log('2. Seleziona il tuo progetto')
    console.log('3. Vai su SQL Editor')
    console.log('4. Esegui questa query:')
    console.log('   ALTER TABLE xbank_prediction_groups ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;')
    console.log('\n✅ Dopo aver eseguito la query, riabilita il codice is_public nell\'API')
    
  } catch (error) {
    console.error('❌ Errore:', error.message)
  }
}

addIsPublicColumn()