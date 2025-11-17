# 🚀 Netlify Deployment Guide - CoupleDelight

## Complete Guide to Deploy Backend + Frontend on Netlify

---

## 📋 Prerequisites

1. Create account on [Netlify](https://netlify.com)
2. Install Netlify CLI: `npm install -g netlify-cli`
3. Have MongoDB connection string ready

---

## 🔧 Step 1: Install Dependencies

```bash
# Install backend dependencies (including serverless-http)
npm install

# Install frontend dependencies
cd client && npm install
cd ..
```

---

## 🌐 Step 2: Deploy Backend API to Netlify

### A. Login to Netlify
```bash
netlify login
```

### B. Deploy Backend (from project root)
```bash
netlify deploy --prod
```

**When prompted:**
- **Create & configure a new site?** → Yes
- **Team:** → Select your team
- **Site name:** → `coupledelight-api` (or your preferred name)
- **Publish directory:** → `public`
- **Functions directory:** → `netlify/functions`

### C. Set Backend Environment Variables

After deployment, go to Netlify Dashboard:

1. Go to: **Site settings** → **Environment variables**
2. Add these variables:

```
MONGODB_URI = mongodb://103.225.188.18:27017/coupledelight?directConnection=true&serverSelectionTimeoutMS=10000
DB_NAME = coupledelight
JWT_SECRET = your-super-secret-jwt-key-min-32-characters-long
CLIENT_URL = https://your-frontend-site.netlify.app
```

**⚠️ IMPORTANT:** Replace `CLIENT_URL` after you deploy frontend in next step!

### D. Get Your Backend URL

After deployment, Netlify will show your site URL:
```
https://coupledelight-api.netlify.app
```

**Save this URL - you'll need it for frontend!**

---

## 🎨 Step 3: Deploy Frontend to Netlify

### A. Update Frontend Environment Variable

1. Open `client/.env`:
```bash
REACT_APP_API_URL=https://coupledelight-api.netlify.app/api
```
**Replace with YOUR backend URL from Step 2D!**

### B. Deploy Frontend
```bash
cd client
netlify deploy --prod
```

**When prompted:**
- **Create & configure a new site?** → Yes
- **Team:** → Select your team  
- **Site name:** → `coupledelight` (or your preferred name)
- **Publish directory:** → `build`

### C. Build and Deploy
```bash
# Netlify will automatically run: npm run build
# Then deploy the build folder
```

### D. Set Frontend Environment Variable in Netlify

Go to Netlify Dashboard for frontend site:

1. **Site settings** → **Environment variables**
2. Add:
```
REACT_APP_API_URL = https://coupledelight-api.netlify.app/api
```

3. **Trigger redeploy** after adding variable

---

## 🔄 Step 4: Update Backend CLIENT_URL

Now go back to **backend** Netlify dashboard:

1. **Site settings** → **Environment variables**
2. **Update** `CLIENT_URL`:
```
CLIENT_URL = https://coupledelight.netlify.app
```
**Use YOUR frontend URL!**

3. **Trigger redeploy** after updating

---

## ✅ Step 5: Test Your Deployment

### Backend API Test:
```bash
curl https://coupledelight-api.netlify.app/api/health
```

Should return:
```json
{"status":"ok","message":"Server is running"}
```

### Frontend Test:
Open browser: `https://coupledelight.netlify.app`

---

## 📝 Quick Reference

### Your URLs
- **Backend API:** `https://coupledelight-api.netlify.app`
- **Frontend:** `https://coupledelight.netlify.app`

### Backend Environment Variables (Netlify Dashboard)
```
MONGODB_URI = mongodb://103.225.188.18:27017/coupledelight
DB_NAME = coupledelight
JWT_SECRET = your-secret-key
CLIENT_URL = https://coupledelight.netlify.app
```

### Frontend Environment Variables (Netlify Dashboard)
```
REACT_APP_API_URL = https://coupledelight-api.netlify.app/api
```

---

## 🔧 Troubleshooting

### Error: "Environment Variable references Secret which does not exist"

**Solution:** Don't use `@secret_name` format in Netlify. Use direct values:
- ❌ Wrong: `@mongodb_uri`
- ✅ Right: `mongodb://103.225.188.18:27017/coupledelight`

### Error: "API calls failing"

1. Check backend URL in frontend `.env`
2. Verify `CLIENT_URL` in backend environment variables
3. Check CORS settings in `server/index.js`

### Error: "MongoDB connection failed"

1. Verify MongoDB is accessible from internet
2. Check firewall rules on MongoDB server
3. Test connection string locally first

---

## 🔄 Updating Your Site

### Update Backend:
```bash
# Make changes to code
git add .
git commit -m "Update backend"
netlify deploy --prod
```

### Update Frontend:
```bash
cd client
# Make changes to code
git add .
git commit -m "Update frontend"
netlify deploy --prod
```

---

## 🎉 Success!

Your CoupleDelight platform is now live on Netlify!

- **Backend API:** Running as serverless functions
- **Frontend:** Static React app with global CDN
- **Database:** MongoDB connection working
- **Features:** All features including real-time messaging

---

## 📞 Need Help?

- Netlify Docs: https://docs.netlify.com
- MongoDB Atlas: Consider using for better reliability
- GitHub Repository: Check README.md for more details
