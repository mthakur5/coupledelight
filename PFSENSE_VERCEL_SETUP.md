# pfSense Configuration for Vercel → MongoDB Connection

## Problem
Vercel's backend servers cannot connect to your MongoDB at `103.225.188.18:27017` because pfSense firewall is blocking the connection.

## Solution: Whitelist Vercel IP Ranges

### Step 1: Get Vercel IP Ranges

Vercel uses AWS and Google Cloud. You need to whitelist these IP ranges:

#### Vercel/AWS IP Ranges (Primary):
```
AWS us-east-1 (Vercel primary region):
- 3.208.0.0/12
- 52.0.0.0/11
- 54.80.0.0/12
```

#### Or Allow All Vercel Regions (Safer):
```
For production, whitelist entire AWS and GCP ranges
Check: https://docs.aws.amazon.com/general/latest/gr/aws-ip-ranges.html
```

### Step 2: Configure pfSense Firewall

#### Option A: Add Firewall Rule via Web Interface

1. **Login to pfSense:**
   ```
   Go to: https://your-pfsense-ip
   Login with admin credentials
   ```

2. **Navigate to Firewall Rules:**
   ```
   Firewall → Rules → WAN
   ```

3. **Add New Rule:**
   - Click "Add" (↑ button at bottom)
   - Action: **Pass**
   - Interface: **WAN**
   - Protocol: **TCP**
   - Source: **Single host or alias**
     - Create alias for Vercel IPs (see below)
   - Destination: **Single host** → `103.225.188.18`
   - Destination Port Range: **27017** to **27017**
   - Description: `Allow Vercel to MongoDB`
   - Click **Save**
   - Click **Apply Changes**

4. **Create IP Alias for Vercel (Recommended):**
   ```
   Firewall → Aliases → IP tab
   Click "Add"
   
   Name: Vercel_IPs
   Type: Network(s)
   
   Add these networks:
   3.208.0.0/12
   52.0.0.0/11
   54.80.0.0/12
   
   Description: Vercel AWS IP ranges
   Save
   ```

#### Option B: pfSense CLI Configuration

SSH into pfSense and run:

```bash
# Add firewall rule
pfctl -a wan -f - <<EOF
pass in quick on wan proto tcp from 3.208.0.0/12 to 103.225.188.18 port 27017
pass in quick on wan proto tcp from 52.0.0.0/11 to 103.225.188.18 port 27017
pass in quick on wan proto tcp from 54.80.0.0/12 to 103.225.188.18 port 27017
EOF

# Reload rules
pfctl -f /etc/pf.conf
```

### Step 3: Alternative - Allow All to MongoDB (Less Secure)

If you want to test quickly (NOT recommended for production):

1. **Temporary Open Rule:**
   ```
   Firewall → Rules → WAN → Add
   
   Action: Pass
   Protocol: TCP
   Source: Any
   Destination: 103.225.188.18
   Port: 27017
   Description: MongoDB - TEST ONLY
   ```

2. **Add MongoDB Authentication:**
   Make sure MongoDB has strong authentication enabled.

### Step 4: Verify Connection

After configuring pfSense:

1. **Test from Vercel:**
   ```bash
   # Deploy backend again
   vercel --prod
   ```

2. **Test Registration:**
   ```bash
   curl -X POST https://your-backend.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"Test123!","accountType":"single","name":"Test","age":"25","gender":"male"}'
   ```

3. **Should return:**
   ```json
   {"message":"User registered successfully..."}
   ```

## Security Best Practices

### 1. Use Specific IP Ranges
```
✅ DO: Whitelist only Vercel/AWS IP ranges
❌ DON'T: Open MongoDB to entire internet
```

### 2. MongoDB Authentication
```
✅ Ensure MongoDB requires username/password
✅ Use strong passwords
✅ Create separate user for application
```

### 3. MongoDB Configuration
Edit `/etc/mongod.conf`:
```yaml
net:
  port: 27017
  bindIp: 0.0.0.0  # Listen on all interfaces

security:
  authorization: enabled  # Require authentication
```

### 4. Monitor Access
```bash
# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Check pfSense logs
# Firewall → Rules → View logs
```

## Troubleshooting

### Issue: Still Cannot Connect

**Check 1: Verify pfSense Rule**
```
Status → System Logs → Firewall
Look for blocked connections from Vercel IPs
```

**Check 2: Test from Your Machine**
```bash
# This should work (local)
nc -zv 103.225.188.18 27017

# Test from outside
# Ask friend to test or use online tool
```

**Check 3: Check MongoDB Binding**
```bash
# SSH to Proxmox/MongoDB server
netstat -tlnp | grep 27017

# Should show:
# 0.0.0.0:27017 (listening on all interfaces)
```

**Check 4: Verify Route**
```bash
# On pfSense
traceroute -I 103.225.188.18
```

## Alternative Solution

If firewall configuration is too complex, consider:

### Option A: VPN Tunnel
```
Set up VPN between Vercel and your network
Use Tailscale or similar
```

### Option B: MongoDB Atlas
```
Use cloud-hosted MongoDB (free tier available)
No firewall configuration needed
```

### Option C: Self-Hosted Backend
```
Host backend on same network as MongoDB
Use Proxmox VM for both
```

## Current Configuration

### Your Setup:
```
MongoDB Server: 103.225.188.18:27017
Database: mydb
Network: Behind pfSense firewall
Frontend: Netlify (https://coupledelight.com)
Backend: Vercel (needs MongoDB access)
```

### Required Changes:
```
✅ pfSense: Allow Vercel IPs → Port 27017
✅ MongoDB: Verify bindIp = 0.0.0.0
✅ Vercel: Correct MongoDB URI in env vars
```

## Quick Fix Command

Run this on pfSense:
```bash
# Add rule to allow Vercel
echo "pass in quick on wan proto tcp from 3.208.0.0/12 to 103.225.188.18 port 27017" | pfctl -a wan -f -
```

## After Configuration

Once pfSense is configured:

1. **Redeploy Backend:**
   ```bash
   vercel --prod
   ```

2. **Update Frontend:**
   ```bash
   cd client
   # Update .env.production with new backend URL
   npm run build
   netlify deploy --prod --dir=build
   ```

3. **Test:**
   ```bash
   # Registration
   curl -X POST https://coupledelight.com/register
   
   # Login
   curl -X POST https://coupledelight.com/login
   ```

---

## Need Help?

If pfSense configuration is complex, you have two easier options:

1. **MongoDB Atlas** (5 minutes setup, free)
2. **Host backend on your Proxmox** (no firewall issues)

Let me know which approach you prefer!
