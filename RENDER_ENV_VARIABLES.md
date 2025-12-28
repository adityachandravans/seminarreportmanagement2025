# 🔧 Render Environment Variables - Complete List

Copy and paste these environment variables into your Render dashboard.

---

## 📋 Environment Variables for Render

### Required Variables

```
PORT=5000
```

```
NODE_ENV=production
```

```
MONGODB_URI=mongodb+srv://seminar_admin:KzmbfE4rm1YsWOAP@seminarmanagement.fj9gfju.mongodb.net/seminar_management?retryWrites=true&w=majority&appName=seminarmanagement
```

```
JWT_SECRET=seminar_jwt_secret_2024_production_change_this_to_strong_random_string_min_32_chars
```

```
CORS_ORIGIN=https://your-app.vercel.app,https://your-app-git-main.vercel.app
```

```
EMAIL_SERVICE=gmail
```

```
EMAIL_USER=seminarmanagement143@gmail.com
```

```
EMAIL_PASSWORD=pbptrrbzjdebxwub
```

```
EMAIL_FROM_NAME=Seminar Report System
```

```
EMAIL_FROM_ADDRESS=seminarmanagement143@gmail.com
```

```
EMAIL_REPLY_TO=seminarmanagement143@gmail.com
```

```
FRONTEND_URL=https://your-app.vercel.app
```

---

## ⚠️ IMPORTANT NOTES

### 1. CORS_ORIGIN
- **Update after deploying frontend to Vercel**
- Replace `your-app.vercel.app` with your actual Vercel URL
- **NO trailing slashes** (/)
- Separate multiple URLs with commas (no spaces)

**Example:**
```
CORS_ORIGIN=https://seminarmanagement2025.vercel.app,https://seminarmanagement2025-git-main.vercel.app
```

### 2. FRONTEND_URL
- **Update after deploying frontend to Vercel**
- Use your production Vercel URL
- **NO trailing slash** (/)

**Example:**
```
FRONTEND_URL=https://seminarmanagement2025.vercel.app
```

### 3. JWT_SECRET
- **Change to a strong random string**
- Minimum 32 characters
- Use letters, numbers, and special characters

**Generate one:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use: https://randomkeygen.com/

---

## 📝 How to Add in Render

### Method 1: During Service Creation

1. When creating web service
2. Click **"Advanced"**
3. Click **"Add Environment Variable"**
4. Add each variable one by one
5. Click **"Create Web Service"**

### Method 2: After Service Creation

1. Go to your service dashboard
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add each variable
5. Click **"Save Changes"**
6. Render will auto-redeploy

---

## ✅ Verification

After adding all variables, check:

1. **Render Logs:**
   - Look for: `✓ Connected to MongoDB`
   - Look for: `✓ Server is running on port 5000`
   - Look for: `✅ Gmail email service initialized`

2. **Health Check:**
   ```bash
   curl https://your-backend.onrender.com/health
   ```
   Should return: `{"status":"OK"}`

3. **API Test:**
   ```bash
   curl https://your-backend.onrender.com/api/test
   ```
   Should return JSON with timestamp                                                                                                                                                      

---

## 🔄 Update After Frontend Deployment

After deploying frontend to Vercel:

1. Get your Vercel URLs:
   - Production: `https://your-app.vercel.app`
   - Preview: `https://your-app-git-main.vercel.app`

2. Update in Render:
   - Go to Environment tab
   - Update `CORS_ORIGIN`:
     ```
     https://your-app.vercel.app,https://your-app-git-main.vercel.app
     ```
   - Update `FRONTEND_URL`:
     ```
     https://your-app.vercel.app
     ```

3. Save changes (auto-redeploys)

---

## 🔐 Security Best Practices

### DO ✅
- Use strong JWT_SECRET
- Keep MongoDB password secure
- Update CORS_ORIGIN with actual URLs
- Use environment variables (never hardcode)
- Regularly rotate secrets

### DON'T ❌
- Commit .env files to Git
- Share environment variables publicly
- Use weak passwords
- Allow CORS from all origins (*) in production
- Hardcode sensitive data

---

## 📊 Environment Variables Summary

| Variable | Purpose | Update After Frontend Deploy |
|----------|---------|------------------------------|
| PORT | Server port | No |
| NODE_ENV | Environment | No |
| MONGODB_URI | Database connection | No |
| JWT_SECRET | Token signing | No (but change default) |
| CORS_ORIGIN | Frontend URLs | **YES** |
| EMAIL_SERVICE | Email provider | No |
| EMAIL_USER | Gmail address | No |
| EMAIL_PASSWORD | Gmail app password | No |
| EMAIL_FROM_NAME | Sender name | No |
| EMAIL_FROM_ADDRESS | Sender email | No |
| EMAIL_REPLY_TO | Reply-to email | No |
| FRONTEND_URL | Frontend URL | **YES** |

---

## 🎯 Quick Copy-Paste

For Render dashboard, copy this template and fill in your Vercel URLs:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://seminar_admin:KzmbfE4rm1YsWOAP@seminarmanagement.fj9gfju.mongodb.net/seminar_management?retryWrites=true&w=majority&appName=seminarmanagement
JWT_SECRET=seminar_jwt_secret_2024_production_change_this_to_strong_random_string_min_32_chars
CORS_ORIGIN=https://YOUR_VERCEL_URL.vercel.app,https://YOUR_VERCEL_URL-git-main.vercel.app
EMAIL_SERVICE=gmail
EMAIL_USER=seminarmanagement143@gmail.com
EMAIL_PASSWORD=pbptrrbzjdebxwub
EMAIL_FROM_NAME=Seminar Report System
EMAIL_FROM_ADDRESS=seminarmanagement143@gmail.com
EMAIL_REPLY_TO=seminarmanagement143@gmail.com
FRONTEND_URL=https://YOUR_VERCEL_URL.vercel.app
```

**Remember to:**
1. Replace `YOUR_VERCEL_URL` with your actual Vercel URL
2. Change JWT_SECRET to a strong random string

---

**All environment variables ready for Render!** 🚀
