# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Verify Setup
```powershell
.\VERIFY_SETUP.ps1
```

### Step 2: Start Servers
```powershell
.\START_DEV.ps1
```

### Step 3: Open Browser
```
http://localhost:3000
```

## 📋 Common Commands

### Development
```powershell
# Start everything
.\START_DEV.ps1

# Test system
.\test-system.ps1

# Verify setup
.\VERIFY_SETUP.ps1
```

### Manual Start
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **API:** http://localhost:5000/api
- **Health:** http://localhost:5000/health

## 👥 Test Users

Create users through the registration page:
- Select role (Student/Teacher/Admin)
- Fill in details
- Login immediately (no email verification needed)

## 🔧 Troubleshooting

### Servers won't start
```powershell
# Check if ports are in use
netstat -ano | findstr ":5000 :3000"

# Kill process if needed
taskkill /F /PID <process_id>
```

### MongoDB not running
```powershell
# Check service
Get-Service MongoDB*

# Start service
Start-Service MongoDB
```

### Dependencies missing
```powershell
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## 📚 More Info

- Full documentation: `README.md`
- Deployment guide: `DEPLOYMENT_GUIDE.md`
- Project status: `PROJECT_STATUS.md`

## ✅ System Check

Run this to verify everything:
```powershell
.\test-system.ps1
```

Expected output:
```
Testing Backend Health...
Backend: OK - MongoDB: connected
Testing API...
API: OK
Testing Frontend...
Frontend: OK

All systems operational!
```

---

**That's it! You're ready to go! 🎉**
