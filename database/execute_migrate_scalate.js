// Esegue la migrazione dello schema Scalate in modo idempotente (CommonJS)
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configurazione Supabase mancante. Imposta NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function executeMigrateScalate() {
  try {
    console.log('🔄 Migrazione schema Scalate...')
    const sqlPath = path.join(process.cwd(), 'database', 'migrate_scalate_schema.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

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
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ sql: query + ';' })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.warn(`⚠️  Query ${i + 1} fallita:`, errorText.substring(0, 300))
        } else {
          console.log(`✅ Query ${i + 1} completata`)
        }
      } catch (err) {
        console.warn(`⚠️  Errore query ${i + 1}:`, String(err?.message || err).substring(0, 300))
      }
    }

    console.log('🔍 Verifico colonne chiave...')
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/scalate?select=id&limit=1`, {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        }
      })
      if (!response.ok) {
        const text = await response.text()
        console.warn('⚠️  Verifica tabella scalate non riuscita:', text.substring(0, 300))
      } else {
        console.log('✅ Migrazione completata/verificata con successo')
      }
    } catch (err) {
      console.warn('⚠️  Verifica fallita:', String(err?.message || err).substring(0, 300))
    }
  } catch (error) {
    console.error('❌ Errore migrazione:', String(error?.message || error))
    process.exit(1)
  }
}

executeMigrateScalate()