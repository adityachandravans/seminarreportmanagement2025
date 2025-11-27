# OTP System - Quick Reference Card

## 🎯 Quick Facts

- **Students:** Require OTP ✅
- **Teachers:** Require OTP ✅
- **Admins:** No OTP (auto-verified) ✅
- **OTP Length:** 6 digits
- **Validity:** 10 minutes
- **Max Attempts:** 3
- **Email Service:** SendGrid

## 📧 Where to Find OTP

### Option 1: Email (Production)
- Check inbox for "Seminar Report System"
- Subject: "🔐 Your Email Verification Code"
- Large code in center of email

### Option 2: Console (Development)
- Check backend terminal
- Look for box with "📧 EMAIL VERIFICATION OTP"
- OTP Code displayed clearly

## 🔑 Test OTP Flow

### Quick Test (2 minutes)

```bash
# 1. Start servers
.\START_DEV.ps1

# 2. Open browser
http://localhost:3000

# 3. Register as Student
- Click "Student"
- Click "Register here"
- Fill form
- Submit

# 4. Check backend console for OTP
# Look for: OTP Code: 123456

# 5. Enter OTP on verification page

# 6. Success! Redirected to dashboard
```

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Email not received | Check spam folder or use console OTP |
| OTP expired | Click "Resend Code" button |
| Invalid OTP | Check console for correct code |
| Max attempts reached | Click "Resend Code" to get new OTP |
| Backend not starting | Check MongoDB is running |
| Frontend can't connect | Verify backend is on port 5000 |

## 📱 OTP Page Features

- ✅ 6 individual input boxes
- ✅ Auto-focus next box
- ✅ Auto-submit when complete
- ✅ Paste support (Ctrl+V)
- ✅ 10-minute countdown timer
- ✅ Resend button
- ✅ Attempt counter
- ✅ Error messages
- ✅ Success animation

## 🔐 Security

- **Generation:** Crypto-random
- **Storage:** Hashed in database
- **Transmission:** HTTPS only (production)
- **Expiration:** 10 minutes
- **Attempts:** Limited to 3
- **Reset:** New OTP on resend

## 📊 System URLs

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **API:** http://localhost:5000/api
- **Health:** http://localhost:5000/health

## 🧪 Test Scenarios

### ✅ Happy Path
1. Register → 2. Get OTP → 3. Enter OTP → 4. Dashboard

### ⏰ Expiration Test
1. Register → 2. Wait 10 min → 3. Try OTP → 4. Resend → 5. Success

### ❌ Invalid OTP Test
1. Register → 2. Wrong OTP (3x) → 3. Resend → 4. Correct OTP → 5. Success

### 👨‍💼 Admin Test
1. Register as Admin → 2. Immediate Dashboard (No OTP)

## 📞 Support

**Issue?** Check these in order:
1. `.\test-system.ps1` - System health
2. Backend console - OTP code
3. Email spam folder
4. `TEST_OTP_SYSTEM.md` - Full guide
5. `OTP_IMPLEMENTATION_SUMMARY.md` - Details

## ⚡ Quick Commands

```powershell
# Start everything
.\START_DEV.ps1

# Test system
.\test-system.ps1

# Verify setup
.\VERIFY_SETUP.ps1

# Stop servers
# Press Ctrl+C in each terminal
```

## 🎨 Email Preview

```
┌─────────────────────────────────┐
│  🔐 Email Verification Code     │
├─────────────────────────────────┤
│                                 │
│  Hello John Doe,                │
│                                 │
│  Your Verification Code         │
│                                 │
│      ┌─────────────┐            │
│      │   123456    │            │
│      └─────────────┘            │
│                                 │
│  Valid for 10 minutes           │
│                                 │
│  🔒 Security Tips:              │
│  • Never share this code        │
│  • Code expires in 10 minutes   │
│  • 3 attempts maximum           │
│                                 │
└─────────────────────────────────┘
```

## ✨ Status

**All Systems Operational!** ✅

- Backend: Running ✅
- Frontend: Running ✅
- MongoDB: Connected ✅
- SendGrid: Configured ✅
- OTP: Working ✅
- Emails: Sending ✅

---

**Ready to test!** 🚀
