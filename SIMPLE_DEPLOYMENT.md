# 🚀 Simple Deployment - Import from GitHub

## 📦 Prerequisites
- ✅ Code already pushed to GitHub: `https://github.com/mthakur5/coupledelight.git`
- ✅ GitHub account connected
- ✅ Vercel account
- ✅ Netlify account

---

## 1️⃣ Deploy Backend to Vercel (Just Import!)

### Step 1: Import from GitHub
1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your repository: **`mthakur5/coupledelight`**
5. Click **"Import"**

### Step 2: Configure Project
**IMPORTANT:** Change these settings before deploying:

- **Project Name:** `coupledelight-backend` (or any name)
- **Framework Preset:** Other
- **Root Directory:** `./` (leave as is)
- **Build Command:** (leave empty)
- **Output Directory:** (leave empty)
- **Install Command:** `npm install`

Click **"Deploy"** button

### Step 3: Wait for Deployment
- Vercel will deploy (may show errors - that's OK!)
- Copy your Vercel URL: `https://coupledelight-backend.vercel.app`

### Step 4: Add Environment Variables
1. Go to your project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Add each variable:

**Variable 1:**
```
Name: MONGODB_URI
Value: mongodb://103.225.188.18:27017/coupledelight?directConnection=true&serverSelectionTimeoutMS=10000
Environment: Production, Preview, Development (check all)
```

**Variable 2:**
```
Name: DB_NAME
Value: coupledelight
Environment: Production, Preview, Development
```

**Variable 3:**
```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-change-this-to-random-32-chars
Environment: Production, Preview, Development
```

**Variable 4:**
```
Name: PORT  
Value: 5001
Environment: Production, Preview, Development
```

**Variable 5:**
```
Name: CLIENT_URL
Value: (We'll add this after Netlify deployment)
Environment: Production, Preview, Development
```

Click **"Save"** for each variable.

### Step 5: Redeploy
1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Click **⋮** (three dots) → **"Redeploy"**
4. Wait for redeployment to finish

✅ **Backend Done!** Your API is now at: `https://your-vercel-url.vercel.app/api`

---

## 2️⃣ Deploy Frontend to Netlify (Just Import!)

### Step 1: Import from GitHub
1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Select your repository: **`mthakur5/coupledelight`**
5. Click on the repository

### Step 2: Configure Build Settings
**IMPORTANT:** Change these settings:

- **Base directory:** `client`
- **Build command:** `npm run build`
- **Publish directory:** `client/build`
- **Branch to deploy:** `main`

Click **"Deploy site"**

### Step 3: Wait for Deployment
- Netlify will build and deploy
- Copy your Netlify URL: `https://your-site-name.netlify.app`

### Step 4: Add Environment Variable
1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**

**Add this variable:**
```
Key: REACT_APP_API_URL
Value: https://your-vercel-backend-url.vercel.app/api
```
(Replace with your actual Vercel URL from Step 1)

Click **"Save"**

### Step 5: Redeploy
1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

✅ **Frontend Done!**

---

## 3️⃣ Final Step: Update Backend CLIENT_URL

### Go Back to Vercel
1. Open your Vercel project
2. Go to **Settings** → **Environment Variables**
3. Find **CLIENT_URL** variable
4. Click **"Edit"**
5. Change value to your Netlify URL: `https://your-site-name.netlify.app`
6. Click **"Save"**
7. Go to **Deployments** → Click latest → **⋮** → **"Redeploy"**

---

## ✅ You're Done!

### Test Your App
1. Open your Netlify URL: `https://your-site-name.netlify.app`
2. Try to register a new account
3. Create a profile
4. Browse other profiles

---

## 🔥 Quick Reference

### Your URLs
- **Frontend (Netlify):** `https://your-site-name.netlify.app`
- **Backend (Vercel):** `https://your-backend.vercel.app`
- **API Endpoint:** `https://your-backend.vercel.app/api`

### Environment Variables Summary

**Vercel (Backend):**
```
MONGODB_URI = mongodb://103.225.188.18:27017/coupledelight?directConnection=true&serverSelectionTimeoutMS=10000
DB_NAME = coupledelight
JWT_SECRET = (32+ character random string)
PORT = 5001
CLIENT_URL = (Your Netlify URL)
```

**Netlify (Frontend):**
```
REACT_APP_API_URL = (Your Vercel API URL)
```

---

## 🚨 Troubleshooting

### Backend Not Working?
- Check if all environment variables are added in Vercel
- Make sure MongoDB at `103.225.188.18:27017` is accessible
- Check Vercel deployment logs for errors

### Frontend Not Connecting?
- Verify `REACT_APP_API_URL` has the correct Vercel URL
- Redeploy Netlify after adding environment variable
- Check browser console for CORS errors

### CORS Errors?
- Make sure `CLIENT_URL` in Vercel matches your Netlify URL exactly
- Include `https://` in the URLs
- Redeploy Vercel after updating `CLIENT_URL`

---

## 🎉 That's It!

No CLI commands needed - everything done through the UI! 

Just:
1. Import to Vercel → Add env vars → Redeploy
2. Import to Netlify → Add env var → Redeploy
3. Update Vercel CLIENT_URL → Redeploy

**Your dating platform is now live! 🚀**
