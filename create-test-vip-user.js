#!/usr/bin/env node

/**
 * Script per creare un utente VIP di test nel database Supabase
 * Utilizza il service role key per inserire direttamente nel database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configurazioni Supabase mancanti:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
console.error('- SUPABASE_SECRET_KEY:', !!process.env.SUPABASE_SECRET_KEY);
console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Dati dell'utente VIP di test
const VIP_USER = {
  id: '9a1a3cc0-2795-4571-85eb-7e985cc7506a',
  email: 'golo@mistervertex.com',
  role: 'abbonato_vip',
  subscription_level: 3
};

const VIP_SETTINGS = {
  user_id: VIP_USER.id,
  initial_bankroll: 5000.00,
  current_bankroll: 5000.00,
  currency: 'EUR',
  unit_type: 'percentage',
  unit_value: 2.0
};

async function createVIPUser() {
  console.log('🚀 Creazione utente VIP di test...');
  console.log(`📧 Email: ${VIP_USER.email}`);
  console.log(`🆔 ID: ${VIP_USER.id}`);
  console.log('=' .repeat(60));

  try {
    // 1. Inserisci/aggiorna l'utente nella tabella users
    console.log('\n📝 1. Inserimento utente nella tabella users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: VIP_USER.id,
        email: VIP_USER.email,
        role: VIP_USER.role,
        subscription_level: VIP_USER.subscription_level,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select();

    if (userError) {
      console.error('❌ Errore inserimento utente:', userError);
      throw userError;
    }

    console.log('✅ Utente inserito/aggiornato con successo');
    console.log('📋 Dati utente:', userData);

    // 2. Inserisci/aggiorna le impostazioni X-Bank
    console.log('\n📝 2. Inserimento impostazioni X-Bank...');
    const { data: settingsData, error: settingsError } = await supabase
      .from('xbank_user_settings')
      .upsert({
        user_id: VIP_SETTINGS.user_id,
        initial_bankroll: VIP_SETTINGS.initial_bankroll,
        current_bankroll: VIP_SETTINGS.current_bankroll,
        currency: VIP_SETTINGS.currency,
        unit_type: VIP_SETTINGS.unit_type,
        unit_value: VIP_SETTINGS.unit_value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (settingsError) {
      console.error('❌ Errore inserimento impostazioni:', settingsError);
      throw settingsError;
    }

    console.log('✅ Impostazioni X-Bank inserite/aggiornate con successo');
    console.log('📋 Dati impostazioni:', settingsData);

    // 3. Verifica che l'utente sia stato creato correttamente
    console.log('\n🔍 3. Verifica dati inseriti...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        subscription_level,
        created_at,
        updated_at,
        xbank_user_settings (
          initial_bankroll,
          current_bankroll,
          currency,
          unit_type,
          unit_value
        )
      `)
      .eq('id', VIP_USER.id)
      .single();

    if (verifyError) {
      console.error('❌ Errore verifica dati:', verifyError);
      throw verifyError;
    }

    console.log('✅ Verifica completata con successo');
    console.log('📋 Dati completi utente:');
    console.log(JSON.stringify(verifyData, null, 2));

    // 4. Crea un token di test per l'utente (simulato)
    console.log('\n🔑 4. Generazione token di test...');
    
    // Simula la creazione di un utente auth in Supabase
    // NOTA: In produzione, l'utente dovrebbe registrarsi tramite Supabase Auth
    console.log('⚠️  NOTA: Per test completi con autenticazione reale,');
    console.log('   l\'utente dovrebbe registrarsi tramite Supabase Auth.');
    console.log('   Questo script crea solo i dati nel database.');

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 UTENTE VIP CREATO CON SUCCESSO!');
    console.log('=' .repeat(60));
    console.log(`📧 Email: ${VIP_USER.email}`);
    console.log(`🆔 ID: ${VIP_USER.id}`);
    console.log(`👑 Ruolo: ${VIP_USER.role}`);
    console.log(`💰 Bankroll iniziale: €${VIP_SETTINGS.initial_bankroll}`);
    console.log(`💰 Bankroll corrente: €${VIP_SETTINGS.current_bankroll}`);
    console.log('\n✅ L\'utente può ora utilizzare le funzionalità X-Bank');
    console.log('✅ Tutte le API dovrebbero funzionare correttamente');

    return {
      success: true,
      user: verifyData
    };

  } catch (error) {
    console.error('\n💥 ERRORE durante la creazione dell\'utente:');
    console.error(error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Funzione per eliminare l'utente di test (cleanup)
async function deleteVIPUser() {
  console.log('🗑️  Eliminazione utente VIP di test...');
  
  try {
    // Elimina prima le impostazioni X-Bank
    const { error: settingsError } = await supabase
      .from('xbank_user_settings')
      .delete()
      .eq('user_id', VIP_USER.id);

    if (settingsError) {
      console.error('❌ Errore eliminazione impostazioni:', settingsError);
    } else {
      console.log('✅ Impostazioni X-Bank eliminate');
    }

    // Elimina l'utente
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', VIP_USER.id);

    if (userError) {
      console.error('❌ Errore eliminazione utente:', userError);
    } else {
      console.log('✅ Utente eliminato');
    }

    console.log('🎉 Cleanup completato');
    return { success: true };

  } catch (error) {
    console.error('💥 Errore durante il cleanup:', error);
    return { success: false, error: error.message };
  }
}

// Esegui lo script
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'delete') {
    deleteVIPUser().catch(console.error);
  } else {
    createVIPUser().catch(console.error);
  }
}

module.exports = {
  createVIPUser,
  deleteVIPUser,
  VIP_USER,
  VIP_SETTINGS
};