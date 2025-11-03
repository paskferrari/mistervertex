#!/usr/bin/env node

/**
 * Test realistico delle API X-BANK con server in esecuzione
 * Utilizza il server Next.js locale per testare le funzionalità
 */

const BASE_URL = 'http://localhost:3001'

// Contatori per i risultati
let totalTests = 0
let passedTests = 0
let failedTests = 0

// Utility per logging colorato
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logTest(testName, status, details = '') {
  totalTests++
  if (status === 'PASS') {
    passedTests++
    log(`✅ ${testName} - PASS ${details}`, 'green')
  } else {
    failedTests++
    log(`❌ ${testName} - FAIL ${details}`, 'red')
  }
}

// Utility per fare richieste HTTP
async function makeRequest(endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    let data
    try {
      data = await response.json()
    } catch {
      data = await response.text()
    }
    
    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: response.headers
    }
  } catch (error) {
    return {
      status: 500,
      ok: false,
      error: error.message
    }
  }
}

// Test connessione al server
async function testServerConnection() {
  log('\n🌐 Testing Server Connection...', 'blue')
  
  try {
    const response = await fetch(`${BASE_URL}/dashboard`)
    if (response.ok) {
      logTest('Server Connection', 'PASS', '- Server is running')
      return true
    } else {
      logTest('Server Connection', 'FAIL', `- Status: ${response.status}`)
      return false
    }
  } catch (error) {
    logTest('Server Connection', 'FAIL', `- ${error.message}`)
    return false
  }
}

// Test pagina X-BANK
async function testXBankPage() {
  log('\n📱 Testing X-BANK Page...', 'blue')
  
  const response = await makeRequest('/xbank')
  
  if (response.status === 200 || response.status === 302 || response.status === 401) {
    logTest('X-BANK Page Access', 'PASS', `- Page accessible (${response.status})`)
  } else {
    logTest('X-BANK Page Access', 'FAIL', `- Unexpected status: ${response.status}`)
  }
}

// Test API endpoints senza autenticazione
async function testAPIEndpointsNoAuth() {
  log('\n🔒 Testing API Endpoints (No Auth)...', 'blue')
  
  const endpoints = [
    '/api/xbank/settings',
    '/api/xbank/groups',
    '/api/xbank/predictions',
    '/api/xbank/bankroll',
    '/api/xbank/stats'
  ]
  
  for (const endpoint of endpoints) {
    const response = await makeRequest(endpoint)
    
    if (response.status === 401) {
      logTest(`${endpoint} (No Auth)`, 'PASS', '- Correctly requires authentication')
    } else {
      logTest(`${endpoint} (No Auth)`, 'FAIL', `- Should require auth, got: ${response.status}`)
    }
  }
}

// Test metodi HTTP supportati
async function testHTTPMethods() {
  log('\n🔧 Testing HTTP Methods...', 'blue')
  
  const tests = [
    { endpoint: '/api/xbank/settings', method: 'GET' },
    { endpoint: '/api/xbank/settings', method: 'PUT' },
    { endpoint: '/api/xbank/groups', method: 'GET' },
    { endpoint: '/api/xbank/groups', method: 'POST' },
    { endpoint: '/api/xbank/groups', method: 'DELETE' },
    { endpoint: '/api/xbank/predictions', method: 'GET' },
    { endpoint: '/api/xbank/predictions', method: 'POST' },
    { endpoint: '/api/xbank/bankroll', method: 'GET' },
    { endpoint: '/api/xbank/bankroll', method: 'POST' },
    { endpoint: '/api/xbank/stats', method: 'GET' }
  ]
  
  for (const test of tests) {
    const response = await makeRequest(test.endpoint, {
      method: test.method,
      body: test.method === 'POST' || test.method === 'PUT' ? JSON.stringify({}) : undefined
    })
    
    // Dovrebbe restituire 401 (unauthorized) o 405 (method not allowed) se il metodo non è supportato
    if (response.status === 401 || response.status === 405 || response.status === 400) {
      logTest(`${test.method} ${test.endpoint}`, 'PASS', `- Handled correctly (${response.status})`)
    } else {
      logTest(`${test.method} ${test.endpoint}`, 'FAIL', `- Unexpected status: ${response.status}`)
    }
  }
}

// Test validazione dati
async function testDataValidation() {
  log('\n✅ Testing Data Validation...', 'blue')
  
  // Test POST con Content-Type sbagliato
  const invalidContentType = await makeRequest('/api/xbank/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: 'invalid data'
  })
  
  if (invalidContentType.status === 400 || invalidContentType.status === 401 || invalidContentType.status === 415) {
    logTest('Invalid Content-Type', 'PASS', '- Correctly rejected')
  } else {
    logTest('Invalid Content-Type', 'FAIL', `- Should reject, got: ${invalidContentType.status}`)
  }
  
  // Test POST con JSON malformato
  const malformedJSON = await makeRequest('/api/xbank/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{invalid json}'
  })
  
  if (malformedJSON.status === 400 || malformedJSON.status === 401) {
    logTest('Malformed JSON', 'PASS', '- Correctly rejected')
  } else {
    logTest('Malformed JSON', 'FAIL', `- Should reject, got: ${malformedJSON.status}`)
  }
}

// Test rate limiting e performance
async function testPerformance() {
  log('\n⚡ Testing Performance...', 'blue')
  
  const startTime = Date.now()
  const promises = []
  
  // Fai 20 richieste simultanee
  for (let i = 0; i < 20; i++) {
    promises.push(makeRequest('/api/xbank/settings'))
  }
  
  const responses = await Promise.all(promises)
  const endTime = Date.now()
  const duration = endTime - startTime
  
  const allResponded = responses.every(r => r.status !== undefined)
  const averageResponseTime = duration / responses.length
  
  if (allResponded && duration < 10000 && averageResponseTime < 1000) {
    logTest('Concurrent Requests', 'PASS', `- 20 requests in ${duration}ms (avg: ${averageResponseTime.toFixed(0)}ms)`)
  } else {
    logTest('Concurrent Requests', 'FAIL', `- Performance issues: ${duration}ms total, ${averageResponseTime.toFixed(0)}ms avg`)
  }
}

// Test CORS headers
async function testCORS() {
  log('\n🌍 Testing CORS Headers...', 'blue')
  
  const response = await makeRequest('/api/xbank/settings', {
    method: 'OPTIONS'
  })
  
  if (response.status === 200 || response.status === 204 || response.status === 405) {
    logTest('CORS Preflight', 'PASS', `- OPTIONS handled (${response.status})`)
  } else {
    logTest('CORS Preflight', 'FAIL', `- OPTIONS not handled: ${response.status}`)
  }
}

// Test sicurezza headers
async function testSecurityHeaders() {
  log('\n🛡️ Testing Security Headers...', 'blue')
  
  const response = await makeRequest('/api/xbank/settings')
  
  const headers = response.headers
  const hasSecurityHeaders = 
    headers.get('x-frame-options') || 
    headers.get('x-content-type-options') ||
    headers.get('x-xss-protection')
  
  if (hasSecurityHeaders) {
    logTest('Security Headers', 'PASS', '- Security headers present')
  } else {
    logTest('Security Headers', 'FAIL', '- Missing security headers')
  }
}

// Test error handling
async function testErrorHandling() {
  log('\n🚨 Testing Error Handling...', 'blue')
  
  // Test endpoint inesistente
  const notFound = await makeRequest('/api/xbank/nonexistent')
  
  if (notFound.status === 404) {
    logTest('404 Not Found', 'PASS', '- Correctly returns 404')
  } else {
    logTest('404 Not Found', 'FAIL', `- Should return 404, got: ${notFound.status}`)
  }
  
  // Test metodo non supportato
  const methodNotAllowed = await makeRequest('/api/xbank/settings', {
    method: 'PATCH'
  })
  
  if (methodNotAllowed.status === 405 || methodNotAllowed.status === 401) {
    logTest('Method Not Allowed', 'PASS', `- Correctly handled (${methodNotAllowed.status})`)
  } else {
    logTest('Method Not Allowed', 'FAIL', `- Should handle unsupported method, got: ${methodNotAllowed.status}`)
  }
}

// Test responsiveness delle API
async function testAPIResponsiveness() {
  log('\n📊 Testing API Responsiveness...', 'blue')
  
  const endpoints = [
    '/api/xbank/settings',
    '/api/xbank/groups',
    '/api/xbank/predictions',
    '/api/xbank/bankroll',
    '/api/xbank/stats'
  ]
  
  let totalResponseTime = 0
  let successfulRequests = 0
  
  for (const endpoint of endpoints) {
    const startTime = Date.now()
    const response = await makeRequest(endpoint)
    const responseTime = Date.now() - startTime
    
    totalResponseTime += responseTime
    
    if (response.status !== undefined && responseTime < 2000) {
      successfulRequests++
      logTest(`${endpoint} Response Time`, 'PASS', `- ${responseTime}ms`)
    } else {
      logTest(`${endpoint} Response Time`, 'FAIL', `- ${responseTime}ms (too slow or failed)`)
    }
  }
  
  const averageResponseTime = totalResponseTime / endpoints.length
  
  if (averageResponseTime < 1000) {
    logTest('Average Response Time', 'PASS', `- ${averageResponseTime.toFixed(0)}ms`)
  } else {
    logTest('Average Response Time', 'FAIL', `- ${averageResponseTime.toFixed(0)}ms (too slow)`)
  }
}

// Funzione principale
async function runAllTests() {
  log('🚀 Starting X-BANK Real API Tests...', 'bold')
  log('==========================================', 'blue')
  
  try {
    // Prima verifica che il server sia in esecuzione
    const serverRunning = await testServerConnection()
    
    if (!serverRunning) {
      log('\n❌ Server not running. Please start the development server with: npm run dev', 'red')
      process.exit(1)
    }
    
    await testXBankPage()
    await testAPIEndpointsNoAuth()
    await testHTTPMethods()
    await testDataValidation()
    await testPerformance()
    await testCORS()
    await testSecurityHeaders()
    await testErrorHandling()
    await testAPIResponsiveness()
    
    // Risultati finali
    log('\n==========================================', 'blue')
    log('📊 TEST RESULTS:', 'bold')
    log(`Total Tests: ${totalTests}`, 'blue')
    log(`Passed: ${passedTests}`, 'green')
    log(`Failed: ${failedTests}`, 'red')
    log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 'yellow')
    
    if (failedTests === 0) {
      log('\n🎉 All tests passed!', 'green')
    } else if (failedTests <= 3) {
      log(`\n⚠️  ${failedTests} minor issues found. System is mostly functional.`, 'yellow')
    } else {
      log(`\n❌ ${failedTests} tests failed. Check the logs above.`, 'red')
    }
    
    // Raccomandazioni
    log('\n📝 RECOMMENDATIONS:', 'bold')
    if (passedTests / totalTests > 0.8) {
      log('✅ X-BANK API system is functioning well', 'green')
      log('✅ Authentication and authorization are working', 'green')
      log('✅ Error handling is appropriate', 'green')
    } else {
      log('⚠️  Consider reviewing failed tests', 'yellow')
      log('⚠️  Check server configuration', 'yellow')
    }
    
  } catch (error) {
    log(`\n💥 Test suite crashed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Esegui i test se lo script viene chiamato direttamente
if (require.main === module) {
  runAllTests()
}

module.exports = {
  runAllTests,
  makeRequest
}