# 🚀 Vercel Backend Deployment Guide

## Step-by-Step Instructions to Deploy Your Backend on Vercel

### Prerequisites
- Vercel account (free): https://vercel.com/signup
- Your backend code ready
- MongoDB connection string

---

## 📋 Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

---

## 🔐 Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

---

## 🚀 Step 3: Deploy Backend

From your project root directory:

```bash
cd /Users/manmohankumar/Desktop/coupledelight.com
vercel --prod
```

### During deployment, answer the prompts:
1. **Set up and deploy?** → Yes
2. **Which scope?** → Select your account
3. **Link to existing project?** → No
4. **Project name?** → `coupledelight-backend` (or your choice)
5. **Directory?** → `.` (current directory)
6. **Override settings?** → No

---

## ⚙️ Step 4: Set Environment Variables

After first deployment, go to:
https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these variables:

```
MONGODB_URI = mongodb://103.225.188.18:27017/coupledelight?directConnection=true&serverSelectionTimeoutMS=10000
DB_NAME = coupledelight
JWT_SECRET = your-strong-secret-key-min-32-characters
CLIENT_URL = http://localhost:3000
PORT = 5001
```

**Important:** 
- Use a strong JWT_SECRET (generate with: `openssl rand -base64 32`)
- CLIENT_URL will be updated after frontend deployment

---

## 🔄 Step 5: Redeploy with Environment Variables

After adding environment variables:

```bash
vercel --prod
```

---

## ✅ Step 6: Test Your Backend

Your backend will be available at:
```
https://your-project-name.vercel.app
```

Test the health endpoint:
```bash
curl https://your-project-name.vercel.app/api/health
```

Should return:
```json
{"status":"ok","message":"Server is running"}
```

---

## 📱 Step 7: Update Frontend Configuration

Once backend is deployed, update your frontend:

1. **Get your backend URL** from Vercel dashboard
2. **Create/Update** `client/.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend.vercel.app/api
   ```

3. **Update CLIENT_URL** in Vercel:
   - After deploying frontend to Netlify
   - Go to Vercel → Settings → Environment Variables
   - Update `CLIENT_URL` to your Netlify URL

---

## 🔧 Troubleshooting

### Issue: MongoDB Connection Failed
**Solution:**
- Ensure MongoDB is accessible from internet
- Check if port 27017 is open
- Consider using MongoDB Atlas instead

### Issue: CORS Errors
**Solution:**
- Update `CLIENT_URL` environment variable
- Make sure it matches your frontend URL exactly

### Issue: 404 on API Endpoints
**Solution:**
- Ensure all API routes use `/api/` prefix
- Check `vercel.json` routes configuration

---

## 📊 View Logs

To see deployment logs:
```bash
vercel logs your-project-name
```

Or visit:
https://vercel.com/dashboard → Your Project → Deployments → View Logs

---

## 🔄 Automatic Deployments

Link your GitHub repository for automatic deployments:

1. Go to Vercel Dashboard
2. Import Project
3. Connect your GitHub repository
4. Future commits will auto-deploy

---

## 💡 Important Notes

### Current Setup:
✅ Backend configured for Vercel
✅ API routes use `/api/` prefix
✅ Environment variables supported
✅ MongoDB connection ready

### MongoDB Recommendation:
🔴 **Current:** Local MongoDB with port forwarding
🟢 **Recommended:** MongoDB Atlas (cloud-hosted)

**Why MongoDB Atlas?**
- Always accessible
- No port forwarding needed
- Free tier available
- Better security
- Auto-backups

**MongoDB Atlas Setup:**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in Vercel

---

## 📝 Quick Reference Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm your-deployment-url
```

---

## ✨ After Successful Deployment

Your backend API will be available at:
```
https://your-project.vercel.app/api/health
https://your-project.vercel.app/api/auth/...
https://your-project.vercel.app/api/profile/...
https://your-project.vercel.app/api/discover/...
https://your-project.vercel.app/api/messages/...
```

**Next Steps:**
1. ✅ Backend deployed on Vercel
2. 🔄 Deploy frontend on Netlify
3. 🔗 Update environment variables with actual URLs
4. 🧪 Test end-to-end functionality

---

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Check deployment logs for errors
- Ensure all environment variables are set correctly

---

Good luck with your deployment! 🚀
