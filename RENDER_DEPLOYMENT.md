# 🚀 Render Deployment Guide

Complete step-by-step guide to deploy JobFinder on Render.

## 📋 Prerequisites

- GitHub account with JobFinder repository
- Render account (free tier works perfectly)
- MongoDB Atlas database (already set up)

---

## 🎯 Quick Deployment (5 Minutes)

### Step 1: Push to GitHub

```bash
cd /Users/sahilsharma/Downloads/Engineering/Github/JobFinder
git add .
git commit -m "Add Render configuration"
git push origin main
```

### Step 2: Deploy Using Blueprint (Automated)

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Click "New +" → "Blueprint"**
3. **Connect GitHub Repository**:
   - Search for: `JobFinder`
   - Click "Connect"
4. **Render will automatically detect `render.yaml`**
5. **Set Environment Variables** (click on each service):

#### Backend Environment Variables:
```
MONGO_URI = mongodb+srv://job-finder:<YOUR_PASSWORD>@jobfinder.jpepkiy.mongodb.net/jobfindermain
JWT_SECRET = <generate new secret - see below>
FRONTEND_URL = https://jobfinder-frontend.onrender.com
NODE_ENV = production
```

#### Frontend Environment Variables:
```
VITE_API_URL = https://jobfinder-backend.onrender.com
```

6. **Click "Apply"** - Render will deploy both services automatically!

---

## 🔑 Generate New JWT Secret

**For security, generate a NEW JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as `JWT_SECRET` in Render.

---

## 📝 Manual Deployment (Alternative Method)

If you prefer to deploy services individually:

### Backend Deployment

1. **New Web Service**:
   - Name: `jobfinder-backend`
   - Environment: `Node`
   - Region: `Oregon (US West)`
   - Branch: `main`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`

2. **Add Environment Variables** (Settings → Environment):
   ```
   MONGO_URI = mongodb+srv://job-finder:<YOUR_PASSWORD>@jobfinder.jpepkiy.mongodb.net/jobfindermain
   JWT_SECRET = <your-new-jwt-secret>
   FRONTEND_URL = https://jobfinder-frontend.onrender.com
   NODE_ENV = production
   PORT = 10000
   ```

3. **Set Health Check**:
   - Path: `/health`

4. **Deploy** - Wait for build to complete (~2-3 minutes)

### Frontend Deployment

1. **New Static Site**:
   - Name: `jobfinder-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Plan: `Free`

2. **Add Environment Variable**:
   ```
   VITE_API_URL = https://jobfinder-backend.onrender.com
   ```
   
   ⚠️ **Important**: Replace `jobfinder-backend` with your actual backend service name

3. **Add Redirect Rule** (Settings → Redirects/Rewrites):
   - Source: `/*`
   - Destination: `/index.html`
   - Type: `Rewrite`

4. **Deploy** - Wait for build to complete (~2 minutes)

---

## ✅ Verify Deployment

### 1. Test Backend

Open in browser:
```
https://jobfinder-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-12-21T..."
}
```

Test jobs API:
```
https://jobfinder-backend.onrender.com/api/jobs
```

Expected: JSON array with 23 jobs

### 2. Test Frontend

Open in browser:
```
https://jobfinder-frontend.onrender.com
```

Expected:
- ✅ Homepage loads with starry background
- ✅ Jobs appear on homepage (9 latest jobs)
- ✅ Navigate to Jobs page - all 23+ jobs load
- ✅ No CORS errors in browser console (F12)

### 3. Check Browser Console

Press F12 → Console tab:
- ✅ No red CORS errors
- ✅ Look for: `✅ Jobs loaded successfully: XX jobs`
- ✅ API calls go to `https://jobfinder-backend.onrender.com`

---

## 🔧 Important Configuration Notes

### Free Tier Behavior

**Render Free tier spins down after 15 minutes of inactivity:**
- ⚠️ First request after idle: **50 seconds cold start**
- ✅ Subsequent requests: Normal speed (~200ms)
- 💡 Solution: Use UptimeRobot to ping `/health` every 14 minutes

### CORS Configuration

Backend automatically allows:
- `*.onrender.com` domains
- `localhost` for development
- Custom domains set in `FRONTEND_URL`

### Environment Variables

**Frontend (VITE_API_URL)**:
- ✅ Correct: `https://jobfinder-backend.onrender.com`
- ❌ Wrong: `https://jobfinder-backend.onrender.com/api`

**Backend (FRONTEND_URL)**:
- Can include multiple domains: `https://jobfinder-frontend.onrender.com,https://custom-domain.com`

---

## 🐛 Troubleshooting

### Issue: "No jobs available" on frontend

**Solution 1**: Check environment variables
```bash
# Frontend must have VITE_API_URL set correctly
# Go to Render Dashboard → jobfinder-frontend → Environment
# Verify: VITE_API_URL = https://jobfinder-backend.onrender.com
```

**Solution 2**: Clear browser cache
```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**Solution 3**: Check backend logs
- Go to: Render Dashboard → jobfinder-backend → Logs
- Look for: Database connection errors or CORS issues

### Issue: CORS errors in browser

**Check**:
1. Backend logs show your frontend origin
2. `FRONTEND_URL` environment variable includes your frontend URL
3. Backend service is running (check Render dashboard)

**Fix**:
```bash
# Update FRONTEND_URL in backend environment variables:
FRONTEND_URL = https://jobfinder-frontend.onrender.com
```

### Issue: 503 Service Unavailable

**Cause**: Free tier cold start (service was idle)

**Solution**: Wait 50 seconds and refresh. Service is starting up.

### Issue: Build Failed

**Check build logs in Render dashboard**:
- Missing dependencies? Run `npm install` locally first
- Node version mismatch? Add `.node-version` file with `18`
- Environment variables missing during build? Add them before deploying

---

## 📊 Monitoring Your App

### Keep Free Tier Active (Optional)

Use **UptimeRobot** (free):
1. Sign up: https://uptimerobot.com
2. Add Monitor:
   - Type: HTTP(s)
   - URL: `https://jobfinder-backend.onrender.com/health`
   - Interval: 14 minutes
3. Your backend stays warm 24/7!

### Check Logs

**Backend logs**:
```
Render Dashboard → jobfinder-backend → Logs
```

**Frontend logs**:
```
Browser Console (F12) → Console tab
```

---

## 🔒 Security Checklist

- ✅ New JWT_SECRET generated (not from local .env)
- ✅ MongoDB password rotated (changed from local .env)
- ✅ `.env` files NOT committed to git
- ✅ All secrets stored in Render Environment Variables
- ✅ CORS configured to allow only your domains

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Backend health endpoint returns `{"status":"OK"}`
- [ ] Backend jobs API returns 23+ jobs
- [ ] Frontend loads with starry background
- [ ] Homepage shows 9 latest jobs
- [ ] Jobs page shows all jobs with filters
- [ ] No CORS errors in browser console
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can view job details
- [ ] Profile page loads (if logged in)

---

## 📞 Need Help?

1. **Check logs first**: Render Dashboard → Your Service → Logs
2. **Check browser console**: F12 → Console tab
3. **Verify environment variables**: Settings → Environment
4. **Test backend directly**: Use curl or Postman

---

## 🚀 Your URLs

After deployment, your app will be available at:

- **Frontend**: `https://jobfinder-frontend.onrender.com`
- **Backend API**: `https://jobfinder-backend.onrender.com`
- **API Health**: `https://jobfinder-backend.onrender.com/health`
- **Jobs API**: `https://jobfinder-backend.onrender.com/api/jobs`

**Note**: Replace `jobfinder-frontend` and `jobfinder-backend` with your actual service names if different.

---

## ⚡ Quick Commands Reference

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test backend locally
node test-backend.js https://jobfinder-backend.onrender.com

# Push updates to Render
git add .
git commit -m "Update application"
git push origin main
# Render auto-deploys on git push!

# Clear browser cache (in browser console)
localStorage.clear(); sessionStorage.clear(); location.reload();
```

---

## 💡 Pro Tips

1. **Auto-Deploy**: Render automatically deploys when you push to GitHub
2. **Custom Domain**: Add your domain in Render → Settings → Custom Domain
3. **Upgrade Plan**: Need faster cold starts? Upgrade to paid plan ($7/month)
4. **Environment Groups**: Share env vars across services (Dashboard → Environment Groups)
5. **Pull Request Previews**: Enable PR previews for testing before merge

---

🎊 **Deployment Complete!** Your JobFinder app is now live on Render!
