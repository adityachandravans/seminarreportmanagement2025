# Production Troubleshooting Guide

## Current Issue: 90-Second Timeout

### Possible Causes:

1. **Backend Not Running**
   - Render service crashed
   - Deployment failed
   - MongoDB connection failed

2. **Render Cold Start (Free Tier)**
   - Takes 50-90 seconds to wake up
   - First request after inactivity times out

3. **Email Service Blocking**
   - Gmail SMTP taking too long
   - Network issues with email provider

## Quick Diagnostics

### 1. Check Backend Health

Open in browser:
```
https://seminarreportmanagement2025.onrender.com/health
```

**Expected:** `{"status":"OK"}`
**If timeout:** Backend is down

### 2. Check API Test Endpoint

```
https://seminarreportmanagement2025.onrender.com/api/test
```

**Expected:** JSON with timestamp and MongoDB status
**If timeout:** Backend is down

### 3. Check Render Logs

Go to: Render Dashboard → Your Service → Logs

**Look for:**
- ✅ `✓ Connected to MongoDB`
- ✅ `✓ Server is running on port 5000`
- ✅ `Your service is live 🎉`

**Red flags:**
- ❌ MongoDB connection errors
- ❌ Port binding errors
- ❌ Module not found errors
- ❌ Crash/restart loops

## Solutions

### Solution 1: Manual Restart (Fastest)

1. Go to Render Dashboard
2. Click your service
3. Click "Manual Deploy" → "Clear build cache & deploy"
4. Wait 3-5 minutes

### Solution 2: Check Environment Variables

Verify these are set in Render:
- `MONGODB_URI` - Must be the Atlas connection string
- `JWT_SECRET` - Any string (32+ chars)
- `PORT` - Should be 5000
- `NODE_ENV` - Should be production
- All EMAIL_* variables

### Solution 3: Simplify Email (Temporary)

If email is causing issues, we can make it optional:

1. Check Render logs for email errors
2. If email is failing, registration should still work (we have try-catch)
3. OTP will be logged to console instead

### Solution 4: Increase Timeout (Already Done)

Frontend timeout is already 90 seconds. If it's still timing out:
- Backend is definitely not responding
- Need to fix backend deployment

## Common Render Issues

### Issue: "No such file or directory"
**Fix:** Check `package.json` scripts and file paths

### Issue: "Cannot find module"
**Fix:** Run `npm install` in backend folder, commit node_modules or package-lock.json

### Issue: "Port already in use"
**Fix:** Render assigns PORT automatically, use `process.env.PORT`

### Issue: "MongoDB connection timeout"
**Fix:** 
- Check MongoDB Atlas is running
- Verify IP whitelist (should be 0.0.0.0/0 for Render)
- Check connection string is correct

## Immediate Action Plan

1. **Check health endpoint** (30 seconds)
2. **Check Render logs** (1 minute)
3. **Manual restart if needed** (3-5 minutes)
4. **Verify environment variables** (2 minutes)
5. **Test registration again** (1 minute)

## Alternative: Use Production URL

Instead of preview URL, use your main Vercel production URL:
```
https://seminarreportmanagement2025.vercel.app
```

This might be more stable than preview deployments.

## Last Resort: Redeploy Everything

1. **Backend:**
   - Render → Manual Deploy → Clear cache & deploy
   
2. **Frontend:**
   - Vercel → Deployments → Redeploy

3. **Wait 5 minutes** for both to complete

4. **Test with new email address**

## Need Help?

Check these in order:
1. Render logs (most important)
2. Browser console (frontend errors)
3. Network tab (see actual request/response)
4. MongoDB Atlas (database status)

---

**Next Step:** Check the health endpoint and Render logs, then report back what you see!
