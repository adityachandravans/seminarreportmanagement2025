# 🔧 Local Environment Setup

## ⚠️ ACTION REQUIRED

I've created `backend/.env` file, but you need to add your MongoDB password!

---

## 📋 Step-by-Step Setup

### Step 1: Get Your MongoDB Password

1. Go to: https://cloud.mongodb.com
2. Click **Database Access** (left sidebar)
3. Find user: `seminar_admin`
4. If you don't remember the password:
   - Click **Edit** on the user
   - Click **Edit Password**
   - Set a new password (e.g., `MySecurePass123`)
   - **COPY THE PASSWORD!**

### Step 2: Update backend/.env File

Open `backend/.env` and replace `YOUR_PASSWORD` with your actual password:

**Before:**
```
MONGODB_URI=mongodb+srv://seminar_admin:YOUR_PASSWORD@seminarmanagement...
```

**After (example if password is MySecurePass123):**
```
MONGODB_URI=mongodb+srv://seminar_admin:MySecurePass123@seminarmanagement.ylxplia.mongodb.net/seminar_management?retryWrites=true&w=majority&appName=seminarmanagement
```

### Step 3: Handle Special Characters in Password

If your password has special characters, URL encode them:

| Character | Replace With |
|-----------|--------------|
| @ | %40 |
| # | %23 |
| $ | %24 |
| % | %25 |
| ^ | %5E |
| & | %26 |
| * | %2A |
| ( | %28 |
| ) | %29 |

**Example:**
- Password: `Pass@123#`
- Encoded: `Pass%40123%23`

### Step 4: Test the Connection

```powershell
cd backend
npm start
```

**Expected output:**
```
✓ Loaded environment from backend/.env
✓ Connected to MongoDB
✓ Database Name: seminar_management
✓ Server is running on port 5000
```

---

## 🚨 Quick Fix Commands

### Option 1: Edit Manually
```powershell
notepad backend/.env
```
Then replace `YOUR_PASSWORD` with your actual MongoDB password.

### Option 2: Use PowerShell (if password is simple)
```powershell
# Replace YOUR_ACTUAL_PASSWORD with your real password
$password = "YOUR_ACTUAL_PASSWORD"
$content = Get-Content backend/.env -Raw
$content = $content -replace "YOUR_PASSWORD", $password
Set-Content backend/.env -Value $content
```

---

## ✅ Verification Checklist

After updating the password:

- [ ] Open `backend/.env`
- [ ] Verify `MONGODB_URI` has your actual password (not `YOUR_PASSWORD`)
- [ ] No `<` or `>` symbols in the connection string
- [ ] Special characters are URL encoded if needed
- [ ] Run `cd backend && npm start`
- [ ] See "Connected to MongoDB" message

---

## 🔒 Security Note

**IMPORTANT:** The `backend/.env` file is already in `.gitignore` and will NOT be pushed to GitHub. This keeps your password safe!

---

## 🆘 Troubleshooting

### Error: "Authentication failed"
- Double-check your password
- Make sure special characters are URL encoded
- Verify the user exists in MongoDB Atlas

### Error: "IP not whitelisted"
1. Go to MongoDB Atlas
2. Click **Network Access**
3. Click **Add IP Address**
4. Click **Allow Access from Anywhere** (0.0.0.0/0)
5. Click **Confirm**

### Error: "MONGODB_URI is required"
- Make sure you saved the `backend/.env` file
- Check the file is in `backend/.env` (not root `.env`)
- Restart your terminal/IDE

---

## 🎯 Current Status

- ✅ `backend/.env` file created
- ⏳ **YOU NEED TO:** Add your MongoDB password
- ⏳ **THEN:** Test by running `cd backend && npm start`

---

**Once you add your password, the backend will work locally!** 🚀
