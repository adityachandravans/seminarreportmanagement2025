# Render Environment Variables Setup

## ✅ Build Succeeded! Now Add Environment Variables

Your backend built successfully, but it needs environment variables to run.

## 🔧 Required Environment Variables

### Step 1: Go to Render Dashboard

1. Open your backend service on Render
2. Click **"Environment"** tab on the left
3. Click **"Add Environment Variable"**

### Step 2: Add These Variables

Copy and paste each variable:

#### Required Variables:

**PORT**
```
5000
```

**MONGODB_URI**
```
mongodb+srv://your_username:your_password@cluster.mongodb.net/seminar_management?retryWrites=true&w=majority
```
⚠️ Replace with your actual MongoDB Atlas connection string

**JWT_SECRET**
```
your_strong_random_secret_change_this_in_production_min_32_chars
```
⚠️ Generate a strong random string (at least 32 characters)

**SENDGRID_API_KEY**
```
your_sendgrid_api_key_here
```
⚠️ Get from https://app.sendgrid.com/settings/api_keys

**EMAIL_FROM_NAME**
```
Seminar Report System
```

**EMAIL_FROM_ADDRESS**
```
your_verified_email@example.com
```
⚠️ Must be verified in SendGrid

**EMAIL_REPLY_TO**
```
your_email@example.com
```

**CORS_ORIGIN**
```
https://your-frontend-url.onrender.com
```
⚠️ Update after deploying frontend (or use * for testing)

**FRONTEND_URL**
```
https://your-frontend-url.onrender.com
```
⚠️ Update after deploying frontend

**NODE_ENV**
```
production
```

### Step 3: Optional Variables (for Cloudinary)

If you want to use Cloudinary for file storage:

**CLOUDINARY_CLOUD_NAME**
```
your_cloud_name
```

**CLOUDINARY_API_KEY**
```
your_api_key
```

**CLOUDINARY_API_SECRET**
```
your_api_secret
```

## 🗄️ MongoDB Atlas Setup (If Not Done)

### Quick Setup:

1. **Go to:** https://www.mongodb.com/cloud/atlas
2. **Create Account** (free)
3. **Create Cluster:**
   - Choose M0 FREE tier
   - Select region closest to you
   - Name: `seminar-cluster`
4. **Create Database User:**
   - Username: `seminar_admin`
   - Password: Generate strong password (save it!)
5. **Network Access:**
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
6. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `seminar_management`

Example:
```
mongodb+srv://seminar_admin:MyPassword123@seminar-cluster.abc123.mongodb.net/seminar_management?retryWrites=true&w=majority
```

## 🔑 Generate Strong JWT Secret

Use one of these methods:

**Option 1: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Online Generator**
- Go to: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" (256-bit)

**Option 3: Manual**
```
seminar_jwt_secret_2024_production_change_this_to_random_string_min_32_chars
```

## 📧 SendGrid Setup (If Not Done)

1. **Go to:** https://app.sendgrid.com
2. **Sign up** (free tier: 100 emails/day)
3. **Create API Key:**
   - Settings → API Keys
   - Click "Create API Key"
   - Name: "Seminar Management System"
   - Permissions: "Full Access" or "Mail Send"
   - Copy the key (you won't see it again!)
4. **Verify Sender:**
   - Settings → Sender Authentication
   - Verify your email address
   - Use this email as EMAIL_FROM_ADDRESS

## ✅ After Adding Variables

1. **Click "Save Changes"** in Render
2. **Service will auto-redeploy**
3. **Check logs** for success message:
   ```
   ✓ Connected to MongoDB
   ✓ Server is running on port 5000
   ```

## 🧪 Test Your Backend

Once deployed, test these URLs:

**Health Check:**
```
https://your-backend.onrender.com/health
```

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

**API Test:**
```
https://your-backend.onrender.com/api/test
```

## 🔄 Update CORS After Frontend Deploy

After deploying your frontend:

1. Get frontend URL (e.g., `https://seminar-frontend.onrender.com`)
2. Update these variables in backend:
   - `CORS_ORIGIN` = `https://seminar-frontend.onrender.com`
   - `FRONTEND_URL` = `https://seminar-frontend.onrender.com`
3. Backend will auto-redeploy

## 🚨 Common Issues

### "MONGODB_URI is required"
- Make sure you added the variable
- Check spelling: `MONGODB_URI` (all caps)
- Verify connection string format

### "SendGrid API key invalid"
- Verify key is correct
- Check if key has proper permissions
- Try creating a new key

### "CORS error"
- Update `CORS_ORIGIN` with your frontend URL
- Make sure no trailing slash
- Can use `*` for testing (not recommended for production)

## 📋 Environment Variables Checklist

- [ ] PORT = 5000
- [ ] MONGODB_URI = (MongoDB Atlas connection string)
- [ ] JWT_SECRET = (Strong random string, 32+ chars)
- [ ] SENDGRID_API_KEY = (From SendGrid dashboard)
- [ ] EMAIL_FROM_NAME = Seminar Report System
- [ ] EMAIL_FROM_ADDRESS = (Verified email in SendGrid)
- [ ] EMAIL_REPLY_TO = (Your email)
- [ ] CORS_ORIGIN = (Frontend URL or *)
- [ ] FRONTEND_URL = (Frontend URL)
- [ ] NODE_ENV = production

## 🎯 Quick Copy-Paste Template

For testing, you can use this template (replace values):

```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seminar_management
JWT_SECRET=generate_a_strong_random_32_character_secret_here
SENDGRID_API_KEY=SG.your_key_here
EMAIL_FROM_NAME=Seminar Report System
EMAIL_FROM_ADDRESS=your_email@example.com
EMAIL_REPLY_TO=your_email@example.com
CORS_ORIGIN=*
FRONTEND_URL=http://localhost:3000
NODE_ENV=production
```

⚠️ **Important:** Change `CORS_ORIGIN` to your actual frontend URL in production!

---

**After adding all variables, your backend will start successfully!** 🎉

**Next:** Deploy your frontend and update CORS_ORIGIN!
