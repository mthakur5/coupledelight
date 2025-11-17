# 🚀 CloudPanel Deployment Guide for CoupleDelight

## Prerequisites
- CloudPanel installed on your VPS/Server
- Domain name configured
- SSH access to your server
- Node.js 18+ installed
- MongoDB running (local or remote)

---

## 📋 Step-by-Step Deployment

### Step 1: Create Site in CloudPanel

1. **Login to CloudPanel**
   - Access: `https://your-server-ip:8443`

2. **Add New Site**
   - Go to "Sites" → "Add Site"
   - Select "Node.js"
   - Domain Name: `coupledelight.com` (or your domain)
   - Node.js Version: 18
   - Click "Create"

3. **Note the Site Path**
   - Usually: `/home/cloudpanel/htdocs/coupledelight.com`

---

### Step 2: Upload Application Files

**Option A: Using Git (Recommended)**

```bash
# SSH into your server
ssh root@your-server-ip

# Navigate to site directory
cd /home/cloudpanel/htdocs/coupledelight.com

# Clone your repository
git clone https://github.com/mthakur5/coupledelight.git .

# Or if already cloned, pull latest
git pull origin main
```

**Option B: Using FTP/SFTP**
- Use FileZilla or similar FTP client
- Upload all files to: `/home/cloudpanel/htdocs/coupledelight.com`

---

### Step 3: Install Dependencies

```bash
# SSH into server
cd /home/cloudpanel/htdocs/coupledelight.com

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

---

### Step 4: Build React Frontend

```bash
cd /home/cloudpanel/htdocs/coupledelight.com/client

# Create production build
npm run build

# The build folder will be created in client/build
```

---

### Step 5: Configure Environment Variables

Create `.env` file in root directory:

```bash
cd /home/cloudpanel/htdocs/coupledelight.com
nano .env
```

Add the following:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://103.225.188.18:27017/?directConnection=true&serverSelectionTimeoutMS=10000
DB_NAME=coupledelight

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-random-32-character-key-here

# Server Configuration
PORT=3000
NODE_ENV=production

# Client URL (Your domain)
CLIENT_URL=https://coupledelight.com

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Save and exit (Ctrl+X, then Y, then Enter)

---

### Step 6: Create Server Start Script

Create `start.js` in root:

```bash
nano start.js
```

Add:

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// API routes
app.use('/api', require('./server/index'));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**OR** Update `server/index.js` to serve React build:

```bash
nano server/index.js
```

Add before `server.listen()`:

```javascript
// Serve static files from React build (production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}
```

---

### Step 7: Install PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Navigate to project
cd /home/cloudpanel/htdocs/coupledelight.com

# Start application with PM2
pm2 start server/index.js --name "coupledelight"

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the command it gives you
```

**PM2 Commands:**
```bash
pm2 status              # Check status
pm2 logs coupledelight  # View logs
pm2 restart coupledelight  # Restart app
pm2 stop coupledelight  # Stop app
pm2 delete coupledelight   # Remove from PM2
```

---

### Step 8: Configure Nginx (Via CloudPanel)

CloudPanel automatically creates Nginx configuration. You may need to customize it:

1. **Go to CloudPanel**
   - Sites → Your Site → Vhost Editor

2. **Update Nginx Configuration:**

```nginx
server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name coupledelight.com www.coupledelight.com;
    
    # SSL Configuration (CloudPanel handles this)
    ssl_certificate /path/to/cert;
    ssl_certificate_key /path/to/key;
    
    root /home/cloudpanel/htdocs/coupledelight.com/client/build;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy API requests to Node.js
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Socket.io WebSocket support
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Handle file uploads
    location /uploads {
        alias /home/cloudpanel/htdocs/coupledelight.com/server/uploads;
        access_log off;
        expires 30d;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
}
```

3. **Test and Reload Nginx:**
```bash
nginx -t
systemctl reload nginx
```

---

### Step 9: Install SSL Certificate

1. **In CloudPanel:**
   - Go to Sites → Your Site → SSL/TLS
   - Click "New Let's Encrypt Certificate"
   - Select your domain
   - Click "Create"

---

### Step 10: Configure Firewall

```bash
# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow Node.js port (if needed externally)
ufw allow 3000/tcp

# Enable firewall
ufw enable
```

---

### Step 11: Setup MongoDB

**If MongoDB is not installed:**

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Check status
systemctl status mongod
```

**Update `.env` for local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/coupledelight
```

---

### Step 12: Test Deployment

1. **Check PM2 Status:**
```bash
pm2 status
pm2 logs coupledelight
```

2. **Test Application:**
```bash
curl http://localhost:3000/api/health
```

3. **Access in Browser:**
```
https://coupledelight.com
```

---

## 🔄 Updating Application

```bash
# SSH into server
cd /home/cloudpanel/htdocs/coupledelight.com

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install
cd client && npm install && cd ..

# Rebuild frontend
cd client && npm run build && cd ..

# Restart PM2
pm2 restart coupledelight

# Check logs
pm2 logs coupledelight
```

---

## 🐛 Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs coupledelight

# Check Node.js process
ps aux | grep node

# Check port availability
netstat -tlnp | grep 3000
```

### MongoDB Connection Issues

```bash
# Check MongoDB status
systemctl status mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Test connection
mongo
```

### Nginx Issues

```bash
# Test Nginx configuration
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Restart Nginx
systemctl restart nginx
```

### Permission Issues

```bash
# Fix permissions
chown -R cloudpanel:cloudpanel /home/cloudpanel/htdocs/coupledelight.com
chmod -R 755 /home/cloudpanel/htdocs/coupledelight.com
```

---

## 📊 Monitoring

### Setup Log Rotation for PM2

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Monitor Server Resources

```bash
# CPU and Memory
htop

# Disk usage
df -h

# PM2 monitoring
pm2 monit
```

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Enable MongoDB authentication
- [ ] Configure firewall (UFW)
- [ ] Install SSL certificate (Let's Encrypt)
- [ ] Set secure file permissions
- [ ] Enable rate limiting in application
- [ ] Regular backups of database
- [ ] Keep Node.js and dependencies updated
- [ ] Monitor server logs regularly

---

## 📦 Backup Strategy

```bash
# Backup MongoDB
mongodump --out /backup/mongodb/$(date +%Y%m%d)

# Backup application files
tar -czf /backup/app/coupledelight-$(date +%Y%m%d).tar.gz /home/cloudpanel/htdocs/coupledelight.com

# Backup uploaded files
tar -czf /backup/uploads/uploads-$(date +%Y%m%d).tar.gz /home/cloudpanel/htdocs/coupledelight.com/server/uploads
```

---

## 🎉 Your Application is Live!

Access your application at: `https://coupledelight.com`

**Need Help?**
- Check PM2 logs: `pm2 logs coupledelight`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`
- Check MongoDB: `systemctl status mongod`
