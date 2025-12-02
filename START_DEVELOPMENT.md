# 🚀 Start Development - Complete Guide

## ⚠️ Current Issue

Your frontend is running but backend is not, causing:
```
❌ net::ERR_CONNECTION_REFUSED
❌ Failed to load resource: http://localhost:5000/api/auth/login
```

---

## 🔧 Fix in 3 Steps

### Step 1: Configure MongoDB Password

**Option A: Automated (Recommended)**
```powershell
./SETUP_BACKEND_NOW.ps1
```
This will prompt for your password and start the backend automatically.

**Option B: Manual**
1. Open `backend/.env`
2. Find line: `MONGODB_URI=mongodb+srv://seminar_admin:YOUR_PASSWORD@...`
3. Replace `YOUR_PASSWORD` with your actual MongoDB Atlas password
4. Save the file

**Get Your Password:**
1. Go to: https://cloud.mongodb.com
2. Database Access → seminar_admin → Edit → Edit Password
3. Set new password (e.g., `MyPass123`)
4. Copy it!

---

### Step 2: Start Backend Server

```powershell
cd backend
npm start
```

**Expected Output:**
```
✓ Loaded environment from backend/.env
✓ CORS allowed origins: [ 'http://localhost:3000', 'http://localhost:5173' ]
✓ Connected to MongoDB
✓ Database Name: seminar_management
✓ Server is running on port 5000
```

**If you see errors:**
- MongoDB authentication failed → Check password is correct
- IP not whitelisted → Add 0.0.0.0/0 in MongoDB Network Access
- Port 5000 in use → Kill the process or change PORT in .env

---

### Step 3: Start Frontend (if not running)

Open a NEW terminal:
```powershell
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

---

## ✅ Verification

### Test Backend
Open browser: http://localhost:5000/health

**Expected:**
```json
{"status":"OK"}
```

### Test Frontend
Open browser: http://localhost:3000

**Expected:**
- Landing page loads
- No errors in console
- Can click on roles

### Test Login
1. Click on a role (Student/Teacher/Admin)
2. Try to login
3. Should see API request in Network tab
4. Should get response (success or error, but not connection refused)

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error: "MONGODB_URI is required"**
- Solution: Add your MongoDB password to `backend/.env`

**Error: "Authentication failed"**
- Solution: Check password is correct in MongoDB Atlas
- Solution: URL encode special characters (@→%40, #→%23, etc.)

**Error: "Port 5000 already in use"**
```powershell
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Error: "IP not whitelisted"**
1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Allow Access from Anywhere (0.0.0.0/0)

### Frontend Shows Network Error

**Check 1: Is backend running?**
```powershell
curl http://localhost:5000/health
```
Should return: `{"status":"OK"}`

**Check 2: Is frontend using correct URL?**
- Check `frontend/.env` has: `VITE_API_URL=http://localhost:5000/api`
- Restart frontend after changing .env

**Check 3: CORS issues?**
- Check backend logs for "CORS blocked" messages
- Verify `backend/.env` has: `CORS_ORIGIN=http://localhost:3000,http://localhost:5173`

---

## 📋 Complete Startup Checklist

- [ ] MongoDB password added to `backend/.env`
- [ ] Backend started: `cd backend && npm start`
- [ ] Backend health check works: http://localhost:5000/health
- [ ] Frontend started: `cd frontend && npm run dev`
- [ ] Frontend loads: http://localhost:3000
- [ ] No console errors
- [ ] Login attempt reaches backend (check Network tab)

---

## 🎯 Quick Commands

### Start Everything (After configuring MongoDB password)

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Stop Everything
Press `Ctrl+C` in each terminal

---

## 🔗 Important URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Backend Health:** http://localhost:5000/health
- **MongoDB Atlas:** https://cloud.mongodb.com

---

## 💡 Pro Tips

1. **Keep both terminals open** - One for backend, one for frontend
2. **Check backend logs** - They show all API requests and errors
3. **Use browser DevTools** - Network tab shows all API calls
4. **MongoDB Compass** - Download to view your database visually

---

**Start with Step 1 to configure your MongoDB password!** 🚀
