#!/usr/bin/env node

/**
 * Verifica dello schema del database Supabase
 * Controlla quali tabelle esistono e la loro struttura
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configurazioni Supabase mancanti');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseSchema() {
  console.log('🔍 Verifica Schema Database');
  console.log('=' .repeat(50));

  try {
    // 1. Lista tutte le tabelle nel schema public
    console.log('\n📋 1. TABELLE ESISTENTI');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_list');

    if (tablesError) {
      // Metodo alternativo: query diretta al catalogo PostgreSQL
      const { data: tablesAlt, error: tablesAltError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name');

      if (tablesAltError) {
        console.log('⚠️  Non riesco a recuperare la lista delle tabelle');
        console.log('Provo a testare le tabelle X-Bank direttamente...');
      } else {
        console.log('✅ Tabelle trovate:');
        tablesAlt.forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
      }
    } else {
      console.log('✅ Tabelle trovate:', tables);
    }

    // 2. Test specifico per tabelle X-Bank
    console.log('\n📋 2. TEST TABELLE X-BANK');
    
    const xbankTables = [
      'users',
      'xbank_user_settings',
      'custom_predictions',
      'predictions',
      'prediction_groups',
      'prediction_group_items',
      'bankroll_history',
      'user_statistics',
      'user_follows'
    ];

    for (const tableName of xbankTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: OK (${data.length} record trovati)`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }

    // 3. Verifica struttura tabelle principali
    console.log('\n📋 3. STRUTTURA TABELLE PRINCIPALI');

    // Verifica users
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (userData && userData.length > 0) {
        console.log('\n✅ USERS - Colonne disponibili:');
        Object.keys(userData[0]).forEach(col => {
          console.log(`   - ${col}: ${typeof userData[0][col]}`);
        });
      }
    } catch (err) {
      console.log('❌ Errore nel recuperare struttura users:', err.message);
    }

    // Verifica xbank_user_settings
    try {
      const { data: settingsData } = await supabase
        .from('xbank_user_settings')
        .select('*')
        .limit(1);
      
      if (settingsData && settingsData.length > 0) {
        console.log('\n✅ XBANK_USER_SETTINGS - Colonne disponibili:');
        Object.keys(settingsData[0]).forEach(col => {
          console.log(`   - ${col}: ${typeof settingsData[0][col]}`);
        });
      } else {
        console.log('\n⚠️  XBANK_USER_SETTINGS - Nessun record trovato');
      }
    } catch (err) {
      console.log('❌ Errore nel recuperare struttura xbank_user_settings:', err.message);
    }

    // Verifica custom_predictions
    try {
      const { data: predData } = await supabase
        .from('custom_predictions')
        .select('*')
        .limit(1);
      
      if (predData && predData.length > 0) {
        console.log('\n✅ CUSTOM_PREDICTIONS - Colonne disponibili:');
        Object.keys(predData[0]).forEach(col => {
          console.log(`   - ${col}: ${typeof predData[0][col]}`);
        });
      } else {
        console.log('\n⚠️  CUSTOM_PREDICTIONS - Nessun record trovato, ma tabella esiste');
      }
    } catch (err) {
      console.log('❌ Errore nel recuperare struttura custom_predictions:', err.message);
    }

    // 4. Test inserimento dati di prova
    console.log('\n📋 4. TEST INSERIMENTO DATI');

    const VIP_USER_ID = '9a1a3cc0-2795-4571-85eb-7e985cc7506a';

    // Test inserimento custom_prediction
    try {
      const testPrediction = {
        user_id: VIP_USER_ID,
        title: 'Test Prediction Schema',
        description: 'Test per verificare schema',
        event_name: 'Test Event',
        odds: 2.00,
        stake_amount: 50.00,
        confidence: 80,
        match_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        bookmaker: 'Test Bookmaker',
        status: 'pending'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('custom_predictions')
        .insert(testPrediction)
        .select()
        .single();

      if (insertError) {
        console.log(`❌ Insert custom_predictions: ${insertError.message}`);
      } else {
        console.log(`✅ Insert custom_predictions: OK (ID: ${insertData.id})`);
        
        // Cleanup
        await supabase
          .from('custom_predictions')
          .delete()
          .eq('id', insertData.id);
        
        console.log('🧹 Cleanup completato');
      }
    } catch (err) {
      console.log(`❌ Errore test inserimento: ${err.message}`);
    }

    console.log('\n' + '=' .repeat(50));
    console.log('🎯 RIEPILOGO SCHEMA DATABASE');
    console.log('=' .repeat(50));
    console.log('✅ Verifica completata');
    console.log('📝 Usa queste informazioni per aggiornare i test');

  } catch (error) {
    console.error('\n💥 ERRORE CRITICO:', error);
  }
}

// Esegui la verifica
if (require.main === module) {
  checkDatabaseSchema().catch(console.error);
}

module.exports = { checkDatabaseSchema };