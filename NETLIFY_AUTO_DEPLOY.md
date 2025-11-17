# 🚀 Netlify Auto-Deploy Setup Guide

## Complete Step-by-Step Guide for Automatic Deployment

---

## 📋 Prerequisites
- GitHub account with repository: `https://github.com/mthakur5/coupledelight.git`
- Netlify account (free tier works)
- Backend API hosted (Vercel/Render/Railway)

---

## 🔄 Part 1: Push Code to GitHub

### Step 1: Check Git Status
```bash
cd /Users/manmohankumar/Desktop/coupledelight.com
git status
```

### Step 2: Add All Files
```bash
git add .
```

### Step 3: Commit Changes
```bash
git commit -m "Complete dating app with mobile responsiveness and deployment configs"
```

### Step 4: Push to GitHub
```bash
# Push to your repository
git push coupledelight main

# Or if that doesn't work:
git push -u coupledelight main --force
```

---

## 🌐 Part 2: Deploy Frontend to Netlify

### Step 1: Go to Netlify
1. Visit: https://app.netlify.com
2. Click **"Sign up"** or **"Log in"**
3. Choose **"Sign up with GitHub"** (recommended)

### Step 2: Import Your Project
1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Authorize Netlify to access your GitHub
4. Select repository: **`mthakur5/coupledelight`**

### Step 3: Configure Build Settings

**Important:** Set these EXACTLY as shown:

```
Base directory: client
Build command: npm run build
Publish directory: client/build
```

Click **"Show advanced"** and add:

**Build Environment Variables:**
```
NODE_VERSION = 18
```

### Step 4: Add Environment Variables

Click **"Add environment variables"** and add:

```
REACT_APP_API_URL = https://your-backend-url.vercel.app/api
```

**⚠️ IMPORTANT:** Replace `your-backend-url` with your actual backend URL!

### Step 5: Deploy
1. Click **"Deploy site"**
2. Wait 2-3 minutes for build to complete
3. Your site will be live at: `https://random-name-123.netlify.app`

### Step 6: Custom Domain (Optional)
1. Go to **"Site settings"** → **"Domain management"**
2. Click **"Add custom domain"**
3. Follow instructions to add your domain

---

## 🔧 Part 3: Enable Auto-Deploy

### Already Enabled by Default! 🎉

When you connected GitHub, Netlify automatically:
- ✅ Watches your `main` branch
- ✅ Auto-deploys on every push
- ✅ Shows deploy status in GitHub
- ✅ Sends email notifications

### How It Works:
```
Your Computer          GitHub              Netlify
     |                   |                   |
     | git push          |                   |
     |------------------>|                   |
     |                   | webhook           |
     |                   |------------------>|
     |                   |                   | Building...
     |                   |                   | Deploying...
     |                   |                   | ✅ Live!
```

---

## 📦 Part 4: Deploy Backend (Choose One)

### Option A: Vercel (Recommended for Node.js)

1. Visit: https://vercel.com
2. Click **"Import Project"**
3. Connect GitHub repository
4. Configure:
   ```
   Root Directory: .
   Framework Preset: Other
   Build Command: (leave empty)
   Output Directory: (leave empty)
   ```

5. Add Environment Variables:
   ```
   MONGODB_URI = mongodb://103.225.188.18:27017/coupledelight?directConnection=true
   DB_NAME = coupledelight
   JWT_SECRET = your-super-secret-key-min-32-chars
   CLIENT_URL = https://your-site.netlify.app
   PORT = 5001
   ```

6. Deploy!

### Option B: Render (Alternative)

1. Visit: https://render.com
2. Click **"New"** → **"Web Service"**
3. Connect GitHub
4. Configure:
   ```
   Name: coupledelight-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

5. Add Environment Variables (same as Vercel)
6. Create Web Service

---

## ✅ Part 5: Verify Auto-Deploy Works

### Test the Auto-Deploy:

1. Make a small change to your code:
   ```bash
   # Edit any file, for example:
   echo "// Test change" >> client/src/App.js
   ```

2. Commit and push:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push coupledelight main
   ```

3. Check Netlify Dashboard:
   - You should see "Building" status
   - Takes 2-3 minutes
   - Status changes to "Published"
   - Your site updates automatically! 🎉

---

## 🔍 Troubleshooting

### Problem: Build Fails

**Solution 1:** Check Build Logs
```
Netlify Dashboard → Deploys → Click failed deploy → View logs
```

**Solution 2:** Common Issues
- Base directory should be: `client`
- Publish directory should be: `client/build`
- Node version should be: 18

### Problem: Blank Page After Deploy

**Solution:** Check environment variables
```bash
# In Netlify Dashboard:
Site settings → Environment variables

# Must have:
REACT_APP_API_URL = https://your-backend.vercel.app/api
```

### Problem: API Calls Fail

**Solution:** Update backend CORS

In your backend `server/index.js`:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-site.netlify.app'  // Add your Netlify URL
];
```

---

## 📱 Part 6: Configure Custom Domain (Optional)

### Using Netlify Domain:
1. Site settings → Domain management
2. Click "Options" → "Edit site name"
3. Change to: `coupledelight.netlify.app`

### Using Your Own Domain:
1. Buy domain (GoDaddy, Namecheap, etc.)
2. In Netlify: Add custom domain
3. Update DNS records as shown
4. Wait 24-48 hours for DNS propagation

---

## 🎯 Quick Reference Commands

### Push New Changes:
```bash
git add .
git commit -m "Your change description"
git push coupledelight main
```

### View Deployment Status:
```bash
# Option 1: Check Netlify Dashboard
open https://app.netlify.com

# Option 2: Check GitHub
# Look for green checkmark next to latest commit
```

### Rollback to Previous Version:
1. Go to Netlify Dashboard
2. Click "Deploys"
3. Find working version
4. Click "Publish deploy"

---

## 🔐 Security Checklist

Before going live:

- [ ] Change JWT_SECRET to strong random string (32+ characters)
- [ ] Set up MongoDB authentication (username/password)
- [ ] Enable HTTPS (automatic with Netlify)
- [ ] Add rate limiting to API
- [ ] Set proper CORS origins
- [ ] Review .gitignore (ensure .env not committed)
- [ ] Set up backup for MongoDB
- [ ] Enable Netlify deploy notifications

---

## 📊 Monitor Your Site

### Netlify Analytics (Free):
- Page views
- Unique visitors
- Top pages
- Geographic data

### Enable in:
```
Site settings → Analytics → Enable
```

---

## 🆘 Need Help?

### Netlify Docs:
https://docs.netlify.com

### Community Support:
https://answers.netlify.com

### Your Configuration:
```
Repository: https://github.com/mthakur5/coupledelight.git
Branch: main
Base directory: client
Build command: npm run build
Publish directory: client/build
```

---

## 🎉 Success Checklist

Your deployment is successful when:

- [x] Code pushed to GitHub
- [ ] Netlify site created and connected
- [ ] Build completes successfully
- [ ] Site is live and accessible
- [ ] Auto-deploy works on push
- [ ] Backend API is accessible
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Site works on mobile
- [ ] All features functioning

---

## 🚀 You're Done!

Your app now:
- ✅ Auto-deploys when you push to GitHub
- ✅ Is live on Netlify
- ✅ Has HTTPS enabled
- ✅ Is mobile-responsive
- ✅ Has a CDN for fast loading worldwide

**Just push your code and Netlify does the rest! 🎊**
