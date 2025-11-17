# 🚀 Deployment Guide for CoupleDelight

## Prerequisites
- MongoDB accessible from internet (103.225.188.18:27017)
- Node.js application ready
- Vercel/Netlify account

## 📋 Deployment Options

### Option 1: Deploy Backend to Vercel

#### Step 1: Create `vercel.json` in root
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    }
  ]
}
```

#### Step 2: Environment Variables on Vercel
Go to your Vercel project → Settings → Environment Variables and add:

```
MONGODB_URI=mongodb://103.225.188.18:27017/coupledelight?directConnection=true&serverSelectionTimeoutMS=10000
DB_NAME=coupledelight
JWT_SECRET=your-production-secret-key-here-min-32-chars
PORT=5001
CLIENT_URL=https://your-frontend-domain.vercel.app
```

#### Step 3: Deploy Backend
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /path/to/coupledelight.com
vercel --prod
```

---

### Option 2: Deploy Frontend to Netlify

#### Step 1: Build React App
```bash
cd client
npm run build
```

#### Step 2: Create `netlify.toml` in client folder
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 3: Environment Variables on Netlify
Create `.env.production` in client folder:
```
REACT_APP_API_URL=https://your-backend.vercel.app/api
```

#### Step 4: Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd client
netlify deploy --prod
```

---

## 🔧 Configuration Updates Needed

### 1. Update `client/src/utils/api.js`
Change:
```javascript
const API_URL = '/api';
```
To:
```javascript
const API_URL = process.env.REACT_APP_API_URL || '/api';
```

### 2. Update `server/index.js` CORS
Change:
```javascript
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
```
To:
```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
```

---

## ⚠️ Important Notes

### MongoDB Connection
- **Status**: Currently testing `103.225.188.18:27017`
- **Requirements**:
  - Port 27017 must be open in firewall
  - MongoDB must bind to `0.0.0.0` (not just localhost)
  - Consider using MongoDB Atlas for production (recommended)

### Security Checklist
- [ ] Change JWT_SECRET to a strong random string (min 32 characters)
- [ ] Set up MongoDB authentication (username/password)
- [ ] Enable HTTPS on both frontend and backend
- [ ] Add rate limiting to API endpoints
- [ ] Set up proper CORS origins

### File Uploads
- Current setup uses local file system
- For production, use:
  - AWS S3
  - Cloudinary
  - Vercel Blob Storage

---

## 🧪 Testing Deployment

### Test Backend
```bash
curl https://your-backend.vercel.app/api/health
```

### Test Frontend
Visit: `https://your-frontend.netlify.app`

### Test MongoDB Connection
```bash
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://103.225.188.18:27017/coupledelight').then(() => console.log('Connected!')).catch(err => console.error(err));"
```

---

## 📱 Alternative: Single Deployment on Vercel

Deploy both frontend and backend together:

1. Move `client/build` contents to `public` folder
2. Update `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/build/$1"
    }
  ]
}
```

---

## 🔍 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if port is accessible
telnet 103.225.188.18 27017

# Or use nc
nc -zv 103.225.188.18 27017
```

### CORS Errors
- Ensure CLIENT_URL is set correctly
- Check browser console for actual origin
- Update CORS configuration to match

### Socket.IO Issues
- WebSocket connections may not work on some platforms
- Consider using Socket.IO with polling fallback
- Update Socket.IO client connection URL

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
- [Socket.IO with Vercel](https://socket.io/docs/v4/server-deployment/)
