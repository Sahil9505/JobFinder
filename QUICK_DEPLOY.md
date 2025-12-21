# 🚀 Quick Deployment Reference

## Environment Variables Setup

### Backend (Vercel Dashboard)
```
MONGO_URI=mongodb+srv://job-finder:%40Sahil9505@jobfinder.jpepkiy.mongodb.net/jobfindermain?appName=JobFinder
JWT_SECRET=31385b98ccd53f62ba13085e03635254ae979ca65843d8fc60cefe73f3ecd2aa
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

### Frontend (Vercel Dashboard)
```
VITE_API_URL=https://job-finder-bice-eta.vercel.app
```

## MongoDB Atlas
- **IP Whitelist:** `0.0.0.0/0` (allow all)
- **Connection String:** Already configured ✅

## Quick Test Commands

```bash
# Test backend health
curl https://job-finder-bice-eta.vercel.app/health

# Test jobs API
curl https://job-finder-bice-eta.vercel.app/api/jobs

# Test frontend (browser)
open https://your-frontend.vercel.app
```

## Post-Deploy Checklist
- [ ] Backend deployed and health check passes
- [ ] Frontend deployed and loads
- [ ] Update backend FRONTEND_URL with deployed frontend domain
- [ ] Redeploy backend after FRONTEND_URL update
- [ ] Test user registration
- [ ] Test user login
- [ ] Test job listings
- [ ] Test applications

## Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Add frontend URL to backend FRONTEND_URL env var and redeploy |
| MongoDB connection fails | Check IP whitelist is 0.0.0.0/0 in Atlas |
| API not found | Verify VITE_API_URL is set in frontend Vercel dashboard |
| 401 errors | Clear browser localStorage and login again |

## Files Changed
✅ All hardcoded localhost URLs removed  
✅ Environment variables properly configured  
✅ CORS enhanced for Vercel domains  
✅ Error logging improved  

## Documentation
📖 Full guide: `DEPLOYMENT_GUIDE.md`  
📝 Changes: `FIXES_SUMMARY.md`  

---
**Status:** 🟢 Production Ready  
**Last Updated:** Dec 21, 2025
