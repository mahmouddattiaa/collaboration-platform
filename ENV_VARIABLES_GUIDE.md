# 🔐 Environment Variables Setup Guide

## 📝 Backend Environment Variables (Render)

When deploying backend to Render, add these environment variables:

### **Required Variables:**

| Variable Name | Value                                                | How to Get                           |
| ------------- | ---------------------------------------------------- | ------------------------------------ |
| `MONGODB_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` | MongoDB Atlas connection string      |
| `JWT_SECRET`  | Random secure string (min 32 chars)                  | Generate at https://randomkeygen.com |
| `NODE_ENV`    | `production`                                         | Set manually                         |
| `PORT`        | `4001`                                               | Set manually                         |

### **Optional Variables:**

| Variable Name  | Value             | Purpose            |
| -------------- | ----------------- | ------------------ |
| `FRONTEND_URL` | Your frontend URL | CORS configuration |

---

## 🔑 How to Generate JWT_SECRET

### **Method 1: RandomKeygen (Easiest)**

1. Go to https://randomkeygen.com
2. Copy a "Fort Knox Password" (256-bit key)
3. Use that as your JWT_SECRET

### **Method 2: Node.js Command**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Method 3: OpenSSL**

```bash
openssl rand -base64 32
```

---

## 📋 MongoDB Connection String Format

### **Template:**

```
mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/<DATABASE>?retryWrites=true&w=majority
```

### **Example:**

```
mongodb+srv://collabadmin:MySecurePass123@collabcluster.abc123.mongodb.net/collaboration?retryWrites=true&w=majority
```

### **Components:**

- `<USERNAME>`: Your database username (e.g., `collabadmin`)
- `<PASSWORD>`: Your database user password
- `<CLUSTER>`: Your MongoDB cluster address
- `<DATABASE>`: Database name (e.g., `collaboration`)

### **Important:**

- ⚠️ Replace `<password>` with actual password (remove angle brackets)
- ⚠️ URL-encode special characters in password
- ⚠️ Don't share this string publicly

---

## 🎨 Frontend Environment Variables (Optional)

If you need environment variables in frontend, create `.env` file:

### **For Local Development:**

Create `collaboration-frontend/.env.local`:

```env
VITE_API_URL=http://localhost:4001
VITE_SOCKET_URL=http://localhost:4001
```

### **For Production:**

In Render Static Site, add environment variables:

| Variable Name     | Value            |
| ----------------- | ---------------- |
| `VITE_API_URL`    | Your backend URL |
| `VITE_SOCKET_URL` | Your backend URL |

**Note:** Vite environment variables must start with `VITE_`

---

## 🔧 Render Deployment Settings

### **Backend (Web Service) Settings:**

```yaml
Name: collaboration-backend
Root Directory: collaboration-server
Environment: Node
Branch: master
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### **Frontend (Static Site) Settings:**

```yaml
Name: collaboration-frontend
Root Directory: collaboration-frontend
Branch: master
Build Command: npm install && npm run build
Publish Directory: dist
```

---

## 📝 Complete Backend .env File Example

Create `collaboration-server/.env` (for local development):

```env
# MongoDB Connection
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/collaboration?retryWrites=true&w=majority

# JWT Secret (use strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters_long

# Server Configuration
PORT=4001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## ⚠️ Security Best Practices

### **DO:**

✅ Use strong random JWT_SECRET (minimum 32 characters)
✅ Keep .env files in .gitignore
✅ Use different secrets for development and production
✅ Rotate secrets periodically
✅ Use environment-specific configurations

### **DON'T:**

❌ Commit .env files to Git
❌ Share secrets publicly
❌ Use weak or predictable secrets
❌ Reuse secrets across projects
❌ Hardcode secrets in code

---

## 🧪 Testing Environment Variables

### **Backend Test:**

1. Deploy backend to Render
2. Visit: `https://your-backend.onrender.com/health`
3. Should show: `{ ok: true, environment: "production" }`

### **MongoDB Test:**

1. In Render backend logs, look for:
   ```
   ✅ MongoDB Connected successfully
   ```
2. No connection errors

### **JWT Test:**

1. Try registering a user
2. If successful, JWT_SECRET is working

---

## 🐛 Troubleshooting Environment Variables

### **MongoDB Connection Fails:**

**Check:**

- [ ] Connection string format is correct
- [ ] Username and password are correct
- [ ] Special characters in password are URL-encoded
- [ ] IP whitelist includes 0.0.0.0/0
- [ ] Database user has correct permissions

**Common Issues:**

```
❌ MongoServerError: bad auth
✅ Fix: Check username and password

❌ MongooseServerSelectionError
✅ Fix: Check IP whitelist and connection string

❌ MONGODB_URL is not set
✅ Fix: Add MONGODB_URL to Render environment variables
```

### **JWT Errors:**

**Check:**

- [ ] JWT_SECRET is set
- [ ] JWT_SECRET is at least 32 characters
- [ ] JWT_SECRET doesn't have special characters that need escaping

### **CORS Errors:**

**Check:**

- [ ] Backend CORS includes frontend URL
- [ ] Frontend API_BASE_URL points to backend
- [ ] No typos in URLs

---

## 📋 Quick Copy Templates

### **For Render Backend Environment Variables:**

Copy and paste these, then fill in values:

```
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=paste_your_generated_secret_here
NODE_ENV=production
PORT=4001
```

### **For Local Development (.env):**

```
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=development_secret_key_change_in_production
PORT=4001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 🔄 Updating Environment Variables

### **In Render:**

1. Go to your service dashboard
2. Click "Environment" tab
3. Click "Edit" on variable
4. Update value
5. Click "Save Changes"
6. Service will automatically redeploy

### **Locally:**

1. Edit `.env` file
2. Save changes
3. Restart server (`npm run dev`)

---

## 💡 Pro Tips

1. **Use .env.example**: Commit a template without secrets
2. **Document variables**: Comment what each variable does
3. **Validate on startup**: Check required variables exist
4. **Use different secrets**: Dev, staging, production should differ
5. **Rotate secrets**: Change JWT_SECRET periodically
6. **Monitor logs**: Check for environment-related errors

---

## 🎯 Deployment Order

1. ✅ Set up MongoDB Atlas
2. ✅ Get MongoDB connection string
3. ✅ Generate JWT_SECRET
4. ✅ Deploy backend with environment variables
5. ✅ Get backend URL
6. ✅ Update frontend API URLs
7. ✅ Deploy frontend

---

## 📚 Additional Resources

- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Render Docs**: https://render.com/docs/environment-variables
- **Vite Env Variables**: https://vitejs.dev/guide/env-and-mode.html
- **Node.js Environment**: https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs

---

**Remember: Never commit .env files to Git! Keep your secrets safe! 🔐**
