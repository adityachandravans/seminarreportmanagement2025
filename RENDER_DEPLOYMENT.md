# Render Deployment Guide - Complete Full-Stack

## 🎯 Deployment Strategy

Deploy your entire project on Render:
- **Backend** → Render Web Service (Free Tier)
- **Frontend** → Render Static Site (Free Tier)
- **Database** → MongoDB Atlas (Free Tier)

**Total Cost: $0/month** 🎉

## 📋 Prerequisites

1. GitHub account with your code pushed
2. Render account (sign up at https://render.com)
3. MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)

## 🗄️ Step 1: Setup MongoDB Atlas (5 minutes)

### 1.1 Create Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/Login
3. Click "Build a Database"
4. Choose "M0 FREE" tier
5. Select region closest to you
6. Name cluster: `seminar-cluster`
7. Click "Create"

### 1.2 Create Database User
1. Security → Database Access
2. Click "Add New Database User"
3. Username: `seminar_admin`
4. Password: Generate secure password (save it!)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

### 1.3 Whitelist IP Addresses
1. Security → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.4 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `seminar_management`

Example:
```
mongodb+srv://seminar_admin:YOUR_PASSWORD@seminar-cluster.xxxxx.mongodb.net/seminar_management?retryWrites=true&w=majority
```

## 🔧 Step 2: Deploy Backend on Render (10 minutes)

### 2.1 Create Web Service
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select repository: `seminarreportmanagement2025`
5. Click "Connect"

### 2.2 Configure Service

**Basic Settings:**
- Name: `seminar-backend`
- Region: Choose closest to you
- Branch: `main`
- Root Directory: `backend`
- Runtime: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Instance Type:**
- Select: `Free` (or upgrade to $7/month for no cold starts)

### 2.3 Add Environment Variables

Click "Advanced" → "Add Environment Variable"

Add these variables:

```
PORT=5000
MONGODB_URI=mongodb+srv://seminar_admin:YOUR_PASSWORD@seminar-cluster.xxxxx.mongodb.net/seminar_management
JWT_SECRET=your_strong_random_secret_here_change_this
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM_NAME=Seminar Report System
EMAIL_FROM_ADDRESS=your_email@example.com
EMAIL_REPLY_TO=your_email@example.com
CORS_ORIGIN=https://your-frontend-url.onrender.com
FRONTEND_URL=https://your-frontend-url.onrender.com
NODE_ENV=production
```

**Note:** You'll update CORS_ORIGIN and FRONTEND_URL after deploying frontend

### 2.4 Deploy Backend
1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Once deployed, copy your backend URL
   - Example: `https://seminar-backend.onrender.com`

### 2.5 Test Backend
Visit: `https://seminar-backend.onrender.com/health`

Should return:
```json
{
  "status": "ok",
  "message": "Server is running",
  "mongodb": {
    "connected": true,
    "database": "seminar_management"
  }
}
```

## 🎨 Step 3: Deploy Frontend on Render (5 minutes)

### 3.1 Create Static Site
1. Dashboard → "New +" → "Static Site"
2. Connect same repository
3. Click "Connect"

### 3.2 Configure Static Site

**Basic Settings:**
- Name: `seminar-frontend`
- Branch: `main`
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`

### 3.3 Add Environment Variable

Click "Advanced" → "Add Environment Variable"

```
VITE_API_URL=https://seminar-backend.onrender.com/api
```

Replace with your actual backend URL from Step 2.4

### 3.4 Deploy Frontend
1. Click "Create Static Site"
2. Wait 3-5 minutes
3. Copy your frontend URL
   - Example: `https://seminar-frontend.onrender.com`

## 🔄 Step 4: Update Backend CORS (2 minutes)

### 4.1 Update Environment Variables
1. Go to backend service dashboard
2. Environment → Edit
3. Update these variables:
   ```
   CORS_ORIGIN=https://seminar-frontend.onrender.com
   FRONTEND_URL=https://seminar-frontend.onrender.com
   ```
4. Click "Save Changes"
5. Backend will auto-redeploy

## 🧪 Step 5: Test Your Deployment

### 5.1 Test Backend
```
https://seminar-backend.onrender.com/health
https://seminar-backend.onrender.com/api/test
```

### 5.2 Test Frontend
```
https://seminar-frontend.onrender.com
```

### 5.3 Test Full Flow
1. Open frontend URL
2. Register as Student
3. Check email for OTP
4. Verify OTP
5. Login
6. Upload a report
7. Check if everything works!

## 📝 Configuration Files for Render

Create these files in your project:


### render.yaml (Blueprint)
Already created at project root! This allows one-click deployment.

## 🚀 Alternative: One-Click Deploy with Blueprint

If you have `render.yaml` in your repo:

1. Go to https://dashboard.render.com/blueprints
2. Click "New Blueprint Instance"
3. Connect your repository
4. Render will auto-detect `render.yaml`
5. Fill in environment variables
6. Click "Apply"
7. Both services deploy automatically!

## 💰 Cost Breakdown

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| Backend | Free | $0 | Spins down after 15min inactivity |
| Frontend | Free | $0 | Always on |
| MongoDB Atlas | M0 | $0 | 512MB storage |
| SendGrid | Free | $0 | 100 emails/day |
| **Total** | | **$0/month** | |

### Upgrade Options (Optional)
- Backend to Starter: $7/month (no cold starts, better performance)
- MongoDB to M10: $9/month (2GB storage, better performance)

## ⚠️ Important Notes

### Free Tier Limitations
1. **Backend Cold Starts:**
   - Spins down after 15 minutes of inactivity
   - First request after spin-down takes 30-60 seconds
   - Subsequent requests are fast
   - Solution: Upgrade to $7/month or use cron job to keep alive

2. **Build Minutes:**
   - 500 build minutes/month on free tier
   - Usually enough for small projects

3. **Bandwidth:**
   - 100GB/month on free tier

### File Uploads
- Render supports file uploads
- Files stored on disk (ephemeral on free tier)
- For production, consider:
  - AWS S3
  - Cloudinary
  - Render Disks (paid feature)

## 🔒 Security Checklist

- [x] HTTPS enabled (automatic)
- [x] Environment variables secured
- [x] CORS configured
- [x] MongoDB IP whitelist set
- [x] Strong JWT secret
- [x] SendGrid API key protected
- [ ] Custom domain with SSL (optional)
- [ ] Rate limiting (add in code)
- [ ] Input validation (already in code)

## 🐛 Troubleshooting

### Backend Not Starting
1. Check logs: Dashboard → Service → Logs
2. Verify environment variables
3. Check MongoDB connection string
4. Ensure build command succeeds

### Frontend Not Loading
1. Check build logs
2. Verify VITE_API_URL is correct
3. Check CORS settings in backend
4. Clear browser cache

### OTP Emails Not Sending
1. Verify SENDGRID_API_KEY
2. Check SendGrid dashboard for errors
3. Verify sender email is authenticated
4. Check backend logs

### MongoDB Connection Failed
1. Verify connection string
2. Check IP whitelist (0.0.0.0/0)
3. Verify database user credentials
4. Check MongoDB Atlas status

## 📊 Monitoring

### Render Dashboard
- View logs in real-time
- Monitor deployments
- Check service health
- View metrics

### MongoDB Atlas
- Monitor database performance
- View connection stats
- Check storage usage

### SendGrid
- Track email delivery
- View bounce rates
- Monitor API usage

## 🔄 Continuous Deployment

Once set up, every push to GitHub main branch will:
1. Trigger automatic deployment
2. Run build commands
3. Deploy new version
4. Zero downtime (on paid plans)

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [SendGrid Docs](https://docs.sendgrid.com/)

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Connection string obtained
- [ ] Backend service created on Render
- [ ] Backend environment variables added
- [ ] Backend deployed successfully
- [ ] Backend health check passing
- [ ] Frontend static site created
- [ ] Frontend environment variable added
- [ ] Frontend deployed successfully
- [ ] CORS updated with frontend URL
- [ ] Test registration flow
- [ ] Test OTP email delivery
- [ ] Test login flow
- [ ] Test file upload
- [ ] Test all user roles
- [ ] Custom domain configured (optional)

---

**Your project is now live on Render!** 🎉

**URLs:**
- Frontend: `https://seminar-frontend.onrender.com`
- Backend: `https://seminar-backend.onrender.com`
- API: `https://seminar-backend.onrender.com/api`

**Next Steps:**
1. Share your project URL
2. Add custom domain (optional)
3. Monitor usage and performance
4. Consider upgrading for better performance
5. Add analytics (Google Analytics, etc.)
