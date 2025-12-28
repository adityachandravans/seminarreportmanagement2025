# 🚀 Production Deployment Guide

Complete step-by-step guide to deploy your Seminar Management System to production.

---

## 📋 Deployment Architecture

- **Frontend:** Vercel (React + Vite)
- **Backend:** Render (Node.js + Express)
- **Database:** MongoDB Atlas (Cloud Database)

---

## 🗄️ STEP 1: Setup MongoDB Atlas

### 1.1 Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email or Google account
3. Verify your email address

### 1.2 Create a Cluster

1. Click **"Build a Database"**
2. Choose **FREE** tier (M0 Sandbox)
3. Select **Cloud Provider:** AWS
4. Select **Region:** Closest to your users
5. Cluster Name: SeminarManagement`
6. Click **"Create Cluster"** (takes 3-5 minutes)

### 1.3 Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `seminar_admin`
5. Password: Generate a strong password (SAVE THIS!)
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

### 1.4 Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 1.5 Get Connection String

1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **4.1 or later**
6. Copy the connection string:
   ```
   mongodb+srv://seminar_admin:<password>@seminarmanagement.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password
8. Add database name: `/seminar_management` before the `?`
   ```
   mongodb+srv://seminar_admin:YOUR_PASSWORD@seminarmanagement.xxxxx.mongodb.net/seminar_management?retryWrites=true&w=majority
   ```
`
**SAVE THIS CONNECTION STRING!** You'll need it for Render.

---

## 🔧 STEP 2: Prepare Backend for Render

### 2.1 Update Backend Configuration

The backend is already configured for production. Verify these files exist:

**backend/package.json** - Should have:
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts"
  }
}
```

**backend/Dockerfile** - Already exists and configured

**render.yaml** - Already exists and configured

### 2.2 Environment Variables for Render

You'll need these environment variables (we'll add them in Render dashboard):

```env
PORT=5000
NODE_ENV=production

# MongoDB Atlas Connection String (from Step 1.5)
MONGODB_URI=mongodb+srv://seminar_admin:YOUR_PASSWORD@seminarmanagement.xxxxx.mongodb.net/seminar_management?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# CORS - Your Vercel frontend URL (we'll update this after deploying frontend)
CORS_ORIGIN=https://your-app.vercel.app

# Gmail SMTP Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=seminarmanagement143@gmail.com
EMAIL_PASSWORD=pbptrrbzjdebxwub
EMAIL_FROM_NAME=Seminar Report System
EMAIL_FROM_ADDRESS=seminarmanagement143@gmail.com
EMAIL_REPLY_TO=seminarmanagement143@gmail.com

# Frontend URL (we'll update this after deploying frontend)
FRONTEND_URL=https://your-app.vercel.app

# Cloudinary (if you have it configured)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🚀 STEP 3: Deploy Backend to Render

### 3.1 Create Render Account

1. Go to: https://render.com
2. Sign up with GitHub account
3. Authorize Render to access your GitHub

### 3.2 Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Repository: `seminarreportmanagement2025`
3. Configure the service:
   - **Name:** `seminar-backend`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Instance Type:** `Free`

### 3.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add each variable one by one:

| Key | Value |
|-----|-------|
| PORT | 5000 |
| NODE_ENV | production |
| MONGODB_URI | (Your MongoDB Atlas connection string) |
| JWT_SECRET | (Generate strong random string) |
| CORS_ORIGIN | https://your-app.vercel.app |
| EMAIL_SERVICE | gmail |
| EMAIL_USER | seminarmanagement143@gmail.com |
| EMAIL_PASSWORD | pbptrrbzjdebxwub |
| EMAIL_FROM_NAME | Seminar Report System |
| EMAIL_FROM_ADDRESS | seminarmanagement143@gmail.com |
| EMAIL_REPLY_TO | seminarmanagement143@gmail.com |
| FRONTEND_URL | https://your-app.vercel.app |

**Note:** We'll update CORS_ORIGIN and FRONTEND_URL after deploying frontend.

### 3.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll get a URL like:
   ```
   https://seminar-backend.onrender.com
   ```

### 3.5 Test Backend

Test your backend:
```bash
curl https://seminar-backend.onrender.com/health
```

Expected response:
```json
{"status":"OK"}
```

**SAVE YOUR BACKEND URL!** You'll need it for frontend.

---

## 🎨 STEP 4: Prepare Frontend for Vercel

### 4.1 Update Frontend Environment

Create/update `frontend/.env.production`:

```env
VITE_API_URL=https://seminar-backend.onrender.com/api
```

Replace `seminar-backend.onrender.com` with your actual Render URL.

### 4.2 Optimize Frontend Build

The frontend is already optimized with Vite. Verify `frontend/vite.config.ts` exists.

---

## 🚀 STEP 5: Deploy Frontend to Vercel

### 5.1 Create Vercel Account

1. Go to: https://vercel.com/signup
2. Sign up with GitHub account
3. Authorize Vercel to access your GitHub

### 5.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository:
   - Repository: `seminarreportmanagement2025`
3. Click **"Import"**

### 5.3 Configure Project

1. **Framework Preset:** Vite
2. **Root Directory:** `frontend` (click Edit and select)
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### 5.4 Add Environment Variables

Click **"Environment Variables"**

Add:
| Name | Value |
|------|-------|
| VITE_API_URL | https://seminar-backend.onrender.com/api |

Replace with your actual Render backend URL.

### 5.5 Deploy

1. Click **"Deploy"**
2. Wait for deployment (3-5 minutes)
3. Once deployed, you'll get URLs like:
   - Production: `https://your-app.vercel.app`
   - Preview: `https://your-app-git-main.vercel.app`

**SAVE YOUR VERCEL URL!**

---

## 🔄 STEP 6: Update Backend CORS

Now that you have your Vercel URL, update the backend:

### 6.1 Update Render Environment Variables

1. Go to Render Dashboard
2. Select your backend service
3. Go to **"Environment"** tab
4. Update these variables:

| Key | New Value |
|-----|-----------|
| CORS_ORIGIN | https://your-app.vercel.app,https://your-app-git-main.vercel.app |
| FRONTEND_URL | https://your-app.vercel.app |

**IMPORTANT:** 
- Use your actual Vercel URLs
- NO trailing slashes (/)
- Separate multiple URLs with commas (no spaces)

### 6.2 Redeploy Backend

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for redeployment (2-3 minutes)

---

## ✅ STEP 7: Test Complete Deployment

### 7.1 Test Backend

```bash
# Health check
curl https://seminar-backend.onrender.com/health

# API test
curl https://seminar-backend.onrender.com/api/test
```

### 7.2 Test Frontend

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Click on a role (Student/Teacher/Admin)
3. Try to register
4. Check if OTP email arrives
5. Verify OTP
6. Login and test features

### 7.3 Test Complete Flow

1. **Register:**
   - Fill registration form
   - Receive OTP email
   - Verify OTP
   - Account created

2. **Login:**
   - Enter credentials
   - Successfully login
   - Reach dashboard

3. **Features:**
   - Student: Submit topic, upload report
   - Teacher: Review topics, grade reports
   - Admin: Manage users

---

## 🐛 Troubleshooting

### Backend Issues

**Issue: MongoDB connection failed**
- Check MongoDB Atlas connection string
- Verify IP whitelist (0.0.0.0/0)
- Check database user credentials

**Issue: Backend not starting**
- Check Render logs
- Verify all environment variables
- Check Docker build logs

**Issue: 500 Internal Server Error**
- Check Render logs
- Verify MongoDB connection
- Check environment variables

### Frontend Issues

**Issue: Network Error / CORS**
- Verify CORS_ORIGIN in Render
- Check no trailing slashes
- Verify backend URL in frontend env

**Issue: API calls failing**
- Check VITE_API_URL is correct
- Verify backend is running
- Check browser console for errors

**Issue: Blank page**
- Check Vercel build logs
- Verify build completed successfully
- Check browser console for errors

---

## 📊 Deployment Checklist

### MongoDB Atlas
- [ ] Cluster created
- [ ] Database user created
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string obtained
- [ ] Connection string tested

### Render (Backend)
- [ ] Account created
- [ ] Web service created
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Health check working
- [ ] Backend URL saved

### Vercel (Frontend)
- [ ] Account created
- [ ] Project imported
- [ ] Root directory set to `frontend`
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Frontend URL saved

### Final Configuration
- [ ] CORS_ORIGIN updated in Render
- [ ] FRONTEND_URL updated in Render
- [ ] Backend redeployed
- [ ] Complete flow tested
- [ ] All features working

---

## 🔗 Your Deployment URLs

After deployment, save these URLs:

- **Frontend:** https://your-app.vercel.app
- **Backend:** https://seminar-backend.onrender.com
- **MongoDB:** (Connection string in Render env vars)

---

## 🎯 Post-Deployment

### Monitor Your Application

**Render:**
- Check logs regularly
- Monitor resource usage
- Set up alerts

**Vercel:**
- Check analytics
- Monitor build times
- Review error logs

**MongoDB Atlas:**
- Monitor database size
- Check connection count
- Review performance metrics

### Maintenance

1. **Regular Updates:**
   - Update dependencies
   - Security patches
   - Feature updates

2. **Backups:**
   - MongoDB Atlas auto-backups (Free tier: 2 days)
   - Export important data regularly

3. **Monitoring:**
   - Set up uptime monitoring
   - Check error logs
   - Monitor performance

---

## 💰 Cost Breakdown

### Free Tier Limits

**MongoDB Atlas (Free):**
- 512 MB storage
- Shared RAM
- Unlimited connections
- Perfect for development/small projects

**Render (Free):**
- 750 hours/month
- Spins down after 15 min inactivity
- Spins up on request (30-60 seconds)
- 512 MB RAM

**Vercel (Free):**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Global CDN

### Upgrade Options

If you need more:
- **MongoDB Atlas:** $9/month (2GB storage)
- **Render:** $7/month (always on, 512MB RAM)
- **Vercel:** $20/month (Pro features)

---

## 🎉 Congratulations!

Your Seminar Management System is now live in production!

**Next Steps:**
1. Share your app URL with users
2. Monitor performance
3. Collect feedback
4. Plan improvements

---

**Deployment Complete!** 🚀
