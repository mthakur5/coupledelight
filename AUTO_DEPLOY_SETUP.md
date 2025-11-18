# 🚀 Auto-Deploy Setup Guide

## Current Setup Status

### GitHub Repositories:
- **Main Repo**: https://github.com/mthakur5/coupledelight.git
- **Origin**: https://github.com/tyuhbh0/coupledelight.git

### Deployment Platforms:
- **Backend**: Vercel (Node.js/Express)
- **Frontend**: Netlify (React)

---

## ✅ Step 1: Connect Vercel to GitHub

### Option A: Via Vercel Dashboard (Recommended)

1. **Login to Vercel**:
   ```
   https://vercel.com/login
   ```

2. **Import Your Project**:
   - Go to: https://vercel.com/new
   - Click "Import Git Repository"
   - Authorize GitHub access
   - Select: `mthakur5/coupledelight`
   - Click "Import"

3. **Configure Project**:
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: (leave empty - using vercel.json)
   Output Directory: (leave empty)
   Install Command: npm install
   ```

4. **Set Environment Variables**:
   ```
   MONGODB_URI=mongodb://manmohan:%2CManmohan89%21%40123@103.225.188.18:27017/?directConnection=true&serverSelectionTimeoutMS=5000
   DB_NAME=mydb
   JWT_SECRET=your-secret-key-here
   CLIENT_URL=https://coupledelight.com
   PORT=5001
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Note the production URL

### Option B: Link Existing Project

1. **In Your Terminal**:
   ```bash
   cd /Users/manmohankumar/Desktop/coupledelight.com
   vercel link
   ```

2. **Follow Prompts**:
   - Set up and deploy: No
   - Link to existing project: Yes
   - Select your project
   - Link to production: Yes

3. **Enable Git Integration**:
   - Go to Vercel Dashboard → Settings → Git
   - Connect GitHub repository
   - Enable auto-deploy on push

---

## ✅ Step 2: Connect Netlify to GitHub

### Via Netlify Dashboard:

1. **Login to Netlify**:
   ```
   https://app.netlify.com
   ```

2. **Import Project**:
   - Go to: Sites → Add new site → Import an existing project
   - Choose "Deploy with GitHub"
   - Authorize GitHub access
   - Select: `mthakur5/coupledelight`
   - Click "Deploy site"

3. **Configure Build Settings**:
   ```
   Base directory: client
   Build command: npm run build
   Publish directory: client/build
   ```

4. **Set Environment Variables**:
   ```
   CI=false
   REACT_APP_API_URL=https://your-vercel-backend.vercel.app/api
   ```

5. **Deploy Settings**:
   - Branch: main (or your default branch)
   - Enable auto-publishing
   - Save settings

---

## ✅ Step 3: Test Auto-Deploy

### Make a Test Change:

```bash
# Make a small change to test
echo "# Auto-deploy test" >> README.md

# Commit and push
git add .
git commit -m "Test auto-deploy"
git push coupledelight main

# OR push to origin
git push origin main
```

### Watch Deployments:

1. **Vercel**:
   - Go to: https://vercel.com/dashboard
   - You'll see deployment progress
   - Usually takes 1-2 minutes

2. **Netlify**:
   - Go to: https://app.netlify.com/sites
   - Click your site
   - See "Production deploys" section
   - Usually takes 2-3 minutes

---

## 🔄 Auto-Deploy Workflow

### When You Push to GitHub:

```
1. git add .
2. git commit -m "Your changes"
3. git push coupledelight main
   ↓
4. GitHub receives push
   ↓
5. Vercel detects change → Deploys backend (1-2 min)
6. Netlify detects change → Deploys frontend (2-3 min)
   ↓
7. ✅ Your app is automatically updated!
```

---

## 📝 Important Notes

### Environment Variables:

**Vercel (Backend):**
```bash
# These must be set in Vercel Dashboard
MONGODB_URI=mongodb://manmohan:%2CManmohan89%21%40123@103.225.188.18:27017/?directConnection=true&serverSelectionTimeoutMS=5000
DB_NAME=mydb
JWT_SECRET=your-secret-key
CLIENT_URL=https://coupledelight.com
PORT=5001
```

**Netlify (Frontend):**
```bash
# These must be set in Netlify Dashboard
CI=false
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
```

### File Updates After Connection:

1. **Update client/.env.production**:
   ```
   REACT_APP_API_URL=https://your-new-vercel-url.vercel.app/api
   ```

2. **Update server/index.js CORS** (if needed):
   ```javascript
   const allowedOrigins = [
     'http://localhost:3000',
     'https://coupledelight.com',
     'https://your-netlify-url.netlify.app'
   ];
   ```

3. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Update deployment URLs"
   git push coupledelight main
   ```

---

## 🎯 Quick Reference Commands

### Deploy Backend Manually (if needed):
```bash
vercel --prod
```

### Deploy Frontend Manually (if needed):
```bash
cd client
npm run build
netlify deploy --prod --dir=build
```

### Check Deployment Status:
```bash
# Vercel
vercel ls

# Netlify
netlify status
```

### View Logs:
```bash
# Vercel
vercel logs

# Netlify
netlify logs
```

---

## ✅ Success Indicators

### Auto-Deploy is Working When:

1. **After Git Push**:
   - ✅ Vercel shows new deployment in dashboard
   - ✅ Netlify shows new build in progress
   - ✅ Both complete successfully

2. **Your App Updates**:
   - ✅ Changes appear on https://coupledelight.com
   - ✅ Backend API updates automatically
   - ✅ No manual deployment needed

3. **GitHub Integration**:
   - ✅ Commit status shows deployment checks
   - ✅ Green checkmarks on successful deploys
   - ✅ Red X on failed deploys (with error logs)

---

## 🆘 Troubleshooting

### If Auto-Deploy Doesn't Work:

1. **Check GitHub Connection**:
   - Vercel: Settings → Git → Check connection
   - Netlify: Site Settings → Build & Deploy → Check connection

2. **Check Branch**:
   - Make sure you're pushing to the correct branch
   - Default is usually `main` or `master`

3. **Check Build Logs**:
   - Vercel: Click deployment → View logs
   - Netlify: Click deployment → View build log

4. **Re-link if Needed**:
   ```bash
   vercel link --yes
   netlify link
   ```

---

## 📞 Need Help?

### Useful Links:
- Vercel Docs: https://vercel.com/docs/git
- Netlify Docs: https://docs.netlify.com/git/overview/
- GitHub Integration: Check both platform settings

---

## 🎉 Once Set Up:

**Your workflow will be:**
```bash
# 1. Make changes to your code
vim server/routes/auth.js

# 2. Commit changes
git add .
git commit -m "Add new feature"

# 3. Push to GitHub
git push coupledelight main

# 4. Wait 2-3 minutes

# 5. ✅ Your app is automatically updated!
```

**That's it! No manual deployment needed!** 🚀
