# 🚀 Complete Deployment Guide

## Deployment Setup Karne Ke Steps

### ✅ Prerequisites
- GitHub account
- Vercel account (https://vercel.com)
- Netlify account (https://netlify.com)
- MongoDB Atlas account (recommended)

---

## 📦 STEP 1: Backend Deploy Karo (Vercel)

### 1.1 Vercel Account Setup
1. https://vercel.com par jao
2. "Sign Up" karo (GitHub se login recommended)
3. Dashboard kholo

### 1.2 Git Repository Push Karo
```bash
# Agar abhi tak push nahi kiya hai
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 1.3 Vercel Par Import Karo

**Option A: Vercel Dashboard Se**
1. Vercel dashboard par jao
2. "Add New Project" click karo
3. "Import Git Repository" select karo
4. Apna repository select karo: `mthakur5/coupledelight`
5. **Important Settings:**
   - **Framework Preset:** Other
   - **Root Directory:** ./ (default)
   - **Build Command:** (leave blank)
   - **Output Directory:** (leave blank)
   - **Install Command:** npm install

### 1.4 Environment Variables Add Karo

Vercel dashboard mein "Settings" → "Environment Variables" par jao aur ye add karo:

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=coupledelight
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
CLIENT_URL=https://coupledelight.netlify.app
PORT=5001
```

**⚠️ Important:**
- `MONGODB_URI`: MongoDB Atlas ka connection string use karo
- `JWT_SECRET`: Strong random string generate karo (minimum 32 characters)
- `CLIENT_URL`: Apka Netlify URL (abhi neeche setup karenge)

### 1.5 Deploy Karo
1. "Deploy" button click karo
2. Wait karo deployment complete hone tak
3. Deployment successful hone par URL milega: `https://coupledelight.vercel.app`

### 1.6 Verify Karo
Browser mein check karo: `https://coupledelight.vercel.app/api/health`

Response aise hona chahiye:
```json
{"status":"ok","message":"Server is running"}
```

---

## 🎨 STEP 2: Frontend Deploy Karo (Netlify)

### 2.1 Netlify Account Setup
1. https://netlify.com par jao
2. "Sign Up" karo (GitHub se login recommended)  
3. Dashboard kholo

### 2.2 Netlify Par Import Karo

**Option A: Netlify Dashboard Se**
1. "Add new site" → "Import an existing project" click karo
2. "Deploy with GitHub" select karo
3. Repository select karo: `mthakur5/coupledelight`
4. **Important Settings:**
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `client/build`

### 2.3 Environment Variables Add Karo

Netlify dashboard mein "Site settings" → "Environment variables" par jao:

```
REACT_APP_API_URL=https://coupledelight.vercel.app/api
CI=false
```

### 2.4 Deploy Karo
1. "Deploy site" button click karo
2. Deployment complete hone ka wait karo
3. URL milega: `https://coupledelight.netlify.app`

### 2.5 Custom Domain (Optional)
- "Domain settings" → "Add custom domain" se apna domain add kar sakte ho

---

## 🔄 STEP 3: Auto-Deploy Setup

### Backend (Vercel)
✅ Already configured! Jab bhi main branch par push karoge, automatically deploy hoga.

### Frontend (Netlify) 
✅ Already configured! Jab bhi main branch par push karoge, automatically deploy hoga.

---

## 🧪 STEP 4: Testing

### 4.1 Backend Test
```bash
curl https://coupledelight.vercel.app/api/health
```

### 4.2 Frontend Test
Browser mein kholo: `https://coupledelight.netlify.app`

### 4.3 Full Flow Test
1. Register page par jao
2. New account banao
3. Login karo
4. Profile complete karo
5. Discover page check karo

---

## 📝 Quick Commands Reference

### Local Development
```bash
# Backend start karo
npm run dev

# Frontend start karo (dusre terminal mein)
cd client
npm start
```

### Deploy Karne Ke Baad Changes Push Karo
```bash
# Changes commit karo
git add .
git commit -m "Your changes description"

# Push karo (auto-deploy hoga)
git push origin main
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Solution:** MongoDB Atlas use karo instead of local MongoDB
1. https://mongodb.com/cloud/atlas par jao
2. Free cluster create karo
3. Connection string copy karo
4. Vercel environment variables mein update karo

### Issue 2: CORS Error
**Solution:** Already fixed! Backend mein Netlify URL add kar diya hai.

### Issue 3: Environment Variables Not Working
**Solution:** 
- Vercel: Redeploy karo after adding env vars
- Netlify: Site settings → "Trigger deploy" → "Clear cache and deploy"

### Issue 4: Build Failed
**Solution:**
```bash
# Local test karo pehle
cd client
npm run build

# Agar local mein build successful hai, to Netlify logs check karo
```

---

## 🎯 URLs Summary

| Service | URL | Purpose |
|---------|-----|---------|
| Backend (Vercel) | https://coupledelight.vercel.app | API endpoints |
| Frontend (Netlify) | https://coupledelight.netlify.app | User interface |
| Health Check | https://coupledelight.vercel.app/api/health | Server status |

---

## 🔐 Security Checklist

- [x] JWT_SECRET strong aur unique hai
- [x] MongoDB password strong hai
- [x] .env files .gitignore mein hai
- [x] CORS properly configured hai
- [x] Environment variables Vercel/Netlify mein set hai

---

## 📞 Support

Agar koi problem aaye to:
1. Vercel logs check karo: Dashboard → Project → Deployments → View Function Logs
2. Netlify logs check karo: Dashboard → Site → Deploys → View logs
3. Browser console check karo (F12)

---

## 🎉 Congratulations!

Aapka application ab live hai! 🚀

- Backend: https://coupledelight.vercel.app
- Frontend: https://coupledelight.netlify.app

Har baar jab aap `git push` karoge, automatically deploy ho jayega! ✨
