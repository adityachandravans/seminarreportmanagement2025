# Vercel Deployment Guide - Frontend Only

## ⚠️ Important: Vercel is for Frontend Only

Vercel is perfect for your React frontend but **cannot host your Express backend**.

## 🎯 Recommended Architecture

```
Frontend (Vercel) → Backend (Render/Railway) → Database (MongoDB Atlas)
     FREE              FREE TIER                    FREE TIER
```

## 📦 Frontend Deployment on Vercel

### Step 1: Prepare Frontend for Deployment

1. **Update frontend build configuration:**

Create `frontend/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

2. **Update API URL for production:**

In `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

```powershell
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

#### Option B: Vercel Dashboard

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import from GitHub
4. Select: `seminarreportmanagement2025`
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
6. Add Environment Variables:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
7. Click "Deploy"

### Step 3: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## 🔧 Backend Deployment Options

### Option 1: Render (Recommended - Free Tier)

**Why Render:**
- ✅ Free tier available
- ✅ Easy MongoDB integration
- ✅ Automatic deployments from GitHub
- ✅ Environment variables support
- ✅ File uploads supported

**Steps:**

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name:** seminar-backend
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. Add Environment Variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret
   SENDGRID_API_KEY=your_key
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
7. Click "Create Web Service"

### Option 2: Railway (Alternative - Free Tier)

**Why Railway:**
- ✅ $5 free credit monthly
- ✅ Very easy setup
- ✅ Built-in database options
- ✅ Great developer experience

**Steps:**

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Add MongoDB service
7. Configure environment variables
8. Deploy

### Option 3: Heroku (Paid - $5/month minimum)

- No longer has free tier
- Good for production
- Easy scaling

## 🗄️ Database: MongoDB Atlas (Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0 Sandbox)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow all)
5. Get connection string
6. Update backend environment variables

## 🔗 Complete Deployment Flow

### 1. Deploy Database (MongoDB Atlas)
```
✅ Create cluster
✅ Get connection string
✅ Whitelist IPs
```

### 2. Deploy Backend (Render/Railway)
```
✅ Connect GitHub
✅ Configure build
✅ Add environment variables
✅ Deploy
✅ Get backend URL
```

### 3. Deploy Frontend (Vercel)
```
✅ Connect GitHub
✅ Set root directory to 'frontend'
✅ Add VITE_API_URL with backend URL
✅ Deploy
✅ Get frontend URL
```

### 4. Update CORS
```
✅ Update backend CORS_ORIGIN with Vercel URL
✅ Redeploy backend
```

## 📝 Environment Variables Checklist

### Backend (Render/Railway)
- [ ] `PORT` = 5000
- [ ] `MONGODB_URI` = MongoDB Atlas connection string
- [ ] `JWT_SECRET` = Strong random string
- [ ] `SENDGRID_API_KEY` = Your SendGrid key
- [ ] `EMAIL_FROM_ADDRESS` = Your email
- [ ] `EMAIL_FROM_NAME` = Seminar Report System
- [ ] `EMAIL_REPLY_TO` = Your email
- [ ] `CORS_ORIGIN` = Your Vercel URL
- [ ] `FRONTEND_URL` = Your Vercel URL
- [ ] `NODE_ENV` = production

### Frontend (Vercel)
- [ ] `VITE_API_URL` = Your backend URL + /api

## 🧪 Testing Deployment

1. **Test Backend:**
   ```
   https://your-backend.onrender.com/health
   ```

2. **Test Frontend:**
   ```
   https://your-app.vercel.app
   ```

3. **Test Full Flow:**
   - Register as student
   - Check OTP email
   - Verify OTP
   - Login
   - Upload report

## 💰 Cost Breakdown

| Service | Tier | Cost |
|---------|------|------|
| Vercel (Frontend) | Hobby | **FREE** |
| Render (Backend) | Free | **FREE** |
| MongoDB Atlas | M0 | **FREE** |
| SendGrid | Free | **FREE** (100 emails/day) |
| **Total** | | **$0/month** |

## 🚨 Important Notes

1. **Free Tier Limitations:**
   - Render: Spins down after 15 min inactivity (cold starts)
   - MongoDB Atlas: 512 MB storage
   - SendGrid: 100 emails/day

2. **File Uploads:**
   - Render supports file uploads
   - Consider using cloud storage (AWS S3, Cloudinary) for production

3. **CORS Configuration:**
   - Must update CORS_ORIGIN with your Vercel URL
   - Add both with and without trailing slash

## 🎯 Quick Start Commands

```powershell
# Deploy Frontend to Vercel
cd frontend
vercel --prod

# Deploy Backend to Render
# Use Render dashboard (easier)

# Or use Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Render/Railway
- [ ] Backend environment variables configured
- [ ] Backend health check working
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables configured
- [ ] CORS updated with Vercel URL
- [ ] Test registration flow
- [ ] Test OTP email delivery
- [ ] Test file upload
- [ ] Custom domain configured (optional)

---

**Ready to deploy? Start with MongoDB Atlas, then backend, then frontend!** 🚀
