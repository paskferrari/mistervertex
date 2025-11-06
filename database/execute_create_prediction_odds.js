const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Carica le variabili d'ambiente
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeCreatePredictionOdds() {
  try {
    console.log('🔄 Creazione tabella xbank_prediction_odds...')
    const sqlPath = path.join(__dirname, 'create_xbank_prediction_odds.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // Suddividi in query singole per esecuzione sequenziale
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'))

    console.log(`📝 Trovate ${queries.length} query da eseguire...`)

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i]
      if (!query) continue
      console.log(`⏳ Esecuzione query ${i + 1}/${queries.length}...`)
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
          },
          body: JSON.stringify({ sql: query + ';' })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.warn(`⚠️  Query ${i + 1} fallita:`, errorText.substring(0, 200))
        } else {
          console.log(`✅ Query ${i + 1} completata`)
        }
      } catch (err) {
        console.warn(`⚠️  Errore query ${i + 1}:`, err.message.substring(0, 200))
      }
    }

    console.log('🔍 Verifico la tabella xbank_prediction_odds...')
    const { data, error } = await supabase
      .from('xbank_prediction_odds')
      .select('id, prediction_id, odds')
      .limit(1)

    if (error) {
      console.error('❌ Verifica fallita:', error)
      process.exit(1)
    }

    console.log('✅ Tabella xbank_prediction_odds creata/verificata con successo!')
  } catch (error) {
    console.error('❌ Errore:', error.message)
    process.exit(1)
  }
}

executeCreatePredictionOdds()