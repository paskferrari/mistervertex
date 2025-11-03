#!/usr/bin/env node

/**
 * Script di test completo per le API X-Bank
 * Testa tutte le funzionalità implementate con autenticazione simulata
 */

const BASE_URL = 'http://localhost:3000';

// Simula un utente VIP autenticato
const VIP_USER_ID = '9a1a3cc0-2795-4571-85eb-7e985cc7506a';
const VIP_EMAIL = 'golo@mistervertex.com';

// Simula un token Supabase JWT valido
// In produzione questo sarebbe generato da Supabase Auth
const createMockSupabaseToken = () => {
  const header = Buffer.from(JSON.stringify({
    alg: 'HS256',
    typ: 'JWT'
  })).toString('base64url');
  
  const payload = Buffer.from(JSON.stringify({
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 ora
    sub: VIP_USER_ID,
    email: VIP_EMAIL,
    role: 'authenticated',
    user_metadata: {
      role: 'abbonato_vip'
    }
  })).toString('base64url');
  
  // Firma simulata (in produzione sarebbe firmata con la chiave segreta)
  const signature = 'mock_signature';
  
  return `${header}.${payload}.${signature}`;
};

const MOCK_TOKEN = createMockSupabaseToken();

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${MOCK_TOKEN}`
};

// Utility per fare richieste HTTP
async function makeRequest(method, endpoint, data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) })
  };

  try {
    const response = await fetch(url, options);
    let result;
    
    try {
      result = await response.json();
    } catch {
      result = { message: 'Response not JSON' };
    }
    
    console.log(`\n🔗 ${method} ${endpoint}`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response:`, JSON.stringify(result, null, 2));
    
    return { status: response.status, data: result, success: response.ok };
  } catch (error) {
    console.error(`❌ Error in ${method} ${endpoint}:`, error.message);
    return { status: 500, error: error.message, success: false };
  }
}

// Test delle API X-Bank
async function testXBankAPIs() {
  console.log('🚀 Avvio test completo delle API X-Bank');
  console.log(`👤 Utente VIP: ${VIP_EMAIL} (${VIP_USER_ID})`);
  console.log(`🔑 Token: ${MOCK_TOKEN.substring(0, 50)}...`);
  console.log('=' .repeat(80));

  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Helper per tracciare i risultati
  const trackResult = (testName, success) => {
    testResults.total++;
    if (success) {
      testResults.passed++;
      console.log(`✅ ${testName}: PASSED`);
    } else {
      testResults.failed++;
      console.log(`❌ ${testName}: FAILED`);
    }
  };

  // 1. Test API Settings (GET)
  console.log('\n📋 1. TEST API SETTINGS (GET)');
  const settingsGet = await makeRequest('GET', '/api/xbank/settings');
  trackResult('Settings GET', settingsGet.success);

  // 2. Test API Settings (PUT) - Aggiorna impostazioni
  console.log('\n📋 2. TEST API SETTINGS (PUT)');
  const settingsUpdate = {
    initial_bankroll: 6000.00,
    current_bankroll: 5500.00,
    currency: 'EUR',
    unit_type: 'percentage',
    unit_value: 2.5,
    risk_management: {
      max_daily_loss: 200,
      max_stake_percentage: 5,
      stop_loss_enabled: true
    }
  };
  const settingsPut = await makeRequest('PUT', '/api/xbank/settings', settingsUpdate);
  trackResult('Settings PUT', settingsPut.success);

  // 3. Test API Predictions (GET) - Lista pronostici
  console.log('\n📋 3. TEST API PREDICTIONS (GET)');
  const predictionsGet = await makeRequest('GET', '/api/xbank/predictions?page=1&limit=10');
  trackResult('Predictions GET', predictionsGet.success);

  // 4. Test API Predictions (POST) - Crea nuovo pronostico
  console.log('\n📋 4. TEST API PREDICTIONS (POST)');
  const newPrediction = {
    title: 'Inter vs Milan - Over 2.5 Goals',
    description: 'Derby della Madonnina, entrambe le squadre in forma offensiva',
    event_name: 'Inter vs Milan',
    odds: 1.85,
    stake_amount: 100.00,
    stake_units: 'currency',
    confidence: 75,
    match_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    bookmaker: 'Bet365',
    bet_type: 'Over/Under',
    tags: ['Serie A', 'Derby', 'Over Goals']
  };
  const predictionsPost = await makeRequest('POST', '/api/xbank/predictions', newPrediction);
  trackResult('Predictions POST', predictionsPost.success);
  const predictionId = predictionsPost.data?.prediction?.id;

  // 5. Test API Predictions Update (PUT) - Aggiorna pronostico
  if (predictionId) {
    console.log('\n📋 5. TEST API PREDICTIONS UPDATE (PUT)');
    const updatePrediction = {
      title: 'Inter vs Milan - Over 2.5 Goals (AGGIORNATO)',
      confidence: 80,
      status: 'won',
      result: 'win'
    };
    const predictionsPut = await makeRequest('PUT', `/api/xbank/predictions/${predictionId}`, updatePrediction);
    trackResult('Predictions PUT', predictionsPut.success);
  } else {
    console.log('\n⚠️  Skipping Predictions UPDATE - No prediction ID');
    testResults.total++;
    testResults.failed++;
  }

  // 6. Test API Bankroll (GET) - Storico transazioni
  console.log('\n📋 6. TEST API BANKROLL (GET)');
  const bankrollGet = await makeRequest('GET', '/api/xbank/bankroll?page=1&limit=10');
  trackResult('Bankroll GET', bankrollGet.success);

  // 7. Test API Copy-Trade (GET) - Lista utenti seguiti
  console.log('\n📋 7. TEST API COPY-TRADE (GET)');
  const copytradeGet = await makeRequest('GET', '/api/xbank/copytrade');
  trackResult('Copy-Trade GET', copytradeGet.success);

  // 8. Test API Copy-Trade (POST) - Segui un utente
  console.log('\n📋 8. TEST API COPY-TRADE (POST)');
  const followUser = {
    target_type: 'user',
    target_id: 'test-trader-id-123',
    copy_settings: {
      max_stake_per_bet: 50.00,
      copy_percentage: 25,
      min_odds: 1.50,
      max_odds: 3.00,
      auto_copy: true
    }
  };
  const copytradePost = await makeRequest('POST', '/api/xbank/copytrade', followUser);
  trackResult('Copy-Trade POST', copytradePost.success);
  const followId = copytradePost.data?.follow?.id;

  // 9. Test API Copy-Trade Update (PUT) - Aggiorna impostazioni follow
  if (followId) {
    console.log('\n📋 9. TEST API COPY-TRADE UPDATE (PUT)');
    const updateFollow = {
      copy_settings: {
        max_stake_per_bet: 75.00,
        copy_percentage: 30,
        auto_copy: false
      },
      is_active: true
    };
    const copytradePut = await makeRequest('PUT', `/api/xbank/copytrade/${followId}`, updateFollow);
    trackResult('Copy-Trade PUT', copytradePut.success);
  } else {
    console.log('\n⚠️  Skipping Copy-Trade UPDATE - No follow ID');
    testResults.total++;
    testResults.failed++;
  }

  // 10. Test API Copy-Trade Copy (GET) - Pronostici disponibili per copia
  console.log('\n📋 10. TEST API COPY-TRADE COPY (GET)');
  const copytradeCopyGet = await makeRequest('GET', '/api/xbank/copytrade/copy?page=1&limit=5');
  trackResult('Copy-Trade Copy GET', copytradeCopyGet.success);

  // 11. Test API Copy-Trade Copy (POST) - Copia un pronostico
  if (predictionId) {
    console.log('\n📋 11. TEST API COPY-TRADE COPY (POST)');
    const copyPrediction = {
      original_prediction_id: predictionId,
      custom_stake: 25.00
    };
    const copytradeCopyPost = await makeRequest('POST', '/api/xbank/copytrade/copy', copyPrediction);
    trackResult('Copy-Trade Copy POST', copytradeCopyPost.success);
  } else {
    console.log('\n⚠️  Skipping Copy-Trade COPY - No prediction ID');
    testResults.total++;
    testResults.failed++;
  }

  // 12. Test finale - Verifica stato aggiornato
  console.log('\n📋 12. TEST FINALE - VERIFICA STATO AGGIORNATO');
  const finalSettingsGet = await makeRequest('GET', '/api/xbank/settings');
  trackResult('Final Settings GET', finalSettingsGet.success);
  
  const finalPredictionsGet = await makeRequest('GET', '/api/xbank/predictions?page=1&limit=5');
  trackResult('Final Predictions GET', finalPredictionsGet.success);
  
  const finalBankrollGet = await makeRequest('GET', '/api/xbank/bankroll?page=1&limit=5');
  trackResult('Final Bankroll GET', finalBankrollGet.success);

  // Risultati finali
  console.log('\n' + '=' .repeat(80));
  console.log('📊 RISULTATI FINALI DEI TEST');
  console.log('=' .repeat(80));
  console.log(`✅ Test passati: ${testResults.passed}/${testResults.total}`);
  console.log(`❌ Test falliti: ${testResults.failed}/${testResults.total}`);
  console.log(`📈 Percentuale successo: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 TUTTI I TEST SONO PASSATI! Le API X-Bank funzionano correttamente.');
  } else {
    console.log('\n⚠️  Alcuni test sono falliti. Controlla i log sopra per i dettagli.');
  }
  
  console.log('\n🔍 Note:');
  console.log('- I test usano token JWT simulati');
  console.log('- In produzione, i token sarebbero generati da Supabase Auth');
  console.log('- Verifica che il database sia configurato correttamente');
  console.log('- Controlla che l\'utente VIP esista nel database');
}

// Esegui i test
if (require.main === module) {
  testXBankAPIs().catch(console.error);
}

module.exports = { testXBankAPIs };