# 🚀 Quick Deployment Steps to Vercel

## ✅ Pre-Deployment Checklist

Before we start, make sure you have:

1. **MongoDB Atlas Account** (Free)

   - Sign up: https://www.mongodb.com/cloud/atlas/register
   - Create a cluster
   - Get connection string

2. **Vercel Account** (Free)
   - Sign up: https://vercel.com/signup
   - Connect with GitHub (recommended)

---

## 📋 Step-by-Step Deployment

### Step 1: Set Up MongoDB (If not done yet)

1. Go to https://mongodb.com/cloud/atlas
2. Create FREE cluster
3. Database Access → Add User (save username & password!)
4. Network Access → Add IP: `0.0.0.0/0`
5. Get connection string from "Connect" button
6. Should look like: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/collaboration?retryWrites=true&w=majority`

**Save this string!** You'll need it soon.

---

### Step 2: Login to Vercel

Open your terminal and run:

```bash
vercel login
```

Follow the prompts to login (email or GitHub)

---

### Step 3: Deploy Backend First

```bash
# Navigate to backend folder
cd collaboration-server

# Deploy to Vercel
vercel
```

**During deployment**, Vercel will ask:

1. **Set up and deploy?** → Yes
2. **Which scope?** → Choose your account
3. **Link to existing project?** → No
4. **Project name?** → `collaboration-backend` (or your choice)
5. **Directory?** → `.` (current directory)
6. **Override settings?** → No

Vercel will give you a **Preview URL** like: `https://collaboration-backend-xxx.vercel.app`

**Don't use this yet!** We need to deploy to production.

---

### Step 4: Add Environment Variables to Backend

Now add your environment variables:

```bash
# Still in collaboration-server folder

# Add MongoDB URL
vercel env add MONGODB_URL
# Paste your MongoDB connection string when prompted
# Choose: Production, Preview, Development (select all)

# Add JWT Secret (use a long random string)
vercel env add JWT_SECRET
# Paste a random string (at least 32 characters)
# You can generate one at: https://randomkeygen.com
# Choose: Production, Preview, Development (select all)

# Add Node Environment
vercel env add NODE_ENV
# Type: production
# Choose: Production only

# Add Vercel flag
vercel env add VERCEL
# Type: 1
# Choose: Production, Preview, Development (select all)
```

---

### Step 5: Deploy Backend to Production

```bash
# Still in collaboration-server
vercel --prod
```

This will deploy your backend to production!

**Save the production URL!** It will look like: `https://collaboration-backend.vercel.app`

Test it by visiting: `https://your-backend.vercel.app/health`

You should see JSON response with server status.

---

### Step 6: Update Frontend Configuration

Now we need to tell the frontend where the backend is:

Edit: `collaboration-frontend/src/config/api.ts`

Update the backend URL to your production URL:

```typescript
const isProduction = import.meta.env.PROD;
const BACKEND_URL = isProduction
  ? "https://collaboration-backend.vercel.app" // YOUR BACKEND URL HERE
  : "http://localhost:3001";

export const API_BASE_URL = BACKEND_URL;
export const COLLAB_BASE_URL = BACKEND_URL;
export const SOCKET_URL = BACKEND_URL;
```

**Save the file!**

Commit this change:

```bash
# Go back to root
cd ..

# Commit the change
git add .
git commit -m "Update API URLs for production"
git push
```

---

### Step 7: Deploy Frontend

```bash
# Navigate to frontend folder
cd collaboration-frontend

# Deploy to Vercel
vercel
```

**During deployment**, Vercel will ask:

1. **Set up and deploy?** → Yes
2. **Which scope?** → Choose your account
3. **Link to existing project?** → No
4. **Project name?** → `collaboration-frontend` (or your choice)
5. **Directory?** → `.` (current directory)
6. **Override settings?** → No
7. **Build Command?** → `npm run build` (should auto-detect)
8. **Output Directory?** → `dist` (should auto-detect)
9. **Development Command?** → `npm run dev` (should auto-detect)

Again, you'll get a preview URL. Now deploy to production:

```bash
vercel --prod
```

**Save the production URL!** Like: `https://collaboration-frontend.vercel.app`

---

### Step 8: Update CORS in Backend

Now we need to allow the frontend to access the backend.

Edit: `collaboration-server/src/server.js`

Find the CORS section (around line 76) and update:

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://collaboration-frontend.vercel.app", // ADD YOUR FRONTEND URL
      "https://*.vercel.app", // Allow all Vercel preview deployments
    ],
    credentials: true,
  })
);
```

**Save the file!**

Commit and redeploy backend:

```bash
# Go back to root
cd ..

# Commit changes
git add .
git commit -m "Add frontend URL to CORS"
git push

# Redeploy backend
cd collaboration-server
vercel --prod
```

---

## ✅ Testing Your Deployment

Visit your frontend URL: `https://collaboration-frontend.vercel.app`

Test these features:

### ✅ Should Work:

- User registration
- User login
- Create room
- View rooms
- API calls
- JWT authentication

### ❌ Won't Work (Expected):

- Real-time chat (WebSockets disabled)
- Live presence
- Real-time updates

---

## 🎉 You're Live!

Your app is now deployed on Vercel!

- **Frontend**: https://your-frontend.vercel.app
- **Backend**: https://your-backend.vercel.app

### Vercel Dashboard:

- View deployments: https://vercel.com/dashboard
- Check logs for debugging
- Monitor performance
- Set up custom domains

---

## 🔄 Future Updates

Every time you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push
```

Then redeploy:

```bash
# For backend
cd collaboration-server
vercel --prod

# For frontend
cd collaboration-frontend
vercel --prod
```

Or connect to GitHub in Vercel Dashboard for **automatic deployments**!

---

## 🐛 Troubleshooting

### Backend deployment fails:

- Check all environment variables are set
- Verify MongoDB connection string is correct
- Check Vercel logs: `vercel logs`

### Frontend can't connect to backend:

- Verify backend URL in `api.ts`
- Check CORS includes frontend URL
- Test backend health: `https://your-backend.vercel.app/health`

### MongoDB connection error:

- Check IP whitelist includes `0.0.0.0/0`
- Verify connection string format
- Check user credentials

---

## 🌐 Optional: Add Custom Domain

1. Buy a domain (Namecheap, Google Domains, etc.)
2. Vercel Dashboard → Project → Settings → Domains
3. Add your domain
4. Update DNS records as instructed
5. Automatic HTTPS in minutes!

---

## 📊 Monitor Your App

- **Vercel Analytics**: Automatically enabled
- **Logs**: `vercel logs` or dashboard
- **Performance**: Check Vercel dashboard

---

**Need help?** Check:

- [VERCEL_FULLSTACK.md](./VERCEL_FULLSTACK.md) - Detailed guide
- [WEBSOCKET_DISABLED.md](./WEBSOCKET_DISABLED.md) - Feature limitations
- Vercel Docs: https://vercel.com/docs

---

**Ready to start? Run:** `vercel login`
