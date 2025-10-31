# 🚀 Deploy to Vercel - Quick Guide

## ⚡ Deploy Your Collaboration Platform on Vercel (15 Minutes)

Vercel offers excellent performance, automatic HTTPS, and instant deployments!

---

## 📋 What You'll Need

1. **Vercel Account**: https://vercel.com/signup (FREE)
2. **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register (FREE)
3. **GitHub Account**: https://github.com/signup (FREE)

---

## 🎯 Architecture Overview

- **Frontend**: Vercel (Static Site)
- **Backend**: Vercel (Serverless Functions) OR Render/Railway
- **Database**: MongoDB Atlas

> **Note**: Vercel is optimized for frontend and serverless functions. For persistent WebSocket connections (Socket.io), we recommend hosting the backend on Render or Railway.

---

## 🚀 Option 1: Frontend on Vercel + Backend on Render (Recommended)

### **Step 1: Set Up MongoDB** (3 minutes)

1. Go to MongoDB Atlas → Create FREE cluster
2. Create database user (save credentials!)
3. Network Access → Add IP: `0.0.0.0/0` (allow all)
4. Get connection string:
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/collaboration?retryWrites=true&w=majority
   ```

---

### **Step 2: Push to GitHub** (2 minutes)

```bash
# If not already done
git remote add origin https://github.com/YOUR_USERNAME/collaboration-platform.git
git branch -M main
git push -u origin main
```

---

### **Step 3: Deploy Backend to Render** (3 minutes)

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `collaboration-backend`
   - **Root Directory**: `collaboration-server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   ```
   MONGODB_URL=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/collaboration
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   NODE_ENV=production
   PORT=10000
   ```
5. Click **Create Web Service**
6. **Save your backend URL**: `https://collaboration-backend.onrender.com`

---

### **Step 4: Update Frontend Config** (2 minutes)

Edit `collaboration-frontend/src/config/api.ts`:

```typescript
// Update these URLs with your backend URL
const isProduction = import.meta.env.PROD;
const BACKEND_URL = isProduction 
  ? "https://your-backend.onrender.com"  // Your Render backend URL
  : "http://localhost:3001";

export const API_BASE_URL = BACKEND_URL;
export const COLLAB_BASE_URL = BACKEND_URL;
export const SOCKET_URL = BACKEND_URL;
```

Commit and push:
```bash
git add .
git commit -m "Configure production API URLs"
git push
```

---

### **Step 5: Deploy Frontend to Vercel** (3 minutes)

1. Go to https://vercel.com → New Project
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `collaboration-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Environment Variables (if needed):
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. Click **Deploy**
6. Wait 1-2 minutes...
7. **Your frontend is live!** `https://collaboration-platform.vercel.app`

---

### **Step 6: Update Backend CORS** (2 minutes)

Edit `collaboration-server/src/server.js` and add your Vercel URL to CORS:

```javascript
// Socket.io CORS (around line 26)
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://your-project.vercel.app",           // Add this
      "https://your-project-git-main.vercel.app",  // Add this
      "https://*.vercel.app",                      // Allow all Vercel preview deployments
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Express CORS (around line 76)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://your-project.vercel.app",
      "https://your-project-git-main.vercel.app",
      "https://*.vercel.app",
    ],
    credentials: true,
  })
);
```

Push changes:
```bash
git add .
git commit -m "Add Vercel URLs to CORS"
git push
```

Render will auto-redeploy your backend!

---

## 🎉 Done! Test Your Deployment

Visit: `https://your-project.vercel.app`

Test all features:
- ✅ User registration/login
- ✅ Create and join rooms
- ✅ Real-time chat
- ✅ Whiteboard
- ✅ File sharing
- ✅ Task management

---

## 🚀 Option 2: Full Stack on Vercel (Experimental)

> **Warning**: Socket.io persistent connections may not work reliably with Vercel's serverless functions. Use Option 1 for production.

### Convert Backend to Vercel Serverless

1. **Create `vercel.json` in project root**:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "collaboration-frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "collaboration-server/src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "collaboration-server/src/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "collaboration-frontend/$1"
    }
  ]
}
```

2. **Modify `collaboration-server/src/server.js`**:

```javascript
// Export for Vercel serverless
module.exports = app;

// Only start server if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

3. **Deploy**:
```bash
vercel --prod
```

**Note**: This approach has limitations with WebSocket connections.

---

## 🔧 Vercel Configuration Files

### `collaboration-frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🌐 Environment Variables on Vercel

### Frontend (Vercel Dashboard → Settings → Environment Variables):

```
VITE_API_URL=https://your-backend.onrender.com
```

### Backend (If on Vercel):

```
MONGODB_URL=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

---

## 🔄 Automatic Deployments

Vercel automatically deploys:
- ✅ **Production**: Every push to `main` branch
- ✅ **Preview**: Every pull request
- ✅ **Instant**: No waiting, deploys in seconds

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel auto-deploys in ~30 seconds!
```

---

## 🎨 Custom Domain on Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `mycollabapp.com`
3. Update DNS records (Vercel provides instructions)
4. Automatic HTTPS in minutes!

**Recommended Domain Registrars**:
- Namecheap: ~$10/year
- Google Domains: ~$12/year
- Cloudflare: ~$10/year

---

## 📊 Monitoring & Analytics

### Built-in Vercel Analytics:

1. Go to Project → Analytics
2. See page views, performance, errors
3. FREE for hobby projects!

### Add Custom Analytics:

```bash
npm install @vercel/analytics
```

In `collaboration-frontend/src/main.tsx`:

```typescript
import { inject } from '@vercel/analytics';

inject();
```

---

## ⚡ Performance Optimization

### Enable Edge Network:

Vercel automatically uses:
- ✅ Global CDN
- ✅ Automatic caching
- ✅ Brotli compression
- ✅ Image optimization

### Speed up Backend:

1. **Keep it awake** (for Render):
   - Use UptimeRobot: https://uptimerobot.com
   - Ping every 5 minutes

2. **Use Redis for sessions** (optional):
   - Upstash Redis (free tier): https://upstash.com
   - Add to backend for faster authentication

---

## 🐛 Troubleshooting

### **Frontend builds but shows blank page**:

```bash
# Check build settings
Root Directory: collaboration-frontend
Build Command: npm run build
Output Directory: dist
```

### **API calls failing**:

- Verify backend URL in `api.ts`
- Check CORS includes Vercel domain
- Check backend is running on Render

### **Socket.io not connecting**:

- Ensure backend supports WebSocket upgrades
- Verify CORS allows your Vercel domain
- Check backend logs on Render

### **Environment variables not working**:

- Prefix with `VITE_` for frontend
- Redeploy after adding variables
- Check variables are set in Vercel dashboard

---

## 💰 Pricing

### Free Tier Includes:

**Vercel**:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ Analytics

**MongoDB Atlas**:
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ Perfect for small apps

**Render**:
- ✅ 750 hours/month
- ✅ Automatic deploys
- ✅ HTTPS included

**Total Cost: $0/month** 🎉

---

## 🚀 Advanced: Multi-Environment Setup

### Development, Staging, Production:

```bash
# Create branches
git checkout -b staging
git push -u origin staging

git checkout -b development
git push -u origin development
```

**Vercel automatically creates**:
- `main` → Production: `https://app.vercel.app`
- `staging` → Staging: `https://app-staging.vercel.app`
- `development` → Dev: `https://app-dev.vercel.app`

---

## 📚 Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vite + Vercel**: https://vitejs.dev/guide/static-deploy.html#vercel
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Render Docs**: https://render.com/docs

---

## ✅ Deployment Checklist

Before deploying:

- [ ] MongoDB cluster created and connection string saved
- [ ] Environment variables configured
- [ ] API URLs updated in frontend
- [ ] CORS configured with production URLs
- [ ] Code pushed to GitHub
- [ ] Vercel project created and deployed
- [ ] Backend deployed to Render
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled
- [ ] Tested all features in production

---

## 🎯 Next Steps

1. **Monitor Performance**: Use Vercel Analytics
2. **Set Up Monitoring**: Add error tracking (Sentry)
3. **Add Custom Domain**: Make it professional
4. **Enable Analytics**: Track user behavior
5. **Set Up CI/CD**: Add tests before deployment

---

## 💡 Pro Tips

1. **Use Vercel CLI** for faster deployments:
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Preview Deployments**: Every PR gets a unique URL for testing

3. **Environment Variables**: Use different values for preview vs production

4. **Edge Functions**: Consider migrating some backend logic to Vercel Edge for better performance

5. **Keep Backend Awake**: Use UptimeRobot to ping Render backend every 5 minutes

---

Need help? Check the [Vercel Documentation](https://vercel.com/docs) or open an issue on GitHub!

**Happy Deploying! 🚀✨**
