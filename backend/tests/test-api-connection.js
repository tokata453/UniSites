// test-api-connection.js
const axios = require('axios');

const BASE_URL = `http://localhost:${process.env.PORT || 3001}`;
// const BASE_URL = `https://electronic-store-production-0f93.up.railway.app`; // Change to your deployed URL if testing against production

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

async function testConnection() {
  console.log('🧪 Testing API Connection...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Health Check
  try {
    log.info('Test 1: Health Check');
    const response = await axios.get(`${BASE_URL}/health`);
    
    if (response.status === 200 && response.data.success) {
      log.success('Server is running');
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
      passedTests++;
    }
  } catch (error) {
    log.error('Server is not running or not responding');
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
    return; // Can't continue if server is down
  }

  // Test 2: API Info
  try {
    log.info('Test 2: API Info Endpoint');
    const response = await axios.get(`${BASE_URL}/api`);
    
    if (response.status === 200 && response.data.success) {
      log.success('API info endpoint working');
      console.log(`   Available endpoints: ${Object.keys(response.data.endpoints).join(', ')}\n`);
      passedTests++;
    }
  } catch (error) {
    log.error('API info endpoint failed');
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 3: Get Products (Public)
  try {
    log.info('Test 3: Get Products (Public)');
    const response = await axios.get(`${BASE_URL}/api/products`);
    
    if (response.status === 200 && response.data.success) {
      const count = response.data.data.products.length;
      log.success(`Products endpoint working (${count} products found)`);
      console.log(`   First product: ${response.data.data.products[0]?.name || 'N/A'}\n`);
      passedTests++;
    }
  } catch (error) {
    log.error('Products endpoint failed');
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}\n`);
    failedTests++;
  }

  // Test 4: Get Categories (Public)
  try {
    log.info('Test 4: Get Categories (Public)');
    const response = await axios.get(`${BASE_URL}/api/categories`);
    
    if (response.status === 200 && response.data.success) {
      const count = response.data.data.categories.length;
      log.success(`Categories endpoint working (${count} categories found)`);
      console.log(`   Categories: ${response.data.data.categories.map(c => c.name).join(', ')}\n`);
      passedTests++;
    }
  } catch (error) {
    log.error('Categories endpoint failed');
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}\n`);
    failedTests++;
  }

  // Test 5: Login
  let authToken;
  try {
    log.info('Test 5: Login (Authentication)');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@iceelectronics.com',
      password: 'password123'
    });
    
    if (response.status === 200 && response.data.success) {
      authToken = response.data.data.token;
      log.success('Login successful');
      console.log(`   User: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`);
      console.log(`   Role: ${response.data.data.user.role}`);
      console.log(`   Token: ${authToken.substring(0, 20)}...\n`);
      passedTests++;
    }
  } catch (error) {
    log.error('Login failed');
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}\n`);
    failedTests++;
  }

  // Test 6: Protected Route (Get Current User)
  if (authToken) {
    try {
      log.info('Test 6: Protected Route (Get Me)');
      const response = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.status === 200 && response.data.success) {
        log.success('Protected route working');
        console.log(`   User: ${response.data.data.user.email}\n`);
        passedTests++;
      }
    } catch (error) {
      log.error('Protected route failed');
      console.log(`   Error: ${error.response?.data?.error?.message || error.message}\n`);
      failedTests++;
    }
  } else {
    log.warning('Skipping protected route test (no auth token)');
    console.log('');
  }

  // Test 7: Database Connection
  try {
    log.info('Test 7: Database Connection');
    const response = await axios.get(`${BASE_URL}/api/products?limit=1`);
    
    if (response.status === 200) {
      log.success('Database connection working');
      console.log(`   Database has data: ${response.data.data.pagination.total} products total\n`);
      passedTests++;
    }
  } catch (error) {
    log.error('Database connection might have issues');
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST SUMMARY\n');
  log.success(`Passed: ${passedTests} tests`);
  if (failedTests > 0) {
    log.error(`Failed: ${failedTests} tests`);
  }
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failedTests === 0) {
    log.success('🎉 All tests passed! Your API is working perfectly!\n');
  } else {
    log.warning('⚠️  Some tests failed. Check the errors above.\n');
  }
}

// Run tests
testConnection().catch(error => {
  console.error('Test script error:', error.message);
  process.exit(1);
});
