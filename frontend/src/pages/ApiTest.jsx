import { useState } from 'react';
import { getJobs, getExternalJobs } from '../services/api';

/**
 * API Diagnostic Page - For testing API connectivity
 * Access at /api-test
 */
const ApiTest = () => {
  const [testResults, setTestResults] = useState({
    envCheck: null,
    rootTest: null,
    healthTest: null,
    jobsTest: null,
    externalTest: null,
  });
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[ApiTest] ${message}`);
  };

  const clearAllData = () => {
    const confirmed = window.confirm(
      '⚠️ This will clear all localStorage and sessionStorage data.\n\n' +
      'You will be logged out and all local data will be removed.\n\n' +
      'Continue?'
    );
    
    if (confirmed) {
      addLog('🧹 Clearing all browser storage...', 'info');
      
      // List what's being cleared
      const lsKeys = Object.keys(localStorage);
      const ssKeys = Object.keys(sessionStorage);
      
      if (lsKeys.length > 0) {
        addLog(`Found ${lsKeys.length} localStorage items: ${lsKeys.join(', ')}`, 'info');
      }
      if (ssKeys.length > 0) {
        addLog(`Found ${ssKeys.length} sessionStorage items: ${ssKeys.join(', ')}`, 'info');
      }
      
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      addLog('✅ Storage cleared successfully!', 'success');
      addLog('🔄 Reloading page in 2 seconds...', 'info');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const testAll = async () => {
    setTesting(true);
    setLogs([]);
    addLog('Starting API diagnostics...', 'info');

    // Test 1: Environment variables
    addLog('📋 Checking environment variables...', 'info');
    const viteApiUrl = import.meta.env.VITE_API_URL;
    const isProd = import.meta.env.PROD;
    const envResult = {
      viteApiUrl: viteApiUrl || 'NOT SET',
      isProd,
      mode: import.meta.env.MODE,
    };
    setTestResults(prev => ({ ...prev, envCheck: envResult }));
    addLog(`VITE_API_URL: ${viteApiUrl || 'NOT SET'}`, viteApiUrl ? 'success' : 'error');
    addLog(`Production mode: ${isProd}`, 'info');

    // Test 2: Root endpoint
    addLog('🔍 Testing root endpoint...', 'info');
    try {
      const response = await fetch(viteApiUrl || 'https://job-finder-bice-eta.vercel.app');
      const data = await response.json();
      setTestResults(prev => ({ ...prev, rootTest: { success: true, data } }));
      addLog('✅ Root endpoint OK', 'success');
    } catch (error) {
      setTestResults(prev => ({ ...prev, rootTest: { success: false, error: error.message } }));
      addLog(`❌ Root endpoint failed: ${error.message}`, 'error');
    }

    // Test 3: Health endpoint
    addLog('🏥 Testing health endpoint...', 'info');
    try {
      const response = await fetch(`${viteApiUrl || 'https://job-finder-bice-eta.vercel.app'}/health`);
      const data = await response.json();
      setTestResults(prev => ({ ...prev, healthTest: { success: data.success, data } }));
      addLog(`✅ Health check: ${data.mongodb || data.message}`, data.success ? 'success' : 'error');
    } catch (error) {
      setTestResults(prev => ({ ...prev, healthTest: { success: false, error: error.message } }));
      addLog(`❌ Health check failed: ${error.message}`, 'error');
    }

    // Test 4: Jobs API
    addLog('📊 Testing jobs API...', 'info');
    try {
      const response = await getJobs();
      const count = response.data?.length || 0;
      setTestResults(prev => ({ ...prev, jobsTest: { success: response.success, count, sample: response.data?.[0] } }));
      addLog(`✅ Jobs API: Found ${count} jobs`, response.success && count > 0 ? 'success' : 'warning');
      if (count > 0) {
        addLog(`   Sample: "${response.data[0].title}" at ${response.data[0].company}`, 'info');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, jobsTest: { success: false, error: error.message } }));
      addLog(`❌ Jobs API failed: ${error.message}`, 'error');
    }

    // Test 5: External jobs API
    addLog('🌐 Testing external jobs API...', 'info');
    try {
      const response = await getExternalJobs();
      const count = response.data?.length || 0;
      setTestResults(prev => ({ ...prev, externalTest: { success: response.success, count } }));
      addLog(`✅ External jobs API: Found ${count} jobs`, response.success ? 'success' : 'warning');
    } catch (error) {
      setTestResults(prev => ({ ...prev, externalTest: { success: false, error: error.message } }));
      addLog(`⚠️  External jobs failed (optional): ${error.message}`, 'warning');
    }

    addLog('🎉 Diagnostics complete!', 'success');
    setTesting(false);
  };

  const getStatusBadge = (success) => {
    if (success === null) return <span className="text-gray-500">Not tested</span>;
    if (success === true) return <span className="text-green-400 font-bold">✅ PASS</span>;
    return <span className="text-red-400 font-bold">❌ FAIL</span>;
  };

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-dark-850 rounded-xl border border-white/10 p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">🧪 API Diagnostics</h1>
          <p className="text-gray-400 mb-6">Test backend connectivity and API responses</p>
          
          <button
            onClick={testAll}
            disabled={testing}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all mr-3"
          >
            {testing ? '⏳ Testing...' : '▶️  Run All Tests'}
          </button>
          
          <button
            onClick={clearAllData}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-6 py-3 rounded-lg font-bold transition-all"
          >
            🧹 Clear Browser Data
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-yellow-300 font-semibold text-sm">Previously used localhost?</p>
              <p className="text-yellow-200/80 text-xs mt-1">
                If you tested on localhost before deploying, clear browser data to remove cached localhost URLs and tokens.
              </p>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Environment Check */}
          <div className="bg-dark-850 rounded-xl border border-white/10 p-4">
            <h3 className="text-lg font-bold text-white mb-2">📋 Environment</h3>
            {testResults.envCheck ? (
              <div className="text-sm space-y-1">
                <p className="text-gray-300"><strong>VITE_API_URL:</strong></p>
                <code className="text-xs text-violet-400 break-all">{testResults.envCheck.viteApiUrl}</code>
                <p className="text-gray-400 mt-2">Mode: {testResults.envCheck.mode}</p>
                <p className="text-gray-400">Production: {testResults.envCheck.isProd ? 'Yes' : 'No'}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Run test to check</p>
            )}
          </div>

          {/* Root Endpoint */}
          <div className="bg-dark-850 rounded-xl border border-white/10 p-4">
            <h3 className="text-lg font-bold text-white mb-2">🔍 Root Endpoint</h3>
            {getStatusBadge(testResults.rootTest?.success)}
            {testResults.rootTest?.data && (
              <p className="text-xs text-gray-400 mt-2">{testResults.rootTest.data.message}</p>
            )}
            {testResults.rootTest?.error && (
              <p className="text-xs text-red-400 mt-2">{testResults.rootTest.error}</p>
            )}
          </div>

          {/* Health Check */}
          <div className="bg-dark-850 rounded-xl border border-white/10 p-4">
            <h3 className="text-lg font-bold text-white mb-2">🏥 Health Check</h3>
            {getStatusBadge(testResults.healthTest?.success)}
            {testResults.healthTest?.data && (
              <p className="text-xs text-gray-400 mt-2">MongoDB: {testResults.healthTest.data.mongodb || 'Unknown'}</p>
            )}
            {testResults.healthTest?.error && (
              <p className="text-xs text-red-400 mt-2">{testResults.healthTest.error}</p>
            )}
          </div>

          {/* Jobs API */}
          <div className="bg-dark-850 rounded-xl border border-white/10 p-4">
            <h3 className="text-lg font-bold text-white mb-2">📊 Jobs API</h3>
            {getStatusBadge(testResults.jobsTest?.success)}
            {testResults.jobsTest?.count !== undefined && (
              <p className="text-xs text-gray-400 mt-2">Jobs found: {testResults.jobsTest.count}</p>
            )}
            {testResults.jobsTest?.sample && (
              <p className="text-xs text-gray-400 mt-1">Sample: {testResults.jobsTest.sample.title}</p>
            )}
            {testResults.jobsTest?.error && (
              <p className="text-xs text-red-400 mt-2">{testResults.jobsTest.error}</p>
            )}
          </div>

          {/* External Jobs */}
          <div className="bg-dark-850 rounded-xl border border-white/10 p-4 md:col-span-2">
            <h3 className="text-lg font-bold text-white mb-2">🌐 External Jobs API</h3>
            {getStatusBadge(testResults.externalTest?.success)}
            {testResults.externalTest?.count !== undefined && (
              <p className="text-xs text-gray-400 mt-2">External jobs found: {testResults.externalTest.count}</p>
            )}
            {testResults.externalTest?.error && (
              <p className="text-xs text-yellow-400 mt-2">{testResults.externalTest.error} (Optional - not critical)</p>
            )}
          </div>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-dark-850 rounded-xl border border-white/10 p-4">
            <h3 className="text-lg font-bold text-white mb-3">📝 Test Logs</h3>
            <div className="bg-dark-900 rounded-lg p-3 max-h-96 overflow-y-auto font-mono text-xs space-y-1">
              {logs.map((log, index) => (
                <div key={index} className={`
                  ${log.type === 'success' ? 'text-green-400' : ''}
                  ${log.type === 'error' ? 'text-red-400' : ''}
                  ${log.type === 'warning' ? 'text-yellow-400' : ''}
                  ${log.type === 'info' ? 'text-gray-300' : ''}
                `}>
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Troubleshooting Tips */}
        <div className="bg-dark-850 rounded-xl border border-white/10 p-6 mt-6">
          <h3 className="text-lg font-bold text-white mb-3">💡 Troubleshooting Tips</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• If VITE_API_URL is "NOT SET", add it to Vercel environment variables</li>
            <li>• If root endpoint fails, backend is not deployed or URL is wrong</li>
            <li>• If health check fails, MongoDB connection issue (check IP whitelist)</li>
            <li>• If jobs API fails with CORS error, add frontend URL to backend FRONTEND_URL</li>
            <li>• If jobs count is 0, run seed script: <code className="bg-dark-800 px-2 py-1 rounded">node scripts/seedJobs.js</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
