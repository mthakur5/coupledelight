# 🚀 Vercel Deployment Guide

## Step-by-Step Instructions

### 1. Deploy Backend to Vercel

#### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd /Users/manmohankumar/Desktop/coupledelight.com
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository: `mthakur5/coupledelight`
4. Configure project settings:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave as root)
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)

### 2. Set Environment Variables in Vercel

After deployment, you need to add environment variables:

1. Go to your project in Vercel Dashboard
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar
4. Add each variable one by one:

#### Required Environment Variables:

**Variable 1: MONGODB_URI**
- Name: `MONGODB_URI`
- Value: `mongodb://103.225.188.18:27017/coupledelight?directConnection=true&serverSelectionTimeoutMS=10000`
- Environment: Production, Preview, Development (select all)

**Variable 2: DB_NAME**
- Name: `DB_NAME`
- Value: `coupledelight`
- Environment: Production, Preview, Development

**Variable 3: JWT_SECRET**
- Name: `JWT_SECRET`
- Value: (Generate a strong random string - at least 32 characters)
- Example: `your-super-secret-jwt-key-min-32-chars-long`
- Environment: Production, Preview, Development

**Variable 4: PORT**
- Name: `PORT`
- Value: `5001`
- Environment: Production, Preview, Development

**Variable 5: CLIENT_URL**
- Name: `CLIENT_URL`
- Value: (Your Netlify frontend URL)
- Example: `https://your-app.netlify.app`
- Environment: Production, Preview, Development

### 3. Redeploy After Adding Variables

After adding all environment variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the **⋮** (three dots) menu
4. Click **Redeploy**

---

## Netlify Frontend Deployment

### 1. Deploy Frontend to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from client directory
cd client
netlify deploy --prod
```

### 2. Set Environment Variable in Netlify

1. Go to https://app.netlify.com
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**

**Add This Variable:**
- Key: `REACT_APP_API_URL`
- Value: `https://your-backend.vercel.app/api`
  (Replace with your actual Vercel backend URL)

### 3. Trigger Redeploy

After adding the environment variable:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

---

## Important Notes

### MongoDB Connection
- Ensure your MongoDB at `103.225.188.18:27017` is:
  - ✅ Running
  - ✅ Accessible from internet
  - ✅ Port 27017 is open
  - ✅ Bound to `0.0.0.0` (not just localhost)

### Generate Strong JWT Secret
```bash
# On Mac/Linux, generate a random secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Get Your Deployment URLs

**Vercel Backend URL:**
- After deployment, you'll get a URL like: `https://coupledelight.vercel.app`
- Your API will be at: `https://coupledelight.vercel.app/api`

**Netlify Frontend URL:**
- After deployment: `https://your-site-name.netlify.app`

### Update CLIENT_URL in Vercel
Once you have your Netlify URL:
1. Go back to Vercel
2. Update the `CLIENT_URL` environment variable
3. Redeploy

---

## Testing Your Deployment

### Test Backend
```bash
# Test health endpoint
curl https://your-backend.vercel.app/api/health
```

### Test Frontend
- Open browser
- Go to your Netlify URL
- Try to register/login

---

## Troubleshooting

### "MONGODB_URI not defined" Error
- Check environment variables are set in Vercel
- Redeploy after adding variables

### CORS Errors
- Ensure `CLIENT_URL` in Vercel matches your Netlify URL
- Include full URL with `https://`

### "Module not found" Errors
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel

---

## Quick Reference

### Vercel Environment Variables
```
MONGODB_URI=mongodb://103.225.188.18:27017/coupledelight?directConnection=true&serverSelectionTimeoutMS=10000
DB_NAME=coupledelight
JWT_SECRET=your-strong-secret-key-here
PORT=5001
CLIENT_URL=https://your-app.netlify.app
```

### Netlify Environment Variable
```
REACT_APP_API_URL=https://your-backend.vercel.app/api
```

---

## Alternative: MongoDB Atlas (Recommended)

If MongoDB connection fails, use MongoDB Atlas:

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in Vercel with Atlas connection string

Example Atlas URI:
```
mongodb+srv://username:password@cluster.mongodb.net/coupledelight?retryWrites=true&w=majority
