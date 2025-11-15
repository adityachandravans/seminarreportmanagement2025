# Diagnostic Checklist - Why Data Isn't Saving to MongoDB

## Step 1: Check Backend Server Console

When you start the backend server (`npm run dev` in backend folder), you should see:

### ✅ Good Signs:
- `✓ Connected to MongoDB`
- `✓ Database Name: [your-database-name]`
- `✓ Server is running on port 5000`
- `✓ Registered API routes`

### ❌ Bad Signs:
- `✗ MongoDB connection error`
- `✗ Error: MONGODB_URI is required`
- `✗ Error: JWT_SECRET is required`

## Step 2: Check Frontend Console (Browser DevTools)

Open browser console (F12) and look for:

### When Registration is Attempted:
1. `🔗 API Base URL: http://localhost:5000/api`
2. `📝 Attempting registration: {email, name, role}`
3. `📤 POST /auth/register`
4. `✅ POST /auth/register - Status: 201` (success)
   OR
   `❌ POST /auth/register - Status: XXX` (error)

## Step 3: Check Backend Console When Registration Happens

You should see:
1. `📥 POST /api/auth/register - [timestamp]`
2. `📥 Register request received at: [timestamp]`
3. `📥 Request body: {...}`
4. `📊 MongoDB connection state: 1`
5. `✅ MongoDB is connected`
6. `✓ User saved to MongoDB: {...}`
7. `✓ Registration successful, returning response`

## Step 4: Common Issues and Solutions

### Issue 1: "MONGODB_URI is required"
**Solution:** Create `backend/.env` file with:
```env
MONGODB_URI=mongodb://localhost:27017/seminar-management
JWT_SECRET=your-secret-key-here
PORT=5000
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:5000
```

### Issue 2: "MongoDB connection error"
**Solution:** 
- Make sure MongoDB is running
- For local MongoDB: `mongod` should be running
- For MongoDB Atlas: Check connection string is correct
- Check firewall/network settings

### Issue 3: "Network error: Could not connect to server"
**Solution:**
- Check if backend is running on port 5000
- Check if frontend is calling correct URL
- Check CORS settings in backend/.env

### Issue 4: "Database connection unavailable"
**Solution:**
- Backend connects to MongoDB AFTER server starts
- Wait for `✓ Connected to MongoDB` message
- Check MongoDB is running

### Issue 5: Data not appearing in MongoDB
**Solution:**
- Use MongoDB Compass to check database
- Database name is in the connection string (after last `/`)
- Collection name is `users` (plural)
- Check if user was actually saved (look for console log)

## Step 5: Manual Test

### Test 1: Backend Health Check
```bash
curl http://localhost:5000/health
```
Should return: `{"status":"ok","message":"Server is running"}`

### Test 2: Register Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User","role":"student"}'
```

### Test 3: Check MongoDB
```bash
# Using MongoDB shell
mongo
use seminar-management
db.users.find().pretty()
```

## Step 6: What to Check

1. ✅ `.env` file exists in `backend/` directory
2. ✅ MongoDB is running (check `mongod` process or MongoDB service)
3. ✅ Backend server starts without errors
4. ✅ Frontend connects to correct API URL
5. ✅ Browser console shows API calls
6. ✅ Backend console shows incoming requests
7. ✅ No CORS errors in browser console
8. ✅ MongoDB connection is successful

## Step 7: Logs to Share

If still not working, share:
1. Backend console output (from server start to registration attempt)
2. Browser console output (F12 > Console tab)
3. Network tab (F12 > Network tab > look for /api/auth/register)
4. Contents of `backend/.env` file (remove sensitive data)

