#!/usr/bin/env node
/**
 * Backend API Health Check Script
 * Tests if backend is accessible and returning data
 * 
 * Usage: node test-backend.js [backend-url]
 * Example: node test-backend.js https://job-finder-bice-eta.vercel.app
 */

const https = require('https');
const http = require('http');

// Get backend URL from argument or use default
const backendURL = process.argv[2] || 'https://job-finder-bice-eta.vercel.app';

console.log('\n🧪 Testing Backend API Connection...');
console.log('📍 Backend URL:', backendURL);
console.log('─'.repeat(60));

// Parse URL
const url = new URL(backendURL);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

// Test 1: Root endpoint
function testRoot() {
  return new Promise((resolve, reject) => {
    console.log('\n1️⃣  Testing root endpoint (/)...');
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log('   ✅ Root endpoint responding');
            console.log('   📦 Response:', json);
            resolve(true);
          } catch (e) {
            console.log('   ⚠️  Root endpoint responded but not JSON:', data.substring(0, 100));
            resolve(false);
          }
        } else {
          console.log(`   ❌ Root endpoint returned ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('   ❌ Connection failed:', error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      console.log('   ❌ Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Test 2: Health endpoint
function testHealth() {
  return new Promise((resolve, reject) => {
    console.log('\n2️⃣  Testing health endpoint (/health)...');
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/health',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 503) {
          try {
            const json = JSON.parse(data);
            if (json.success) {
              console.log('   ✅ Health check passed');
              console.log('   🗄️  MongoDB:', json.mongodb || 'Connected');
            } else {
              console.log('   ⚠️  Health check responded but with error');
              console.log('   📦 Response:', json);
            }
            resolve(json.success);
          } catch (e) {
            console.log('   ⚠️  Health endpoint responded but not JSON');
            resolve(false);
          }
        } else {
          console.log(`   ❌ Health endpoint returned ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('   ❌ Connection failed:', error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      console.log('   ❌ Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Test 3: Jobs API
function testJobsAPI() {
  return new Promise((resolve, reject) => {
    console.log('\n3️⃣  Testing jobs API (/api/jobs)...');
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/api/jobs',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            if (json.success && json.data) {
              console.log(`   ✅ Jobs API responding`);
              console.log(`   📊 Found ${json.count || json.data.length} jobs`);
              if (json.data.length > 0) {
                console.log(`   📝 Sample job: "${json.data[0].title}" at ${json.data[0].company}`);
              } else {
                console.log('   ⚠️  No jobs in database (run seed script)');
              }
              resolve(json.data.length > 0);
            } else {
              console.log('   ⚠️  Jobs API responded but unexpected format');
              console.log('   📦 Response:', json);
              resolve(false);
            }
          } catch (e) {
            console.log('   ⚠️  Jobs API responded but not JSON:', data.substring(0, 100));
            resolve(false);
          }
        } else {
          console.log(`   ❌ Jobs API returned ${res.statusCode}`);
          console.log('   Response:', data.substring(0, 200));
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('   ❌ Connection failed:', error.message);
      reject(error);
    });

    req.setTimeout(15000, () => {
      console.log('   ❌ Request timeout (jobs query can be slow)');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  try {
    const rootOk = await testRoot();
    const healthOk = await testHealth();
    const jobsOk = await testJobsAPI();

    console.log('\n' + '─'.repeat(60));
    console.log('📋 Summary:');
    console.log('─'.repeat(60));
    console.log(`Root endpoint:   ${rootOk ? '✅ OK' : '❌ Failed'}`);
    console.log(`Health check:    ${healthOk ? '✅ OK' : '❌ Failed'}`);
    console.log(`Jobs API:        ${jobsOk ? '✅ OK' : '⚠️  No data'}`);
    console.log('─'.repeat(60));

    if (rootOk && healthOk && jobsOk) {
      console.log('\n🎉 Backend is fully operational!\n');
      process.exit(0);
    } else if (rootOk && healthOk) {
      console.log('\n⚠️  Backend is running but has no jobs in database.');
      console.log('💡 Run seed script: node backend/scripts/seedJobs.js\n');
      process.exit(1);
    } else if (rootOk) {
      console.log('\n⚠️  Backend is accessible but database connection failed.');
      console.log('💡 Check MongoDB connection string and IP whitelist.\n');
      process.exit(1);
    } else {
      console.log('\n❌ Backend is not accessible.');
      console.log('💡 Check if backend is deployed and URL is correct.\n');
      process.exit(1);
    }
  } catch (error) {
    console.log('\n❌ Tests failed with error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   • Check if backend is deployed');
    console.log('   • Verify the URL is correct');
    console.log('   • Check firewall/network settings\n');
    process.exit(1);
  }
}

// Start tests
runTests();
