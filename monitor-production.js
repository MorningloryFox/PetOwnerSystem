#!/usr/bin/env node

// Production monitoring script
// Using native fetch (Node.js 18+)

const BASE_URL = 'https://pet-owner-system-g2z7gv7b8-morninglorys-projects.vercel.app';

async function testEndpoint(endpoint, method = 'GET', expectedStatus = 200) {
  try {
    console.log(`🔍 Testing ${method} ${endpoint}...`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Production-Monitor/1.0'
      }
    });

    const status = response.status;
    const statusIcon = status === expectedStatus ? '✅' : '❌';
    
    console.log(`${statusIcon} ${method} ${endpoint} - Status: ${status}`);
    
    if (status !== expectedStatus) {
      const text = await response.text();
      console.log(`   Error: ${text.substring(0, 200)}...`);
    }
    
    return { endpoint, method, status, success: status === expectedStatus };
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.message}`);
    return { endpoint, method, status: 'ERROR', success: false, error: error.message };
  }
}

async function monitorProduction() {
  console.log('🚀 Starting Production Monitoring...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('=' * 50);

  const results = [];

  // Test main application
  results.push(await testEndpoint('/', 'GET', 200));
  
  // Test API health check
  results.push(await testEndpoint('/api/health', 'GET', 200));
  
  // Test API endpoints (these might require auth, so we expect 401)
  results.push(await testEndpoint('/api/auth/me', 'GET', 401));
  results.push(await testEndpoint('/api/customers', 'GET', 401));
  results.push(await testEndpoint('/api/pets', 'GET', 401));
  results.push(await testEndpoint('/api/appointments', 'GET', 401));
  results.push(await testEndpoint('/api/dashboard/metrics', 'GET', 401));
  
  // Test public endpoints
  results.push(await testEndpoint('/api/services', 'GET', 200));
  results.push(await testEndpoint('/api/package-types', 'GET', 200));

  console.log('\n' + '=' * 50);
  console.log('📊 MONITORING SUMMARY:');
  console.log('=' * 50);

  const successful = results.filter(r => r.success).length;
  const total = results.length;
  const successRate = ((successful / total) * 100).toFixed(1);

  console.log(`✅ Successful: ${successful}/${total} (${successRate}%)`);
  console.log(`❌ Failed: ${total - successful}/${total}`);

  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log('\n🚨 FAILURES DETECTED:');
    failures.forEach(failure => {
      console.log(`   - ${failure.method} ${failure.endpoint}: ${failure.status}`);
      if (failure.error) {
        console.log(`     Error: ${failure.error}`);
      }
    });
  }

  console.log('\n🔍 NEXT STEPS:');
  if (successRate >= 80) {
    console.log('✅ Application appears to be working correctly!');
    console.log('📱 You can now test the frontend in your browser');
    console.log('🔐 Try logging in with admin credentials');
  } else {
    console.log('⚠️  Some issues detected. Check the failures above.');
    console.log('📋 Review Vercel logs for more details');
  }

  console.log('\n📍 Application URLs:');
  console.log(`🌐 Frontend: ${BASE_URL}`);
  console.log(`🔧 API Health: ${BASE_URL}/api/health`);
  console.log(`📊 Vercel Dashboard: https://vercel.com/morninglorys-projects/pet-owner-system`);
  
  return results;
}

// Run monitoring
monitorProduction().catch(console.error);
