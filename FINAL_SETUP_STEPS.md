# 🎉 Final Configuration Steps

## ✅ Current Status:
- **Frontend (Netlify):** https://coupledelight.netlify.app/
- **Backend (Vercel):** https://coupledelight.vercel.app/
- **API Endpoint:** https://coupledelight.vercel.app/api

---

## 🔧 Step 1: Configure Vercel Environment Variables

### Go to Vercel Dashboard:
1. Open: https://vercel.com/dashboard
2. Click on your **"coupledelight"** project
3. Click **"Settings"** tab (top menu)
4. Click **"Environment Variables"** (left sidebar)

### Add These 5 Variables:

#### Variable 1: MONGODB_URI
```
Name: MONGODB_URI
Value: mongodb://103.225.188.18:27017/coupledelight?directConnection=true&serverSelectionTimeoutMS=10000
Environment: ✓ Production  ✓ Preview  ✓ Development
```
Click **"Save"**

#### Variable 2: DB_NAME
```
Name: DB_NAME
Value: coupledelight
Environment: ✓ Production  ✓ Preview  ✓ Development
```
Click **"Save"**

#### Variable 3: JWT_SECRET
```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-change-this-32-chars-minimum
Environment: ✓ Production  ✓ Preview  ✓ Development
```
**IMPORTANT:** Change this to a random 32+ character string!

To generate a strong secret, run this in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Click **"Save"**

#### Variable 4: PORT
```
Name: PORT
Value: 5001
Environment: ✓ Production  ✓ Preview  ✓ Development
```
Click **"Save"**

#### Variable 5: CLIENT_URL
```
Name: CLIENT_URL
Value: https://coupledelight.netlify.app
Environment: ✓ Production  ✓ Preview  ✓ Development
```
Click **"Save"**

### Redeploy Vercel:
1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Click **⋮** (three dots menu)
4. Click **"Redeploy"**
5. Wait for redeployment (1-2 minutes)

---

## 🔧 Step 2: Configure Netlify Environment Variable

### Go to Netlify Dashboard:
1. Open: https://app.netlify.com
2. Click on your **"coupledelight"** site
3. Click **"Site configuration"** (left sidebar)
4. Click **"Environment variables"**
5. Click **"Add a variable"** button

### Add This Variable:

#### REACT_APP_API_URL
```
Key: REACT_APP_API_URL
Value: https://coupledelight.vercel.app/api
```
Click **"Create variable"**

### Redeploy Netlify:
1. Go to **"Deploys"** tab (top menu)
2. Click **"Trigger deploy"** button (top right)
3. Select **"Deploy site"**
4. Wait for redeployment (2-3 minutes)

---

## ✅ Step 3: Test Your Application

### Open Your Frontend:
```
https://coupledelight.netlify.app/
```

### Test These Features:
1. ✅ Register a new account
2. ✅ Login with credentials
3. ✅ Create your profile
4. ✅ Browse discover page
5. ✅ Send messages

### Test Backend API:
```bash
curl https://coupledelight.vercel.app/api/health
```

Should return:
```json
{"status":"ok","message":"Server is running"}
```

---

## 🚨 Troubleshooting

### Frontend Not Loading?
- Check browser console (F12) for errors
- Verify `REACT_APP_API_URL` is set correctly in Netlify
- Make sure you redeployed Netlify after adding the variable

### Backend Errors?
- Check all 5 environment variables are added in Vercel
- Verify MongoDB at `103.225.188.18:27017` is accessible
- Check Vercel deployment logs for specific errors

### CORS Errors?
- Ensure `CLIENT_URL` in Vercel is exactly: `https://coupledelight.netlify.app`
- No trailing slash
- Must include `https://`
- Redeploy Vercel after fixing

### Database Connection Failed?
**Option 1:** Check your MongoDB server
```bash
# Test connection from your local machine
telnet 103.225.188.18 27017
```

**Option 2:** Use MongoDB Atlas (Recommended)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in Vercel with Atlas connection string

---

## 📋 Quick Reference

### Your URLs:
```
Frontend: https://coupledelight.netlify.app/
Backend:  https://coupledelight.vercel.app/
API:      https://coupledelight.vercel.app/api
```

### Vercel Environment Variables:
```
MONGODB_URI = mongodb://103.225.188.18:27017/coupledelight?directConnection=true&serverSelectionTimeoutMS=10000
DB_NAME = coupledelight
JWT_SECRET = (your generated secret)
PORT = 5001
CLIENT_URL = https://coupledelight.netlify.app
```

### Netlify Environment Variable:
```
REACT_APP_API_URL = https://coupledelight.vercel.app/api
```

---

## 🎉 You're Done!

Once you've:
1. ✅ Added all 5 environment variables to Vercel
2. ✅ Redeployed Vercel
3. ✅ Added 1 environment variable to Netlify
4. ✅ Redeployed Netlify

Your dating platform will be **LIVE** at:
**https://coupledelight.netlify.app/**

Enjoy your fully functional dating platform! 🚀❤️
