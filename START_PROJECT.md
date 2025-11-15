# 🚀 How to Start the Project

## ⚠️ IMPORTANT: Create .env File First!

Before running the project, you **MUST** create a `.env` file in the `backend/` folder.

### Step 1: Create backend/.env file

Create a new file called `.env` in the `backend/` folder with this content:

```env
MONGODB_URI=mongodb://localhost:27017/seminar-management
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production-12345
PORT=5000
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:5000
```

**Note:** 
- If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string
- Change `JWT_SECRET` to a secure random string

### Step 2: Start Backend Server

Open a terminal and run:

```bash
cd backend
npm run dev
```

**Look for these messages:**
- ✅ `✓ Connected to MongoDB`
- ✅ `✓ Server is running on port 5000`
- ✅ `✅ Registered API routes`

### Step 3: Start Frontend Server

Open a **NEW** terminal and run:

```bash
cd frontend
npm run dev
```

**The frontend will start on:**
- `http://localhost:5173` (Vite default)
- Or `http://localhost:3000`

### Step 4: Open in Browser

Open your browser and go to the frontend URL shown in the terminal.

You should see the landing page with role selection options.

## 🔍 Verify Everything is Working

### Test Backend:
Open browser and go to: `http://localhost:5000/health`

Should show MongoDB connection status.

### Test API:
Open browser and go to: `http://localhost:5000/api/test`

Should return API status.

## 🐛 Troubleshooting

### Backend won't start:
- ❌ Check if `.env` file exists in `backend/` folder
- ❌ Check if MongoDB is running
- ❌ Check console for error messages

### Frontend can't connect:
- ❌ Make sure backend is running first
- ❌ Check browser console for errors
- ❌ Verify API URL in console: `🔗 API Base URL: http://localhost:5000/api`

### MongoDB connection fails:
- ❌ Start MongoDB service
- ❌ Check `MONGODB_URI` in `.env` is correct
- ❌ For Atlas: Check connection string and IP whitelist

## 📝 Quick Commands

```bash
# Start Backend
cd backend
npm run dev

# Start Frontend (in new terminal)
cd frontend
npm run dev

# Test Backend Health
curl http://localhost:5000/health
```

## ✅ Success Indicators

1. Backend console shows: `✓ Connected to MongoDB`
2. Backend console shows: `✓ Server is running on port 5000`
3. Frontend console shows: `🔗 API Base URL: http://localhost:5000/api`
4. Browser opens to frontend URL
5. You can register/login users

