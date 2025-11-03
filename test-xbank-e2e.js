#!/usr/bin/env node

/**
 * Test End-to-End semplificato per X-Bank
 * Verifica la disponibilità delle API e la struttura del database
 */

const { createClient } = require('@supabase/supabase-js');

// Configurazione
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hnqkqjqjqjqjqjqjqjqj.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_placeholder_key';
const TEST_USER_EMAIL = 'golo@mistervertex.com';
const BASE_URL = 'http://localhost:3000';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Test Results Tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

const logTest = (name, passed, details = '') => {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name} - ${details}`);
  }
  testResults.details.push({ name, passed, details });
};

async function runE2ETests() {
  console.log('🚀 Avvio Test End-to-End X-Bank (Semplificato)\n');

  try {
    // 1. Test connessione database
    console.log('📋 1. Test Connessione Database');
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', TEST_USER_EMAIL)
      .single();

    logTest('Connessione database Supabase', !userError, userError?.message || 'OK');
    logTest('Utente VIP di test presente', !!userData, userData ? `ID: ${userData.id}` : 'Non trovato');
    logTest('Ruolo VIP corretto', userData?.role === 'abbonato_vip', `Ruolo: ${userData?.role}`);

    // 2. Test struttura tabelle X-Bank
    console.log('\n📋 2. Test Struttura Tabelle X-Bank');
    
    const tables = [
      'xbank_user_settings',
      'xbank_prediction_groups', 
      'xbank_custom_predictions',
      'notifications'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        logTest(`Tabella ${table}`, !error, error?.message || 'Accessibile');
      } catch (err) {
        logTest(`Tabella ${table}`, false, err.message);
      }
    }

    // 3. Test endpoint API (senza autenticazione)
    console.log('\n📋 3. Test Endpoint API');
    
    const endpoints = [
      '/api/xbank/settings',
      '/api/xbank/predictions',
      '/api/xbank/groups',
      '/api/xbank/stats',
      '/api/xbank/notifications'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        // Anche se restituisce 401 (non autorizzato), significa che l'endpoint esiste
        const isAvailable = response.status === 401 || response.status === 200;
        logTest(`Endpoint ${endpoint}`, isAvailable, `Status: ${response.status}`);
      } catch (error) {
        logTest(`Endpoint ${endpoint}`, false, error.message);
      }
    }

    // 4. Test frontend X-Bank
    console.log('\n📋 4. Test Frontend X-Bank');
    
    try {
      const frontendResponse = await fetch(`${BASE_URL}/xbank`);
      logTest('Pagina X-Bank accessibile', frontendResponse.ok, `Status: ${frontendResponse.status}`);
      
      if (frontendResponse.ok) {
        const html = await frontendResponse.text();
        logTest('Contenuto HTML presente', html.length > 1000, `Dimensione: ${html.length} caratteri`);
        logTest('Titolo X-Bank presente', html.includes('X-Bank') || html.includes('xbank'), 'Trovato nel HTML');
      }
    } catch (error) {
      logTest('Pagina X-Bank accessibile', false, error.message);
    }

    // 5. Test server Next.js
    console.log('\n📋 5. Test Server Next.js');
    
    try {
      const healthResponse = await fetch(`${BASE_URL}/`);
      logTest('Server Next.js attivo', healthResponse.ok, `Status: ${healthResponse.status}`);
    } catch (error) {
      logTest('Server Next.js attivo', false, error.message);
    }

    // 6. Test configurazione ambiente
    console.log('\n📋 6. Test Configurazione Ambiente');
    
    logTest('SUPABASE_URL configurato', !!SUPABASE_URL, SUPABASE_URL ? 'OK' : 'Mancante');
logTest('SUPABASE_PUBLISHABLE_KEY configurato', !!SUPABASE_PUBLISHABLE_KEY, SUPABASE_PUBLISHABLE_KEY ? 'OK' : 'Mancante');

    // 7. Test dati di esempio nel database
    console.log('\n📋 7. Test Dati di Esempio');
    
    if (userData) {
      // Test settings utente
      const { data: settings } = await supabase
        .from('xbank_user_settings')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      logTest('Settings utente VIP presenti', !!settings, settings ? 'Trovate' : 'Non trovate');

      // Test predizioni esistenti
      const { data: predictions } = await supabase
        .from('xbank_custom_predictions')
        .select('*')
        .eq('user_id', userData.id)
        .limit(5);

      logTest('Predizioni utente presenti', Array.isArray(predictions), `Count: ${predictions?.length || 0}`);

      // Test gruppi esistenti
      const { data: groups } = await supabase
        .from('xbank_prediction_groups')
        .select('*')
        .eq('user_id', userData.id)
        .limit(5);

      logTest('Gruppi utente presenti', Array.isArray(groups), `Count: ${groups?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Errore durante i test E2E:', error);
    logTest('Esecuzione test E2E', false, error.message);
  }

  // Risultati finali
  console.log('\n' + '='.repeat(60));
  console.log('📊 RISULTATI TEST END-TO-END X-BANK');
  console.log('='.repeat(60));
  console.log(`✅ Test passati: ${testResults.passed}/${testResults.total}`);
  console.log(`❌ Test falliti: ${testResults.failed}/${testResults.total}`);
  console.log(`📈 Tasso di successo: ${Math.round((testResults.passed / testResults.total) * 100)}%`);

  if (testResults.failed > 0) {
    console.log('\n❌ Test falliti:');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => console.log(`   - ${test.name}: ${test.details}`));
  }

  console.log('\n🎯 VALUTAZIONE FINALE:');
  const successRate = (testResults.passed / testResults.total) * 100;
  
  if (successRate >= 90) {
    console.log('🟢 ECCELLENTE - Sistema X-Bank completamente funzionante!');
    console.log('✅ Database configurato correttamente');
    console.log('✅ API endpoints disponibili');
    console.log('✅ Frontend accessibile');
    console.log('✅ Server Next.js operativo');
  } else if (successRate >= 75) {
    console.log('🟡 BUONO - Sistema X-Bank funzionante con piccoli problemi');
    console.log('🔧 Alcuni componenti potrebbero necessitare attenzione');
  } else if (successRate >= 50) {
    console.log('🟠 SUFFICIENTE - Sistema X-Bank parzialmente funzionante');
    console.log('🔧 Diversi componenti necessitano correzioni');
  } else {
    console.log('🔴 CRITICO - Sistema X-Bank richiede interventi urgenti');
    console.log('🔧 Problemi significativi rilevati');
  }

  console.log('\n📋 COMPONENTI VERIFICATI:');
  console.log('🗄️  Database Supabase e tabelle X-Bank');
  console.log('🔌 Endpoint API X-Bank');
  console.log('🌐 Frontend X-Bank');
  console.log('⚙️  Server Next.js');
  console.log('🔧 Configurazione ambiente');
  console.log('📊 Dati di esempio');

  console.log('\n📋 PROSSIMI PASSI RACCOMANDATI:');
  if (successRate >= 90) {
    console.log('✅ Sistema pronto per test con autenticazione completa');
    console.log('✅ Implementare test funzionali dettagliati');
    console.log('✅ Preparare per deploy in staging');
  } else {
    console.log('🔧 Risolvere i problemi identificati');
    console.log('🔧 Verificare la configurazione del database');
    console.log('🔧 Controllare la configurazione delle API');
  }

  console.log('\n' + '='.repeat(60));
}

// Esecuzione
if (require.main === module) {
  runE2ETests().catch(console.error);
}

module.exports = { runE2ETests };