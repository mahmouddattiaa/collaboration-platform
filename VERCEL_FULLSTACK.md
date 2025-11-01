# 🚀 Deploy Full Stack to Vercel

## ⚠️ Important Notice

**WebSocket/Socket.io features have been disabled** for Vercel deployment since Vercel's serverless functions don't support persistent connections.

### Features That Will NOT Work:

- ❌ Real-time chat
- ❌ Live presence indicators
- ❌ Real-time whiteboard collaboration
- ❌ Instant notifications

### Features That WILL Work:

- ✅ User authentication (login/register)
- ✅ Room creation and management
- ✅ API endpoints
- ✅ Database operations
- ✅ File uploads (with configuration)

---

## 📋 Prerequisites

1. Vercel account: https://vercel.com/signup
2. MongoDB Atlas: https://mongodb.com/cloud/atlas
3. GitHub repository with your code

---

## 🗄️ Step 1: Set Up MongoDB Atlas

1. Create a FREE cluster at https://mongodb.com/cloud/atlas
2. Create database user
3. Network Access → Add `0.0.0.0/0` (allow all)
4. Get connection string:
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/collaboration?retryWrites=true&w=majority
   ```

---

## 🔧 Step 2: Configure Backend for Vercel

The backend has already been configured with Socket.io commented out. Verify these changes in `collaboration-server/src/server.js`:

- ✅ Socket.io imports commented out
- ✅ HTTP server replaced with Express only
- ✅ Socket event handlers commented out
- ✅ App exported for Vercel serverless
- ✅ Local server only starts when not on Vercel

---

## 🚀 Step 3: Deploy Backend to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Project Name**: `collaboration-backend`
   - **Root Directory**: `collaboration-server`
   - **Framework Preset**: Other
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
4. **Environment Variables** (Settings → Environment Variables):
   ```
   MONGODB_URL=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/collaboration
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
   NODE_ENV=production
   VERCEL=1
   ```
5. Click **Deploy**
6. Save your backend URL: `https://collaboration-backend.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to backend
cd collaboration-server

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Add environment variables
vercel env add MONGODB_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV
vercel env add VERCEL

# Redeploy with env vars
vercel --prod
```

---

## 🎨 Step 4: Update Frontend Configuration

Edit `collaboration-frontend/src/config/api.ts`:

```typescript
const isProduction = import.meta.env.PROD;
const BACKEND_URL = isProduction
  ? "https://your-backend.vercel.app" // Your Vercel backend URL
  : "http://localhost:3001";

export const API_BASE_URL = BACKEND_URL;
export const COLLAB_BASE_URL = BACKEND_URL;
// Socket URL won't be used since WebSockets are disabled
export const SOCKET_URL = BACKEND_URL;
```

Commit and push:

```bash
git add .
git commit -m "Update API URLs for Vercel backend"
git push
```

---

## 🌐 Step 5: Deploy Frontend to Vercel

### Using Vercel Dashboard:

1. Go to https://vercel.com/new
2. Import your GitHub repository (again, for frontend)
3. Configure:
   - **Project Name**: `collaboration-frontend`
   - **Root Directory**: `collaboration-frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Environment Variables (optional):
   ```
   VITE_API_URL=https://your-backend.vercel.app
   ```
5. Click **Deploy**
6. Your frontend URL: `https://collaboration-frontend.vercel.app`

### Using Vercel CLI:

```bash
cd collaboration-frontend
vercel --prod
```

---

## 🔐 Step 6: Update CORS

Edit `collaboration-server/src/server.js` and update CORS origins:

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://collaboration-frontend.vercel.app", // Your frontend URL
      "https://*.vercel.app", // All Vercel preview deployments
    ],
    credentials: true,
  })
);
```

Commit and push:

```bash
git add .
git commit -m "Add Vercel frontend URL to CORS"
git push
```

Vercel will auto-redeploy your backend!

---

## ✅ Step 7: Test Your Deployment

Visit your frontend URL: `https://collaboration-frontend.vercel.app`

### Working Features:

- ✅ User registration
- ✅ User login
- ✅ Create rooms
- ✅ Join rooms
- ✅ View rooms list
- ✅ API calls
- ✅ Database operations

### Not Working (Expected):

- ❌ Real-time chat (Socket.io disabled)
- ❌ Live presence
- ❌ Real-time updates
- ❌ WebSocket features

---

## 🔄 Auto Deployments

Vercel automatically deploys on every push:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Both frontend and backend auto-deploy!
```

---

## 🌐 Custom Domains

### For Frontend:

1. Vercel Dashboard → Your Frontend Project → Settings → Domains
2. Add: `www.myapp.com`
3. Configure DNS as instructed

### For Backend:

1. Vercel Dashboard → Your Backend Project → Settings → Domains
2. Add: `api.myapp.com`
3. Configure DNS
4. Update frontend config with new backend URL

---

## 📊 Environment Variables Management

### View Variables:

```bash
vercel env ls
```

### Add Variable:

```bash
vercel env add VARIABLE_NAME
```

### Remove Variable:

```bash
vercel env rm VARIABLE_NAME
```

After adding/removing variables, redeploy:

```bash
vercel --prod
```

---

## 🐛 Troubleshooting

### Backend: "Cannot find module"

**Solution**: Make sure all dependencies are in `package.json`:

```bash
cd collaboration-server
npm install --save express mongoose cors dotenv helmet compression express-rate-limit
```

### Backend: MongoDB connection timeout

**Solution**:

1. Check MongoDB IP whitelist includes `0.0.0.0/0`
2. Verify connection string in Vercel env variables
3. Make sure user credentials are correct

### Frontend: Blank page

**Solution**:

1. Check browser console for errors
2. Verify build succeeded in Vercel dashboard
3. Check API URL is correct in config

### CORS errors

**Solution**: Add your Vercel URLs to CORS in backend:

```javascript
origin: ["https://your-frontend.vercel.app", "https://*.vercel.app"];
```

### API calls failing

**Solution**:

1. Verify backend deployed successfully
2. Check backend URL in frontend config
3. Test backend directly: `https://your-backend.vercel.app/health`

---

## ⚙️ Project Structure

```
collaboration-platform/
├── collaboration-frontend/
│   ├── vercel.json          ✅ Configured
│   └── src/
│       └── config/
│           └── api.ts       ⚠️ Update backend URL
├── collaboration-server/
│   ├── vercel.json          ✅ Created
│   └── src/
│       └── server.js        ✅ Socket.io commented out
```

---

## 💡 Alternative: Enable Real-time Features

If you need real-time features, consider:

### Option 1: Backend on Render + Frontend on Vercel

- Deploy backend to Render.com (supports WebSockets)
- Keep frontend on Vercel
- **Guide**: See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

### Option 2: Backend on Railway + Frontend on Vercel

- Deploy backend to Railway.app (supports WebSockets)
- Keep frontend on Vercel
- Similar setup to Render

### Option 3: Use Pusher/Ably for Real-time

- Replace Socket.io with Pusher Channels
- Works with Vercel serverless
- Requires code refactoring

---

## 📚 Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Node Runtime**: https://vercel.com/docs/runtimes#official-runtimes/node-js
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Alternative Guide** (with WebSockets): [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

---

## 🎯 Summary

✅ **Pros**:

- Everything on one platform
- Super fast global CDN
- Automatic deployments
- Free tier generous

❌ **Cons**:

- No WebSocket support
- No real-time features
- Serverless limitations

**Recommendation**: For this collaboration platform that heavily relies on real-time features, consider deploying backend to Render/Railway instead of Vercel.

---

## 📝 Deployment Checklist

- [ ] MongoDB cluster created
- [ ] Backend Socket.io code commented out
- [ ] Backend vercel.json created
- [ ] Backend deployed to Vercel
- [ ] Backend environment variables set
- [ ] Backend URL saved
- [ ] Frontend API config updated
- [ ] Frontend deployed to Vercel
- [ ] CORS updated with Vercel URLs
- [ ] Tested authentication
- [ ] Tested API endpoints
- [ ] Documented limitations (no real-time)

---

**Need Real-time Features?** See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for the recommended Vercel (Frontend) + Render (Backend) setup!
