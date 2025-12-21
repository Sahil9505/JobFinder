# 🧹 Browser Cleanup Guide - Fixing Localhost Cache Issues

## ⚠️ Problem: Previously Used Localhost

If you were testing on `localhost:5173` or `localhost:3100` before deploying, your browser might have:
- **Cached API responses** from localhost
- **Stored tokens** pointing to localhost
- **Service worker cache** (if any)
- **DNS cache** confusion
- **Browser memory** of localhost URLs

This can cause production to:
- ❌ Still try to call localhost APIs
- ❌ Use cached localhost data
- ❌ Show "No jobs" even though backend works
- ❌ Have mixed localhost/production API calls

---

## 🎯 Quick Fix (Do This First)

### Method 1: Hard Refresh (Fastest)

**On your deployed frontend URL:**

**Windows/Linux:**
```
Ctrl + Shift + R
or
Ctrl + F5
```

**Mac:**
```
Cmd + Shift + R
or
Cmd + Option + R
```

This clears cache for the current page.

---

### Method 2: Clear Browser Data (Recommended)

**Chrome/Edge/Brave:**
1. Press `F12` (open DevTools)
2. Right-click the **Refresh button** (next to address bar)
3. Select "**Empty Cache and Hard Reload**"

**Or:**
1. Press `Ctrl/Cmd + Shift + Delete`
2. Select:
   - ✅ Cached images and files
   - ✅ Cookies and site data
3. Time range: **Last hour** (or All time if persistent)
4. Click "Clear data"

**Firefox:**
1. Press `Ctrl/Cmd + Shift + Delete`
2. Select:
   - ✅ Cache
   - ✅ Cookies
   - ✅ Site Preferences
3. Time range: **Last hour**
4. Click "Clear Now"

**Safari:**
1. Safari → Preferences → Privacy
2. Click "Manage Website Data"
3. Find your domain, click "Remove"
4. Or click "Remove All"

---

### Method 3: Clear Application Storage (Most Thorough)

**In your deployed frontend (not localhost):**

1. Open DevTools (`F12`)
2. Go to **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. Expand **Local Storage** → Delete all entries
4. Expand **Session Storage** → Delete all entries
5. Click **Clear site data** button
6. Refresh page

**Or run this in Console:**
```javascript
// Clear all storage
localStorage.clear();
sessionStorage.clear();
console.log('✅ Storage cleared');
location.reload();
```

---

## 🔍 Check for Localhost References

**Run this in browser console on your deployed frontend:**

```javascript
// Check API URL being used
console.log('API URL:', import.meta.env.VITE_API_URL);

// Check stored tokens/data
console.log('LocalStorage:', localStorage);
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// Check for localhost references
const keys = Object.keys(localStorage);
keys.forEach(key => {
  const value = localStorage.getItem(key);
  if (value && value.includes('localhost')) {
    console.warn('⚠️ Localhost reference found:', key, value);
  }
});
```

**Expected output:**
```
API URL: https://job-finder-bice-eta.vercel.app
LocalStorage: Storage {length: 0}
Token: null
User: null
```

**Bad output (needs cleanup):**
```
API URL: undefined
Token: eyJ... (some old token)
⚠️ Localhost reference found: api_url http://localhost:3100
```

---

## 🧪 Test After Cleanup

1. **Close ALL browser tabs** with your app
2. **Close browser completely**
3. **Reopen browser**
4. **Visit production URL** (not localhost!)
5. **Open DevTools** (`F12`) → Console tab
6. **Look for logs:**
   ```
   🔍 [Home] Starting to fetch jobs...
   🌐 [Home] API Base URL: https://job-finder-bice-eta.vercel.app
   ```

---

## 🚨 Common Localhost Cache Issues

### Issue 1: API Still Calling Localhost

**Symptom:**
```
Network tab shows:
❌ GET http://localhost:3100/api/jobs (failed)
```

**Fix:**
1. Clear browser cache completely
2. Verify `VITE_API_URL` is set in Vercel
3. Verify frontend is redeployed
4. Use incognito/private window to test

---

### Issue 2: Token Points to Localhost

**Symptom:**
- Can't login on production
- Old user data shows up
- Auth errors

**Fix:**
```javascript
// In browser console
localStorage.removeItem('token');
localStorage.removeItem('user');
location.reload();
```

Then login again on production.

---

### Issue 3: Mixed Content (Localhost + Production)

**Symptom:**
- Some API calls work, some fail
- Inconsistent behavior
- Console shows mixed URLs

**Fix:**
1. Close ALL tabs with your app
2. Clear all site data (Method 3 above)
3. Clear DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```
4. Restart browser
5. Visit production URL in **incognito mode** first

---

## 🔧 Force Fresh Start

If nothing works, **nuclear option:**

### Chrome/Edge/Brave:
1. Go to `chrome://settings/siteData`
2. Search for your domain
3. Click trash icon to delete
4. Or delete localhost entries
5. Restart browser

### Firefox:
1. Go to `about:preferences#privacy`
2. Cookies and Site Data → Manage Data
3. Search for your domain
4. Remove
5. Restart browser

---

## ✅ Verification Checklist

After cleanup, verify:

- [ ] Browser console shows correct production API URL
- [ ] No localhost references in Network tab
- [ ] LocalStorage is empty (or has only new production tokens)
- [ ] API calls go to production backend
- [ ] Jobs appear on home page
- [ ] No CORS errors
- [ ] Login/logout works correctly

---

## 🎯 Prevention (Best Practices)

### Use Different Browsers for Dev/Prod

- **Chrome** → Development (localhost)
- **Firefox/Edge** → Production testing

This prevents cache conflicts.

### Use Incognito for Production Testing

- No cache
- No stored data
- Fresh environment every time

### Clear Cache After Every Deploy

Add to your deployment checklist:
```
✅ Deploy to Vercel
✅ Clear browser cache
✅ Test in incognito
✅ Verify API calls in Network tab
```

---

## 🆘 Still Having Issues?

### Step 1: Test in Incognito/Private Window

**Chrome:** `Ctrl/Cmd + Shift + N`  
**Firefox:** `Ctrl/Cmd + Shift + P`  
**Safari:** `Cmd + Shift + N`

If it works in incognito but not in normal browser:
→ **It's definitely a cache issue**

### Step 2: Try Different Browser

If works in Firefox but not Chrome:
→ **Chrome has cached localhost data**

### Step 3: Use /api-test Page

Visit: `https://your-frontend.vercel.app/api-test`

This diagnostic page will show:
- Exact API URL being used
- If it's hitting production or localhost
- Any errors

### Step 4: Check Network Tab

1. Open DevTools → Network tab
2. Refresh page
3. Filter by "Fetch/XHR"
4. Look at request URLs

**Good:**
```
✅ GET https://job-finder-bice-eta.vercel.app/api/jobs
```

**Bad:**
```
❌ GET http://localhost:3100/api/jobs
```

---

## 🔍 Debug Commands

Run these in browser console on production:

```javascript
// 1. Check API configuration
console.log('Config:', {
  apiUrl: import.meta.env.VITE_API_URL,
  mode: import.meta.env.MODE,
  prod: import.meta.env.PROD
});

// 2. Clear all app data
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cleared');

// 3. Test API directly
fetch('https://job-finder-bice-eta.vercel.app/api/jobs')
  .then(r => r.json())
  .then(d => console.log('Jobs from backend:', d.count));

// 4. Check for service workers
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    console.log('Service Workers:', registrations.length);
    registrations.forEach(r => r.unregister());
  });
```

---

## 📊 Comparison Table

| Scenario | API URL | Result |
|----------|---------|--------|
| Local Dev | http://localhost:3100 | ✅ Works locally |
| Production (correct) | https://job-finder-bice-eta.vercel.app | ✅ Works |
| Production (cached localhost) | http://localhost:3100 | ❌ Fails (cache issue) |
| Production (no env var) | undefined | ❌ Fails (config issue) |

---

## 💡 Quick Win

**Do this right now:**

1. Visit your **production** URL (not localhost)
2. Press `F12`
3. Go to **Console** tab
4. Type: `localStorage.clear(); location.reload();`
5. Press Enter

Jobs should appear if backend is configured correctly!

---

**Last Updated:** Dec 21, 2025  
**Issue:** Localhost cache interfering with production  
**Solution:** Clear browser cache/storage + verify environment variables
