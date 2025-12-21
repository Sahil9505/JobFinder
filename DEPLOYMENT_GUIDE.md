# JobNest - Vercel Deployment Guide

## 🚀 Complete Deployment Steps

### Prerequisites
- A [Vercel](https://vercel.com) account (sign up with GitHub)
- Your MongoDB Atlas connection string
- GitHub account (recommended for easy deployment)

---

## Part 1: Deploy Backend (API) to Vercel

### Step 1: Prepare Backend for Deployment

Your backend is already configured! The following files have been created:
- ✅ `backend/vercel.json` - Vercel configuration
- ✅ `backend/.gitignore` - Files to ignore
- ✅ Updated `server.js` to support serverless deployment

### Step 2: Create a Git Repository (if not already done)

```bash
# Navigate to backend folder
cd backend

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Backend ready for deployment"
```

### Step 3: Push to GitHub

1. Go to [GitHub](https://github.com) and create a new repository named `jobnest-backend`
2. Don't initialize with README (we already have files)
3. Copy the commands from GitHub and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/jobnest-backend.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy Backend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New" → "Project"**
3. **Import your GitHub repository** (jobnest-backend)
4. Configure project:
   - **Framework Preset:** Other
   - **Root Directory:** Leave empty (or specify `backend` if deploying from root)
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty

5. **Add Environment Variables** (Very Important!):
   Click "Environment Variables" and add:
   
   ```
   MONGO_URI = your_mongodb_connection_string_here
   JWT_SECRET = your_jwt_secret_key_here
   NODE_ENV = production
   FRONTEND_URL = https://YOUR-FRONTEND-URL.vercel.app
   ```
   
   **Note:** You'll update `FRONTEND_URL` after deploying frontend

6. Click **"Deploy"**
7. Wait for deployment to complete (2-3 minutes)
8. **Copy your backend URL** (e.g., `https://jobnest-backend.vercel.app`)

### Step 5: Test Your Backend

Visit: `https://your-backend-url.vercel.app/`

You should see: "Hello! This is a test message from the Express server."

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Configuration

1. Open `frontend/.env.production` file
2. Replace the API URL with your deployed backend URL:

```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

**Example:**
```env
VITE_API_URL=https://jobnest-backend.vercel.app/api
```

### Step 2: Create Git Repository for Frontend

```bash
# Navigate to frontend folder
cd frontend

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Frontend ready for deployment"
```

### Step 3: Push Frontend to GitHub

1. Create another repository on GitHub named `jobnest-frontend`
2. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/jobnest-frontend.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New" → "Project"**
3. **Import** `jobnest-frontend` repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** Leave empty
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

5. **Environment Variables:** (Add if needed)
   ```
   VITE_API_URL = https://your-backend-url.vercel.app/api
   ```

6. Click **"Deploy"**
7. Wait for deployment (2-3 minutes)
8. **Copy your frontend URL** (e.g., `https://jobnest-frontend.vercel.app`)

### Step 5: Update Backend CORS Settings

1. Go back to your **backend Vercel project**
2. Go to **Settings → Environment Variables**
3. Update `FRONTEND_URL` with your actual frontend URL:
   ```
   FRONTEND_URL = https://your-frontend-url.vercel.app
   ```
4. Go to **Deployments** tab
5. Click the three dots (...) on the latest deployment
6. Click **"Redeploy"** to apply the changes

---

## Part 3: Configure Backend CORS (Important!)

Update your backend `server.js` CORS configuration:

```javascript
// Enable CORS with specific origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

If this is not already in place, update it, commit, and push:

```bash
cd backend
git add .
git commit -m "Update CORS configuration"
git push
```

Vercel will automatically redeploy your backend.

---

## ✅ Verification Checklist

After deployment, test these:

- [ ] Backend API is accessible (visit root URL)
- [ ] Frontend loads correctly
- [ ] Can register a new user
- [ ] Can login with created user
- [ ] Can view jobs list
- [ ] Can view job details
- [ ] Can apply for a job
- [ ] Can view applications
- [ ] Profile page works
- [ ] Profile image upload works
- [ ] No CORS errors in browser console

---

## 🔧 Troubleshooting

### Issue: CORS Errors

**Solution:**
1. Make sure `FRONTEND_URL` environment variable is set correctly in backend
2. Verify CORS configuration in `server.js`
3. Redeploy backend after changes

### Issue: API Calls Failing

**Solution:**
1. Check `VITE_API_URL` in frontend `.env.production`
2. Verify backend is deployed and accessible
3. Check browser Network tab for actual API URLs being called

### Issue: Environment Variables Not Working

**Solution:**
1. Go to Vercel Project Settings → Environment Variables
2. Make sure all variables are added for "Production" environment
3. Redeploy the project after adding variables

### Issue: MongoDB Connection Failed

**Solution:**
1. Verify `MONGO_URI` in backend environment variables
2. Check MongoDB Atlas:
   - Network Access: Add `0.0.0.0/0` to whitelist all IPs
   - Database User: Verify username and password
3. Make sure connection string is properly URL-encoded

### Issue: Images Not Loading

**Solution:**
1. File uploads don't persist on Vercel (serverless)
2. You need to use a cloud storage service:
   - **Cloudinary** (recommended, free tier available)
   - **AWS S3**
   - **Azure Blob Storage**

For Cloudinary integration:
```bash
npm install cloudinary multer-storage-cloudinary
```

### Issue: Build Failed

**Solution:**
1. Check the build logs in Vercel dashboard
2. Make sure all dependencies are in `package.json`
3. Test build locally: `npm run build`

---

## 📝 Alternative: Deploy Both from Single Repository

If you prefer to deploy from a single repository:

1. Keep your current folder structure
2. Create a repository with both folders
3. Deploy backend: Set root directory to `backend`
4. Deploy frontend: Set root directory to `frontend`

---

## 🎉 Your Deployed URLs

After successful deployment, you'll have:

- **Backend API:** `https://jobnest-backend.vercel.app`
- **Frontend:** `https://jobnest-frontend.vercel.app`

You can also add **custom domains** in Vercel project settings!

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to GitHub
2. **Use strong JWT secret** (generate new one for production)
3. **Limit MongoDB Atlas IP whitelist** (optional, for extra security)
4. **Use HTTPS only** (Vercel provides this automatically)
5. **Enable rate limiting** (add in future updates)

---

## 📱 Sharing Your App

Once deployed, you can share your frontend URL with anyone:
- Add it to your resume
- Share on LinkedIn
- Include in your portfolio
- Submit for internship applications

---

## 🚨 Important Notes

1. **File Uploads:** Vercel serverless functions don't support persistent file storage. Profile images and resumes uploaded will be lost on redeploy. Consider using Cloudinary or AWS S3.

2. **Database Seeding:** The auto-seed function in `server.js` runs on every serverless function cold start. Consider moving seed logic to a separate script you run once.

3. **MongoDB Atlas:** Make sure your IP whitelist allows connections from anywhere (0.0.0.0/0) since Vercel uses dynamic IPs.

4. **Free Tier Limits:** 
   - Vercel: 100GB bandwidth, 100 builds per day
   - MongoDB Atlas: 512MB storage (Free tier)

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/)
- [Cloudinary for Images](https://cloudinary.com/documentation)

---

**Need help?** Check the Vercel deployment logs or the browser console for detailed error messages.

**Good luck with your deployment! 🎉**
