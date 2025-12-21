# 🔧 Troubleshooting: No Jobs Showing on Frontend

## Quick Diagnosis

### Step 1: Check Browser Console
1. Open your deployed frontend in browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Refresh the page
5. Look for error messages with 🔍 [Home] or 📡 emojis

### Step 2: Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Refresh the page
3. Look for requests to `/api/jobs`
4. Click on the request to see:
   - **Status**: Should be 200
   - **Response**: Should have JSON with jobs data
   - **Headers**: Check if CORS is allowed

### Step 3: Test Backend Directly

Run the test script:
```bash
node test-backend.js https://job-finder-bice-eta.vercel.app
```

Or test manually with curl:
```bash
# Test root endpoint
curl https://job-finder-bice-eta.vercel.app/

# Test health check
curl https://job-finder-bice-eta.vercel.app/health

# Test jobs API
curl https://job-finder-bice-eta.vercel.app/api/jobs
```

---

## Common Issues & Solutions

### ❌ Issue 1: "Network Error" or API Not Responding

**Symptoms:**
- Browser console shows: "No response from server"
- Network tab shows request failed or pending forever
- Red errors in console

**Possible Causes:**
1. Backend not deployed
2. Wrong VITE_API_URL in frontend
3. Backend crashed or not responding

**Solutions:**

✅ **Check if backend is deployed:**
```bash
curl https://job-finder-bice-eta.vercel.app/
```
Should return JSON with `success: true`

✅ **Verify frontend environment variable:**
- Go to Vercel Dashboard → Your Frontend Project
- Settings → Environment Variables
- Check `VITE_API_URL` = `https://job-finder-bice-eta.vercel.app`
- **Important:** No `/api` at the end!
- Redeploy frontend after changing

✅ **Check backend logs:**
- Vercel Dashboard → Backend Project → Deployments
- Click latest deployment → View Function Logs
- Look for startup errors or crashes

---

### ❌ Issue 2: CORS Error

**Symptoms:**
- Console shows: "blocked by CORS policy"
- Network tab shows request completed but no data
- Red CORS error message

**Possible Causes:**
1. Frontend URL not in backend's FRONTEND_URL
2. CORS not configured correctly
3. Credentials not allowed

**Solutions:**

✅ **Add frontend URL to backend:**
- Vercel Dashboard → Backend Project
- Settings → Environment Variables
- Add/Update `FRONTEND_URL` = `https://your-frontend.vercel.app`
- Click "Redeploy" (important!)

✅ **Verify CORS in backend logs:**
- Look for: "🌐 CORS allowed origins:" in logs
- Should include your frontend URL
- If you see "✗ CORS: Origin ... not allowed", update FRONTEND_URL

---

### ❌ Issue 3: Backend Returns Empty Data

**Symptoms:**
- API responds with 200 OK
- Console shows: "✅ Loaded 0 platform jobs"
- Response: `{ success: true, count: 0, data: [] }`

**Possible Causes:**
1. No jobs in MongoDB database
2. Database connection failed
3. Wrong database being queried

**Solutions:**

✅ **Check health endpoint:**
```bash
curl https://job-finder-bice-eta.vercel.app/health
```
Should show MongoDB: "Connected ✓"

✅ **Seed the database:**
```bash
cd backend
node scripts/seedJobs.js
```
This will insert 30+ sample jobs

✅ **Check MongoDB Atlas:**
- Log into MongoDB Atlas
- Go to your cluster
- Browse Collections → Database: jobfindermain → Collection: jobs
- Verify jobs exist in the collection

✅ **Verify database name in MONGO_URI:**
```
mongodb+srv://...@cluster.mongodb.net/jobfindermain
                                            ^^^^^^^^^
                                    Must match your DB name
```

---

### ❌ Issue 4: MongoDB Connection Failed

**Symptoms:**
- Health check returns: `mongodb: "Connection Failed"`
- Backend logs show: "MongoDB connection failed"
- Jobs API returns 503 error

**Possible Causes:**
1. Wrong MONGO_URI
2. IP whitelist not configured
3. Database user permissions

**Solutions:**

✅ **Check MongoDB Atlas IP Whitelist:**
- MongoDB Atlas → Network Access
- Must have `0.0.0.0/0` (allow all)
- Add if missing, wait 2-3 minutes for propagation

✅ **Verify MONGO_URI:**
- Check backend environment variables in Vercel
- Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
- Password should be URL-encoded (use %40 for @, etc.)

✅ **Test connection locally:**
```bash
cd backend
# Set env vars
export MONGO_URI="your_connection_string"
export JWT_SECRET="test"
node -e "require('./config/db')().then(() => console.log('✓ Connected')).catch(e => console.log('✗ Failed:', e.message))"
```

---

### ❌ Issue 5: Wrong API URL in Frontend

**Symptoms:**
- Console shows: "🌐 API Base URL: undefined" or wrong URL
- Requests going to localhost instead of production
- 404 errors

**Solutions:**

✅ **Check .env.production:**
```bash
cat frontend/.env.production
```
Should contain:
```env
VITE_API_URL=https://job-finder-bice-eta.vercel.app
```
(No `/api` suffix!)

✅ **Verify Vercel environment variable:**
- Vercel Dashboard → Frontend → Settings → Environment Variables
- Add `VITE_API_URL` = `https://job-finder-bice-eta.vercel.app`
- Set environment: Production
- Redeploy

✅ **Rebuild frontend:**
```bash
cd frontend
npm run build
```
Check dist/assets files don't have localhost references

---

### ❌ Issue 6: Requests Timing Out

**Symptoms:**
- Console shows: "Request timeout"
- Loading spinner forever
- No response after 30+ seconds

**Possible Causes:**
1. Backend serverless function cold start
2. MongoDB query too slow
3. External API timeout

**Solutions:**

✅ **Wait for cold start:**
- First request after deployment can take 10-20 seconds
- Refresh page after 30 seconds
- Subsequent requests will be faster

✅ **Check function logs for slow queries:**
- Look for queries taking >10 seconds
- May need to add indexes to MongoDB

---

## Debugging Checklist

Copy this checklist and check each item:

### Frontend
- [ ] Deployed to Vercel successfully
- [ ] Opens in browser without errors
- [ ] Console shows API URL correctly
- [ ] No hardcoded localhost URLs
- [ ] VITE_API_URL set in Vercel environment variables

### Backend
- [ ] Deployed to Vercel successfully
- [ ] Root endpoint (/) returns JSON
- [ ] Health check (/health) returns success
- [ ] Jobs API (/api/jobs) returns data
- [ ] MONGO_URI set correctly
- [ ] JWT_SECRET set
- [ ] FRONTEND_URL includes deployed frontend domain

### MongoDB
- [ ] Cluster is running (not paused)
- [ ] IP whitelist includes 0.0.0.0/0
- [ ] Database user exists with correct permissions
- [ ] Jobs collection has data (run seed script)
- [ ] Connection string is correct

### CORS
- [ ] Backend FRONTEND_URL includes frontend domain
- [ ] Backend redeployed after CORS changes
- [ ] No CORS errors in browser console

---

## Still Not Working?

### 1. Check Everything End-to-End

Run this command sequence:

```bash
# Test backend
node test-backend.js https://job-finder-bice-eta.vercel.app

# If backend test fails, check:
# 1. Is backend deployed?
# 2. Are environment variables set?
# 3. Is MongoDB accessible?

# If backend test passes but frontend still empty:
# 1. Check browser console for errors
# 2. Check Network tab for failed requests
# 3. Verify VITE_API_URL in frontend Vercel settings
```

### 2. Compare Deployed vs Local

| Check | Local | Production |
|-------|-------|-----------|
| Backend URL | http://localhost:3100 | https://job-finder-bice-eta.vercel.app |
| Frontend URL | http://localhost:5173 | https://your-frontend.vercel.app |
| API calls working? | ✅ | ❓ |
| Jobs showing? | ✅ | ❓ |
| CORS enabled? | localhost allowed | Prod domain allowed? |

### 3. Fresh Deployment

If nothing works, try fresh deployment:

```bash
# Backend
cd backend
git add .
git commit -m "Fresh deployment"
git push

# Wait for deployment, then verify:
curl https://job-finder-bice-eta.vercel.app/api/jobs

# Frontend
cd frontend
# Update .env.production with correct backend URL
git add .
git commit -m "Fresh deployment"
git push
```

### 4. Enable Detailed Logging

The frontend now has detailed logging. Open browser console and you'll see:
```
🔍 [Home] Starting to fetch jobs...
🌐 [Home] API Base URL: https://...
📡 [Home] Fetching platform jobs...
✅ [Home] Platform response: { success: true, count: 30, data: [...] }
📊 [Home] Total jobs fetched: 30
```

If you don't see these logs, the component isn't mounting or there's a JavaScript error.

---

## Quick Fixes Summary

| Problem | Quick Fix |
|---------|----------|
| No backend response | Check if deployed, verify URL |
| CORS error | Add frontend URL to backend FRONTEND_URL, redeploy |
| Empty data | Run seed script: `node scripts/seedJobs.js` |
| MongoDB error | Set IP whitelist to 0.0.0.0/0 |
| Wrong API URL | Set VITE_API_URL in Vercel, redeploy |
| Timeout | Wait 30 sec, refresh (cold start) |

---

## Get Help

If you've tried everything:

1. **Check Vercel Function Logs**
   - Most errors will be visible here
   
2. **Check Browser Console**
   - All API calls are logged with emojis (🔍 📡 ✅ ❌)

3. **Test with curl**
   - Eliminates frontend issues
   - Shows exact API response

4. **Compare with local**
   - If local works, it's a deployment config issue

---

**Last Updated:** Dec 21, 2025
