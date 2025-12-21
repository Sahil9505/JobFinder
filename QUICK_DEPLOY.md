# 🚀 Quick Deployment Steps

## Backend Deployment

1. **Create GitHub Repository**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Ready for deployment"
   ```

2. **Push to GitHub**
   - Create repo on GitHub: `jobnest-backend`
   - Push code

3. **Deploy on Vercel**
   - Import GitHub repo
   - Add Environment Variables:
     - `MONGO_URI` (your MongoDB connection string)
     - `JWT_SECRET` (your JWT secret)
     - `NODE_ENV=production`
     - `FRONTEND_URL` (will add after frontend deployment)
   - Deploy
   - **Copy the backend URL**

## Frontend Deployment

1. **Update .env.production**
   ```env
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```

2. **Create GitHub Repository**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Ready for deployment"
   ```

3. **Push to GitHub**
   - Create repo: `jobnest-frontend`
   - Push code

4. **Deploy on Vercel**
   - Import GitHub repo
   - Framework: Vite (auto-detected)
   - Deploy
   - **Copy the frontend URL**

5. **Update Backend**
   - Go to backend Vercel project
   - Settings → Environment Variables
   - Update `FRONTEND_URL` with your frontend URL
   - Redeploy backend

## ✅ Done!

Visit your frontend URL and test the app!

## 📖 Full Guide

For detailed steps and troubleshooting, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
