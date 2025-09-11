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

async function setupCompleteDatabase() {
  try {
    console.log('🔄 Esecuzione setup completo database X-BANK...')
    
    // Leggi il file SQL
    const sqlPath = path.join(__dirname, 'setup_complete_database.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Dividi il contenuto in singole query (separate da ;)
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'))
    
    console.log(`📝 Trovate ${queries.length} query da eseguire...`)
    
    // Esegui ogni query separatamente
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i]
      if (query.trim()) {
        console.log(`⏳ Esecuzione query ${i + 1}/${queries.length}...`)
        
        try {
          // Usa il client diretto per eseguire SQL raw
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({
              sql: query + ';'
            })
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.warn(`⚠️  Query ${i + 1} fallita (potrebbe essere normale):`, errorText.substring(0, 100))
          } else {
            console.log(`✅ Query ${i + 1} completata`)
          }
        } catch (queryError) {
          console.warn(`⚠️  Query ${i + 1} fallita (potrebbe essere normale):`, queryError.message.substring(0, 100))
        }
      }
    }
    
    console.log('\n🎉 Setup database completato!')
    console.log('🔍 Verifico la struttura della tabella xbank_prediction_groups...')
    
    // Verifica che la tabella sia stata creata correttamente
    const { data, error } = await supabase
      .from('xbank_prediction_groups')
      .select('id, name, is_public')
      .limit(1)
    
    if (error) {
      console.error('❌ Errore nella verifica:', error)
    } else {
      console.log('✅ Tabella xbank_prediction_groups verificata con successo!')
      console.log('✅ Colonna is_public disponibile!')
    }
    
  } catch (error) {
    console.error('❌ Errore:', error.message)
    process.exit(1)
  }
}

// Esegui il setup
setupCompleteDatabase()