# ⚡ Vercel Deploy - Quick Reference Card

## 🚀 Super Quick Deploy (5 Commands)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Go to frontend folder
cd collaboration-frontend

# 4. Deploy!
vercel --prod

# 5. Done! Your site is live!
```

---

## 📋 Pre-Deployment Checklist

- [ ] Backend deployed and URL obtained (Render/Railway)
- [ ] Updated `src/config/api.ts` with backend URL
- [ ] Committed and pushed to GitHub
- [ ] MongoDB connection string ready
- [ ] Environment variables prepared

---

## 🔗 Important URLs

**Vercel Dashboard**: https://vercel.com/dashboard  
**Your Projects**: https://vercel.com/your-username  
**Docs**: https://vercel.com/docs

---

## 🎯 Two Ways to Deploy

### Method 1: Vercel Dashboard (Easiest)

1. Go to https://vercel.com
2. Click "New Project"
3. Import GitHub repo
4. Set root: `collaboration-frontend`
5. Click "Deploy"
6. ✅ Done!

### Method 2: Vercel CLI (Faster)

```bash
cd collaboration-frontend
vercel --prod
```

---

## ⚙️ Vercel Project Settings

```
Framework Preset:     Vite
Root Directory:       collaboration-frontend
Build Command:        npm run build
Output Directory:     dist
Install Command:      npm install
Development Command:  npm run dev
```

---

## 🔐 Environment Variables

Add in Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🌐 CORS Configuration

Add to `collaboration-server/src/server.js`:

```javascript
origin: [
  "https://your-project.vercel.app",
  "https://*.vercel.app", // All preview deployments
];
```

---

## 🔄 Redeploy

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel auto-deploys in ~30 seconds!
```

Or manual:

```bash
vercel --prod
```

---

## 🐛 Quick Troubleshooting

**Blank page?**

- Check build succeeded
- Verify `dist` folder is output directory
- Check browser console for errors

**API not working?**

- Verify backend URL in `api.ts`
- Check CORS includes Vercel domain
- Check environment variables set

**Build failing?**

- Check all dependencies in `package.json`
- Verify build command is correct
- Check build logs in Vercel dashboard

---

## 💡 Pro Tips

1. **Preview URLs**: Every git push gets preview URL
2. **Instant Rollback**: Click "Redeploy" on any previous deployment
3. **Custom Domain**: Settings → Domains → Add
4. **Analytics**: Automatically enabled on dashboard
5. **Edge Network**: Auto-optimized globally

---

## 📊 Vercel Free Tier Limits

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Unlimited preview deployments
- ✅ Automatic HTTPS
- ✅ Built-in analytics
- ✅ Edge network

---

## 🎯 Your URLs

After deployment, you'll get:

**Production**: `https://your-project.vercel.app`  
**Dashboard**: `https://vercel.com/your-username/your-project`  
**Preview**: `https://your-project-git-branch.vercel.app`

---

## 🔗 Need More Help?

- **Full Guide**: [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)
- **Platform Comparison**: [DEPLOYMENT_COMPARISON.md](./DEPLOYMENT_COMPARISON.md)
- **Render Guide**: [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

---

**Deploy Now**: `vercel --prod` 🚀
