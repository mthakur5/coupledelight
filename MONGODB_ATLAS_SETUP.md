# 🗄️ MongoDB Atlas Setup Guide

## Production ke liye MongoDB Atlas Setup Karo

Production mein local MongoDB nahi chalega, isliye **MongoDB Atlas** (free cloud database) use karenge.

---

## 📝 Step-by-Step Setup

### **STEP 1: MongoDB Atlas Account Banao**

1. **Website par jao:** https://www.mongodb.com/cloud/atlas/register
2. **Sign Up karo** (Google account se sign up kar sakte ho - easiest)
3. Email verify karo

---

### **STEP 2: Free Cluster Banao**

1. **"Build a Database"** button click karo

2. **Plan Select karo:**
   - ✅ **M0 (Free)** select karo
   - ❌ M10 ya M30 mat select karo (paid hai)

3. **Provider & Region:**
   - **Cloud Provider:** AWS (recommended)
   - **Region:** Mumbai (ap-south-1) ya closest region
   - ✅ Free tier available dikhna chahiye

4. **Cluster Name:**
   - Default "Cluster0" rakh sakte ho
   - Ya "coupledelight" naam de sakte ho

5. **"Create"** button click karo
6. **Wait karo** 2-3 minutes (cluster setup ho raha hai)

---

### **STEP 3: Database User Banao**

Cluster ready hone ke baad:

1. **"Security" → "Database Access"** par jao (left menu)
2. **"Add New Database User"** click karo
3. **User Setup:**
   - **Authentication Method:** Password
   - **Username:** `coupleadmin` (ya koi bhi naam)
   - **Password:** Strong password banao (yaad rakhna!)
     - Example: `Couple@2024#Secure` 
     - **Password copy kar lo** - baad mein chahiye hoga
   - **Database User Privileges:** Read and write to any database
4. **"Add User"** click karo

---

### **STEP 4: Network Access Allow Karo**

1. **"Security" → "Network Access"** par jao
2. **"Add IP Address"** click karo
3. **Allow Access from Anywhere:**
   - **"Allow Access from Anywhere"** button click karo
   - Automatically `0.0.0.0/0` add ho jayega
   - (Production mein specific IPs add karna better hai, but start mein ye easy hai)
4. **"Confirm"** click karo

---

### **STEP 5: Connection String Copy Karo**

1. **"Database"** tab par wapas jao
2. **"Connect"** button click karo (apne cluster par)
3. **"Drivers"** option select karo
4. **Driver:** Node.js select karo
5. **Version:** 4.1 or later select karo

6. **Connection String dikhega:**
```
mongodb+srv://coupleadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **Copy karo** ye connection string

---

### **STEP 6: Password Replace Karo**

Connection string mein `<password>` ko replace karo apne actual password se:

**Before:**
```
mongodb+srv://coupleadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**After (example):**
```
mongodb+srv://coupleadmin:Couple@2024#Secure@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

⚠️ **Important:** 
- Password mein special characters hai to URL encode karo:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `&` → `%26`

**Example with encoding:**
```
mongodb+srv://coupleadmin:Couple%402024%23Secure@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## 🎯 Final MongoDB URI

Tumhara final connection string kuch aisa dikhega:

```
mongodb+srv://coupleadmin:yourpassword@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

**Ye hi connection string Vercel mein `MONGODB_URI` ke liye use karna hai!**

---

## 📋 Vercel Environment Variables

Vercel dashboard mein ye add karo:

```
MONGODB_URI=mongodb+srv://coupleadmin:yourpassword@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
DB_NAME=coupledelight
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
CLIENT_URL=https://coupledelight.netlify.app
PORT=5001
```

---

## ✅ Testing

Connection test karne ke liye:

1. Vercel mein deploy karo backend
2. Browser mein kholo: `https://coupledelight.vercel.app/api/health`
3. Agar MongoDB connected hai to console logs mein dikhega: "MongoDB connected successfully"

---

## 🔍 Troubleshooting

### Problem: "MongoNetworkError"
**Solution:** Network Access check karo, 0.0.0.0/0 add hai ki nahi

### Problem: "Authentication failed"
**Solution:** Username/password check karo, special characters encode karo

### Problem: "Connection timeout"
**Solution:** 
- Cluster ready hai ki nahi check karo
- Region change karke try karo (Mumbai se Singapore try karo)

---

## 💡 Quick Commands

### MongoDB Atlas Dashboard URLs:
- Dashboard: https://cloud.mongodb.com
- Database Access: https://cloud.mongodb.com/v2/DATABASE_ACCESS
- Network Access: https://cloud.mongodb.com/v2/NETWORK_ACCESS

---

## 🎉 Done!

Ab tumhare paas hai:
- ✅ Free MongoDB Atlas cluster
- ✅ Database user credentials  
- ✅ Connection string (MONGODB_URI)
- ✅ Network access configured

**Is connection string ko Vercel environment variables mein add karo!** 🚀
