# JobFinder Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. MongoDB Atlas Setup
- [ ] MongoDB Atlas account created
- [ ] Cluster created and running
- [ ] IP Whitelist set to `0.0.0.0/0` (allow all IPs for serverless)
- [ ] Database user created with read/write permissions
- [ ] Connection string copied

### 2. Backend Environment Variables (Vercel)

Set these environment variables in your Vercel backend project dashboard:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=your_32_character_random_secret_key_here
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

**Important Notes:**
- `MONGO_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `FRONTEND_URL`: Your deployed frontend URL (can be comma-separated for multiple origins)

### 3. Frontend Environment Variables (Vercel)

Set these environment variables in your Vercel frontend project dashboard:

```env
VITE_API_URL=https://your-backend-domain.vercel.app
```

**Important Notes:**
- `VITE_API_URL`: Your deployed backend URL (without `/api` suffix - this is added automatically)

---

## 🚀 Deployment Steps

### Backend Deployment (Vercel)

1. **Push backend code to GitHub**
   ```bash
   cd backend
   git add .
   git commit -m "Backend deployment ready"
   git push
   ```

2. **Deploy to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Set Root Directory to `backend`
   - Add environment variables (see section 2 above)
   - Click "Deploy"

3. **Verify Deployment**
   - Visit `https://your-backend.vercel.app/` - should return API running message
   - Visit `https://your-backend.vercel.app/health` - should return database status

### Frontend Deployment (Vercel)

1. **Update environment file**
   - Edit `frontend/.env.production`
   - Set `VITE_API_URL` to your deployed backend URL

2. **Push frontend code to GitHub**
   ```bash
   cd frontend
   git add .
   git commit -m "Frontend deployment ready"
   git push
   ```

3. **Deploy to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Set Root Directory to `frontend`
   - Framework Preset: Vite
   - Add environment variable: `VITE_API_URL=https://your-backend.vercel.app`
   - Click "Deploy"

4. **Update Backend CORS**
   - After frontend deploys, copy the frontend URL
   - Go to backend Vercel project → Settings → Environment Variables
   - Update `FRONTEND_URL` to include your frontend URL
   - Redeploy backend for changes to take effect

---

## 🔧 Common Issues & Solutions

### Issue 1: "Network Error" or "API not responding"

**Symptoms:** Frontend can't connect to backend
**Solutions:**
- ✅ Verify `VITE_API_URL` is set correctly in Vercel frontend environment variables
- ✅ Verify backend is deployed and accessible at the URL
- ✅ Check browser console for CORS errors
- ✅ Ensure backend `FRONTEND_URL` includes your frontend domain

### Issue 2: CORS Errors

**Symptoms:** "Access to fetch blocked by CORS policy"
**Solutions:**
- ✅ Add your frontend URL to backend `FRONTEND_URL` environment variable
- ✅ Ensure URL format is exact (no trailing slashes)
- ✅ Redeploy backend after changing CORS settings
- ✅ Clear browser cache and try again

### Issue 3: MongoDB Connection Fails

**Symptoms:** "Database connection failed" or timeout errors
**Solutions:**
- ✅ Verify `MONGO_URI` is set correctly in Vercel backend
- ✅ Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- ✅ Verify database user has correct permissions
- ✅ Test connection string locally first
- ✅ Ensure connection string is URL-encoded (special characters)

### Issue 4: JWT/Authentication Errors

**Symptoms:** "Not authorized" or token errors
**Solutions:**
- ✅ Verify `JWT_SECRET` is set in backend environment variables
- ✅ Ensure JWT_SECRET is the same across all backend instances
- ✅ Clear browser localStorage and login again
- ✅ Check token expiry (default is 30 days)

### Issue 5: Profile Images Not Loading

**Symptoms:** Profile images show broken/default avatars
**Solutions:**
- ✅ File uploads are currently stored locally (not compatible with Vercel serverless)
- ✅ Profile images will work in development but may not persist in production
- ✅ **Recommended:** Integrate cloud storage (Cloudinary/AWS S3) for production
- ✅ Fallback to user initials avatar is working correctly

### Issue 6: Resume Upload Fails

**Symptoms:** Application submission fails with file upload
**Solutions:**
- ✅ Resume uploads use `multer.memoryStorage()` (temporary storage)
- ✅ Files are not persisted in serverless environment
- ✅ **Recommended:** Integrate cloud storage for production resume uploads
- ✅ Current workaround: Resume URLs stored but files not accessible

---

## 📊 Monitoring & Debugging

### Check Backend Logs
1. Go to Vercel Dashboard → Your Backend Project
2. Click on "Deployments"
3. Click on the latest deployment
4. Click "View Function Logs"
5. Look for errors or warnings

### Check Frontend Logs
1. Open your deployed frontend in browser
2. Open Browser Developer Tools (F12)
3. Go to Console tab
4. Look for API errors or network issues
5. Go to Network tab to see API request/response details

### Test API Endpoints Directly

**Health Check:**
```bash
curl https://your-backend.vercel.app/health
```

**Get Jobs:**
```bash
curl https://your-backend.vercel.app/api/jobs
```

**Login (test):**
```bash
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"YourPassword123!"}'
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** to GitHub
2. **Use strong JWT_SECRET** (32+ characters, random)
3. **Rotate JWT_SECRET** periodically in production
4. **Enable MongoDB Atlas security**:
   - Network access from `0.0.0.0/0` (required for serverless)
   - Strong database passwords
   - Enable audit logs
5. **Monitor API usage** in Vercel dashboard
6. **Set up Vercel authentication** for production deployments

---

## 📝 Post-Deployment Tasks

- [ ] Test user registration
- [ ] Test user login
- [ ] Test job listing (platform + external)
- [ ] Test job application flow
- [ ] Test company listings
- [ ] Test profile updates (note: image uploads need cloud storage)
- [ ] Monitor error logs for 24-48 hours
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure custom domains (optional)

---

## 🔄 Redeployment

Whenever you make code changes:

1. **Backend changes:**
   ```bash
   cd backend
   git add .
   git commit -m "Your changes"
   git push
   ```
   - Vercel will auto-deploy

2. **Frontend changes:**
   ```bash
   cd frontend
   git add .
   git commit -m "Your changes"
   git push
   ```
   - Vercel will auto-deploy

3. **Environment variable changes:**
   - Update in Vercel Dashboard
   - **Important:** Trigger a new deployment for changes to take effect
   - Click "Deployments" → "..." → "Redeploy"

---

## ☁️ Recommended Cloud Storage Integration (Future)

For production-ready file uploads:

### Option 1: Cloudinary (Recommended for images)
- Free tier: 25GB storage, 25GB bandwidth
- Easy React/Node.js integration
- Automatic image optimization
- CDN delivery

### Option 2: AWS S3
- Pay-as-you-go pricing
- Highly scalable
- More configuration required
- Good for all file types

### Option 3: Vercel Blob Storage
- Native Vercel integration
- Pay-as-you-go
- Easy setup

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review Vercel function logs
3. Check browser console for frontend errors
4. Test API endpoints directly with curl
5. Verify all environment variables are set correctly

---

## ✨ Deployment Status Indicators

**Backend Health:** `https://your-backend.vercel.app/health`  
**Frontend:** `https://your-frontend.vercel.app/`  
**MongoDB:** Check Atlas Dashboard for connection stats

---

**Last Updated:** December 21, 2025  
**Version:** 1.0
