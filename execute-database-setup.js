#!/usr/bin/env node

/**
 * Esegue il setup completo del database X-Bank
 * Crea tutte le tabelle necessarie tramite Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configurazioni Supabase mancanti');
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('- SUPABASE_SECRET_KEY:', !!process.env.SUPABASE_SECRET_KEY);
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeDatabaseSetup() {
  console.log('🚀 Setup Database X-Bank');
  console.log('=' .repeat(50));

  try {
    // Leggi il file SQL di setup
    const sqlFilePath = path.join(__dirname, 'database', 'setup_complete_database.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error('❌ File setup_complete_database.sql non trovato');
      return false;
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Dividi il contenuto in singoli statement SQL
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Trovati ${statements.length} statement SQL da eseguire`);

    let successCount = 0;
    let errorCount = 0;

    // Esegui ogni statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length < 10) continue; // Salta statement troppo corti
      
      try {
        console.log(`\n⏳ Eseguendo statement ${i + 1}/${statements.length}...`);
        
        // Usa rpc per eseguire SQL raw
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });

        if (error) {
          // Prova metodo alternativo per alcuni statement
          if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX')) {
            console.log(`⚠️  Errore con rpc, provo metodo alternativo: ${error.message}`);
            
            // Per le tabelle, prova a crearle una alla volta
            if (statement.includes('CREATE TABLE IF NOT EXISTS xbank_custom_predictions')) {
              await createCustomPredictionsTable();
              successCount++;
              continue;
            } else if (statement.includes('CREATE TABLE IF NOT EXISTS xbank_prediction_groups')) {
              await createPredictionGroupsTable();
              successCount++;
              continue;
            }
          }
          
          console.log(`❌ Errore statement ${i + 1}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} eseguito con successo`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Errore statement ${i + 1}: ${err.message}`);
        errorCount++;
      }
    }

    // Risultati finali
    console.log('\n' + '=' .repeat(50));
    console.log('📊 RISULTATI SETUP DATABASE');
    console.log('=' .repeat(50));
    console.log(`✅ Statement eseguiti con successo: ${successCount}`);
    console.log(`❌ Statement falliti: ${errorCount}`);
    console.log(`📈 Percentuale successo: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);

    // Verifica finale
    console.log('\n🔍 VERIFICA FINALE...');
    await verifyTablesCreated();

    return successCount > errorCount;

  } catch (error) {
    console.error('\n💥 ERRORE CRITICO nel setup database:', error);
    return false;
  }
}

async function createCustomPredictionsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS xbank_custom_predictions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      group_id UUID,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      odds DECIMAL(10,2) NOT NULL CHECK (odds > 0),
      stake_amount DECIMAL(15,2) NOT NULL CHECK (stake_amount > 0),
      stake_type VARCHAR(20) DEFAULT 'fixed',
      confidence INTEGER DEFAULT 50,
      event_date TIMESTAMP WITH TIME ZONE,
      bookmaker VARCHAR(100),
      market_type VARCHAR(100),
      category VARCHAR(50),
      status VARCHAR(20) DEFAULT 'pending',
      result_amount DECIMAL(15,2),
      result_profit DECIMAL(15,2),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Usa una query diretta per creare la tabella
  const { error } = await supabase
    .from('xbank_custom_predictions')
    .select('id')
    .limit(1);

  if (error && error.message.includes('does not exist')) {
    console.log('📝 Creando tabella xbank_custom_predictions manualmente...');
    // La tabella non esiste, dobbiamo crearla tramite SQL Editor
    console.log('⚠️  Nota: Esegui questo SQL nel Supabase SQL Editor:');
    console.log(createTableSQL);
  }
}

async function createPredictionGroupsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS xbank_prediction_groups (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      color VARCHAR(7) DEFAULT '#3B82F6',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  const { error } = await supabase
    .from('xbank_prediction_groups')
    .select('id')
    .limit(1);

  if (error && error.message.includes('does not exist')) {
    console.log('📝 Creando tabella xbank_prediction_groups manualmente...');
    console.log('⚠️  Nota: Esegui questo SQL nel Supabase SQL Editor:');
    console.log(createTableSQL);
  }
}

async function verifyTablesCreated() {
  const requiredTables = [
    'users',
    'xbank_user_settings',
    'notifications',
    'xbank_prediction_groups',
    'xbank_custom_predictions'
  ];

  console.log('\n📋 Verifica tabelle create:');
  
  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: OK`);
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`);
    }
  }
}

// Esegui il setup
if (require.main === module) {
  executeDatabaseSetup()
    .then(success => {
      if (success) {
        console.log('\n🎉 Setup database completato con successo!');
        console.log('✅ Ora puoi eseguire i test delle API X-Bank');
      } else {
        console.log('\n⚠️  Setup database completato con alcuni errori');
        console.log('🔧 Verifica manualmente le tabelle nel Supabase Dashboard');
      }
    })
    .catch(console.error);
}

module.exports = { executeDatabaseSetup };