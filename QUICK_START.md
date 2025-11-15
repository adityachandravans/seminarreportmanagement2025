# Quick Start Guide - Fixing Data Not Saving Issue

## Prerequisites Check

1. **Node.js and npm installed**
   ```bash
   node --version
   npm --version
   ```

2. **MongoDB installed and running**
   - Local MongoDB: Make sure `mongod` is running
   - MongoDB Atlas: Have connection string ready

## Step-by-Step Fix

### Step 1: Create Backend .env File

Create a file `backend/.env` with this content:

```env
MONGODB_URI=mongodb://localhost:27017/seminar-management
JWT_SECRET=my-super-secret-jwt-key-change-in-production-12345
PORT=5000
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:5000
```

**Important:** 
- If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string
- Change `JWT_SECRET` to a random secure string

### Step 2: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

**Look for these in console:**
- ✅ `✓ Connected to MongoDB`
- ✅ `✓ Database Name: seminar-management`
- ✅ `✓ Server is running on port 5000`
- ✅ `✅ Registered API routes`

**If you see errors:**
- ❌ `✗ Error: MONGODB_URI is required` → Check `.env` file exists
- ❌ `✗ MongoDB connection error` → Check MongoDB is running

### Step 4: Start Frontend Server

Open a NEW terminal:

```bash
cd frontend
npm run dev
```

Frontend will start on `http://localhost:3000` or `http://localhost:5173`

**In browser console, you should see:**
- `🔗 API Base URL: http://localhost:5000/api`

### Step 5: Test Registration

1. Open browser to frontend URL
2. Select "Student" role
3. Click "Register" or switch to register mode
4. Fill in the form
5. Submit

**Watch browser console (F12):**
- Should see: `📝 Attempting registration`
- Should see: `📤 POST /auth/register`
- Should see: `✅ POST /auth/register - Status: 201`

**Watch backend console:**
- Should see: `📥 POST /api/auth/register`
- Should see: `📥 Register request received`
- Should see: `✅ MongoDB is connected`
- Should see: `✓ User saved to MongoDB`
- Should see: `✓ Registration successful`

### Step 6: Verify Data in MongoDB

**Option 1: MongoDB Compass (GUI)**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Database: `seminar-management`
4. Collection: `users`
5. Should see your registered user

**Option 2: MongoDB Shell**
```bash
mongo
use seminar-management
db.users.find().pretty()
```

**Option 3: Test API**
```bash
curl http://localhost:5000/health
```

## Common Problems & Solutions

### Problem 1: Backend won't start
**Error:** `MONGODB_URI is required`

**Solution:**
- Check `backend/.env` file exists
- Check file has correct content
- Make sure you're running from `backend/` directory

### Problem 2: MongoDB connection fails
**Error:** `✗ MongoDB connection error`

**Solutions:**
- **Local MongoDB:** Start MongoDB service
  - Windows: Check Services > MongoDB
  - Mac/Linux: `brew services start mongodb-community` or `sudo systemctl start mongod`
- **MongoDB Atlas:** 
  - Check connection string is correct
  - Check IP whitelist includes your IP (0.0.0.0/0 for testing)
  - Check username/password are correct

### Problem 3: Frontend can't connect to backend
**Error:** `Network error: Could not connect to server`

**Solutions:**
- Make sure backend is running on port 5000
- Check `frontend/.env` or verify API URL in console
- Check CORS settings in `backend/.env`
- Try `curl http://localhost:5000/health` in terminal

### Problem 4: CORS errors
**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
- Add frontend URL to `CORS_ORIGIN` in `backend/.env`
- Format: `http://localhost:3000,http://localhost:5173`
- Restart backend server

### Problem 5: Data saves but doesn't appear
**Symptoms:** Backend says saved, but MongoDB shows nothing

**Solutions:**
- Check you're looking at correct database
- Database name is in connection string (after last `/`)
- Collection name is `users` (plural, lowercase)
- Refresh MongoDB Compass/Shell
- Check if data is in different database

## Testing Commands

### Test Backend Health
```bash
curl http://localhost:5000/health
```

Should return MongoDB connection status.

### Test API Endpoint
```bash
curl http://localhost:5000/api/test
```

Should return API status.

### Test Registration (Manual)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"name\":\"Test User\",\"role\":\"student\"}"
```

## Still Not Working?

1. Check `DIAGNOSTICS.md` for detailed troubleshooting
2. Share:
   - Backend console output
   - Browser console output (F12)
   - Network tab (F12 > Network > look for failed requests)
   - Contents of `.env` file (remove sensitive data)

## Success Indicators

✅ Backend console shows MongoDB connected
✅ Frontend console shows API URL
✅ Registration form submits without errors
✅ Backend console shows "User saved to MongoDB"
✅ MongoDB database shows the user document

