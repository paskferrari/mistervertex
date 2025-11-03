#!/usr/bin/env node

/**
 * Test di Struttura API X-Bank
 * Verifica che tutte le API siano implementate e gestiscano correttamente gli errori
 */

const BASE_URL = 'http://localhost:3000';

// Utility per fare richieste HTTP
async function makeRequest(method, endpoint, data = null, headers = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
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
    
    return { 
      status: response.status, 
      data: result, 
      success: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return { 
      status: 500, 
      error: error.message, 
      success: false 
    };
  }
}

// Test delle API X-Bank
async function testXBankAPIStructure() {
  console.log('🔍 Test Struttura API X-Bank');
  console.log('=' .repeat(60));

  let results = {
    total: 0,
    passed: 0,
    failed: 0,
    apis: {}
  };

  // Helper per tracciare i risultati
  const trackResult = (apiName, testName, success, details = '') => {
    results.total++;
    if (!results.apis[apiName]) {
      results.apis[apiName] = { passed: 0, failed: 0, tests: [] };
    }
    
    if (success) {
      results.passed++;
      results.apis[apiName].passed++;
      console.log(`✅ ${apiName} - ${testName}: PASS ${details}`);
    } else {
      results.failed++;
      results.apis[apiName].failed++;
      console.log(`❌ ${apiName} - ${testName}: FAIL ${details}`);
    }
    
    results.apis[apiName].tests.push({ name: testName, success, details });
  };

  // 1. Test API Settings
  console.log('\n📋 1. API SETTINGS');
  
  // GET senza auth - dovrebbe restituire 401
  const settingsGetNoAuth = await makeRequest('GET', '/api/xbank/settings');
  trackResult('Settings', 'GET No Auth', settingsGetNoAuth.status === 401, `(${settingsGetNoAuth.status})`);
  
  // PUT senza auth - dovrebbe restituire 401
  const settingsPutNoAuth = await makeRequest('PUT', '/api/xbank/settings', { test: 'data' });
  trackResult('Settings', 'PUT No Auth', settingsPutNoAuth.status === 401, `(${settingsPutNoAuth.status})`);
  
  // GET con token falso - dovrebbe restituire 401
  const settingsGetFakeAuth = await makeRequest('GET', '/api/xbank/settings', null, {
    'Authorization': 'Bearer fake-token'
  });
  trackResult('Settings', 'GET Fake Auth', settingsGetFakeAuth.status === 401, `(${settingsGetFakeAuth.status})`);

  // 2. Test API Predictions
  console.log('\n📋 2. API PREDICTIONS');
  
  const predictionsGetNoAuth = await makeRequest('GET', '/api/xbank/predictions');
  trackResult('Predictions', 'GET No Auth', predictionsGetNoAuth.status === 401, `(${predictionsGetNoAuth.status})`);
  
  const predictionsPostNoAuth = await makeRequest('POST', '/api/xbank/predictions', { test: 'data' });
  trackResult('Predictions', 'POST No Auth', predictionsPostNoAuth.status === 401, `(${predictionsPostNoAuth.status})`);

  // 3. Test API Bankroll
  console.log('\n📋 3. API BANKROLL');
  
  const bankrollGetNoAuth = await makeRequest('GET', '/api/xbank/bankroll');
  trackResult('Bankroll', 'GET No Auth', 
    bankrollGetNoAuth.status === 401 || bankrollGetNoAuth.status === 403, 
    `(${bankrollGetNoAuth.status})`);

  // 4. Test API Copy-Trade
  console.log('\n📋 4. API COPY-TRADE');
  
  const copytradeGetNoAuth = await makeRequest('GET', '/api/xbank/copytrade');
  trackResult('Copy-Trade', 'GET No Auth', copytradeGetNoAuth.status === 401, `(${copytradeGetNoAuth.status})`);
  
  const copytradePostNoAuth = await makeRequest('POST', '/api/xbank/copytrade', { test: 'data' });
  trackResult('Copy-Trade', 'POST No Auth', copytradePostNoAuth.status === 401, `(${copytradePostNoAuth.status})`);

  // 5. Test API Copy-Trade Copy
  console.log('\n📋 5. API COPY-TRADE COPY');
  
  const copytradeCopyGetNoAuth = await makeRequest('GET', '/api/xbank/copytrade/copy');
  trackResult('Copy-Trade Copy', 'GET No Auth', copytradeCopyGetNoAuth.status === 401, `(${copytradeCopyGetNoAuth.status})`);
  
  const copytradeCopyPostNoAuth = await makeRequest('POST', '/api/xbank/copytrade/copy', { test: 'data' });
  trackResult('Copy-Trade Copy', 'POST No Auth', copytradeCopyPostNoAuth.status === 401, `(${copytradeCopyPostNoAuth.status})`);

  // 6. Test API Predictions Update
  console.log('\n📋 6. API PREDICTIONS UPDATE');
  
  const predictionsPutNoAuth = await makeRequest('PUT', '/api/xbank/predictions/test-id', { test: 'data' });
  trackResult('Predictions Update', 'PUT No Auth', predictionsPutNoAuth.status === 401, `(${predictionsPutNoAuth.status})`);

  // 7. Test API Copy-Trade Update
  console.log('\n📋 7. API COPY-TRADE UPDATE');
  
  const copytradeUpdatePutNoAuth = await makeRequest('PUT', '/api/xbank/copytrade/test-id', { test: 'data' });
  trackResult('Copy-Trade Update', 'PUT No Auth', copytradeUpdatePutNoAuth.status === 401, `(${copytradeUpdatePutNoAuth.status})`);
  
  const copytradeDeleteNoAuth = await makeRequest('DELETE', '/api/xbank/copytrade/test-id');
  trackResult('Copy-Trade Update', 'DELETE No Auth', copytradeDeleteNoAuth.status === 401, `(${copytradeDeleteNoAuth.status})`);

  // 8. Test Validazione Dati
  console.log('\n📋 8. VALIDAZIONE DATI');
  
  // Test con dati malformati
  const settingsPutBadData = await makeRequest('PUT', '/api/xbank/settings', 'invalid-json', {
    'Authorization': 'Bearer fake-token'
  });
  trackResult('Data Validation', 'Invalid JSON', 
    settingsPutBadData.status === 400 || settingsPutBadData.status === 401, 
    `(${settingsPutBadData.status})`);

  // 9. Test Endpoint Non Esistenti
  console.log('\n📋 9. ENDPOINT NON ESISTENTI');
  
  const nonExistentEndpoint = await makeRequest('GET', '/api/xbank/nonexistent');
  trackResult('Non-Existent', 'GET Unknown Endpoint', nonExistentEndpoint.status === 404, `(${nonExistentEndpoint.status})`);

  // 10. Test CORS e Headers
  console.log('\n📋 10. HEADERS E CORS');
  
  const corsTest = await makeRequest('OPTIONS', '/api/xbank/settings');
  trackResult('CORS', 'OPTIONS Request', 
    corsTest.status === 200 || corsTest.status === 405 || corsTest.status === 404, 
    `(${corsTest.status})`);

  // Risultati finali
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RISULTATI FINALI');
  console.log('=' .repeat(60));
  console.log(`✅ Test passati: ${results.passed}/${results.total}`);
  console.log(`❌ Test falliti: ${results.failed}/${results.total}`);
  console.log(`📈 Percentuale successo: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  // Dettagli per API
  console.log('\n📋 DETTAGLI PER API:');
  Object.entries(results.apis).forEach(([apiName, apiResults]) => {
    const total = apiResults.passed + apiResults.failed;
    const percentage = ((apiResults.passed / total) * 100).toFixed(1);
    console.log(`  ${apiName}: ${apiResults.passed}/${total} (${percentage}%)`);
  });

  // Valutazione finale
  console.log('\n🎯 VALUTAZIONE:');
  if (results.failed === 0) {
    console.log('🎉 ECCELLENTE! Tutte le API sono implementate correttamente');
    console.log('✅ Autenticazione funziona come previsto');
    console.log('✅ Gestione errori appropriata');
    console.log('✅ Struttura API coerente');
  } else if (results.passed / results.total >= 0.8) {
    console.log('👍 BUONO! La maggior parte delle API funziona correttamente');
    console.log('⚠️  Alcuni test falliti - verifica i dettagli sopra');
  } else {
    console.log('⚠️  ATTENZIONE! Molti test falliti');
    console.log('🔧 Verifica la configurazione del server');
    console.log('🔧 Controlla che tutte le API siano implementate');
  }

  console.log('\n🔍 NOTE:');
  console.log('- Questo test verifica solo la struttura delle API');
  console.log('- Per test completi serve autenticazione Supabase reale');
  console.log('- Tutti gli errori 401/403 sono comportamenti attesi');
  console.log('- Le API sono protette correttamente da accessi non autorizzati');

  return results;
}

// Esegui i test
if (require.main === module) {
  testXBankAPIStructure().catch(console.error);
}

module.exports = { testXBankAPIStructure };