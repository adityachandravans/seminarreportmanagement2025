# 📧 Gmail SMTP Setup Guide

## 🎯 Goal
Set up Gmail to send OTP verification emails from your application.

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Enable 2-Step Verification

1. Go to: https://myaccount.google.com/security
2. Find "2-Step Verification"
3. Click "Get Started"
4. Follow the prompts to enable it
5. ✅ 2-Step Verification must be ON

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. If you don't see this option, make sure 2-Step Verification is enabled
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Enter name: **Seminar Report System**
6. Click **Generate**
7. **COPY THE 16-CHARACTER PASSWORD** (e.g., `abcd efgh ijkl mnop`)
8. ⚠️ You won't see this again!

### Step 3: Update backend/.env

Open `backend/.env` and update these lines:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM_NAME=Seminar Report System
EMAIL_FROM_ADDRESS=your_actual_email@gmail.com
EMAIL_REPLY_TO=your_actual_email@gmail.com
```

**Replace:**
- `your_actual_email@gmail.com` → Your Gmail address
- `abcdefghijklmnop` → The 16-character app password (remove spaces)

**Example:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM_NAME=Seminar Report System
EMAIL_FROM_ADDRESS=john.doe@gmail.com
EMAIL_REPLY_TO=john.doe@gmail.com
```

### Step 4: Test Email Sending

```powershell
cd backend
npm start
```

Then register a new user and check if email arrives!

---

## 🔧 Detailed Instructions

### What is an App Password?

An App Password is a 16-digit passcode that gives an app or device permission to access your Google Account.

**Why do I need it?**
- Gmail blocks "less secure apps" by default
- App passwords are more secure than your regular password
- Each app gets its own password
- You can revoke access anytime

### Creating App Password Step-by-Step

#### Step 1: Check if 2-Step Verification is Enabled

1. Visit: https://myaccount.google.com/security
2. Scroll to "Signing in to Google"
3. Look for "2-Step Verification"
4. Status should be **ON**

**If it's OFF:**
1. Click "2-Step Verification"
2. Click "Get Started"
3. Enter your password
4. Add phone number
5. Verify with code
6. Turn it ON

#### Step 2: Generate App Password

1. Visit: https://myaccount.google.com/apppasswords
   - Or go to Security → App passwords

2. **If you see "App passwords":**
   - Click it
   - Continue to next step

3. **If you DON'T see "App passwords":**
   - Make sure 2-Step Verification is ON
   - Wait a few minutes
   - Refresh the page
   - Try again

4. **Select app:** Mail

5. **Select device:** Other (Custom name)

6. **Enter name:** Seminar Report System

7. **Click Generate**

8. **Copy the password:**
   ```
   abcd efgh ijkl mnop
   ```
   Remove spaces: `abcdefghijklmnop`

9. **Save it somewhere safe!**

#### Step 3: Configure Application

Open `backend/.env`:

```env
# Email Configuration - Using Gmail SMTP
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM_NAME=Seminar Report System
EMAIL_FROM_ADDRESS=your_gmail@gmail.com
EMAIL_REPLY_TO=your_gmail@gmail.com
```

**Update with your details:**
- `EMAIL_USER` → Your Gmail address
- `EMAIL_PASSWORD` → Your 16-character app password (no spaces)
- `EMAIL_FROM_ADDRESS` → Same as EMAIL_USER
- `EMAIL_REPLY_TO` → Same as EMAIL_USER

---

## 🧪 Testing

### Test 1: Start Backend

```powershell
cd backend
npm start
```

**Look for:**
```
✅ Email service is ready
```

**If you see:**
```
❌ Email service error: Invalid login
```
→ Check your email/password in .env

### Test 2: Send Test Email

Register a new user and check:
1. Backend console shows "Email sent successfully"
2. Check your Gmail inbox
3. OTP email should arrive within seconds

### Test 3: Check Gmail Sent Folder

1. Open Gmail
2. Go to "Sent" folder
3. You should see the OTP email you sent

---

## 🚨 Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Cause:** Wrong email or app password

**Fix:**
1. Double-check EMAIL_USER in .env
2. Double-check EMAIL_PASSWORD in .env
3. Make sure you're using app password, not regular password
4. Remove any spaces from app password

### Error: "App passwords not available"

**Cause:** 2-Step Verification not enabled

**Fix:**
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Wait 5 minutes
4. Try generating app password again

### Error: "Less secure app access"

**Cause:** Trying to use regular password

**Fix:**
- Don't use "Less secure app access"
- Use App Password instead (more secure)

### Emails Not Arriving

**Check 1: Spam Folder**
- Check recipient's spam/junk folder
- Mark as "Not Spam"

**Check 2: Gmail Limits**
- Free Gmail: 500 emails/day
- G Suite: 2,000 emails/day
- Wait if limit reached

**Check 3: Backend Logs**
- Check for "Email sent successfully"
- Look for error messages

### Emails Delayed

**Normal Delays:**
- Usually instant (< 5 seconds)
- Can take up to 1 minute
- Check spam folder

**If Consistently Slow:**
- Check internet connection
- Check Gmail status: https://www.google.com/appsstatus

---

## 📊 Gmail Sending Limits

### Free Gmail Account
- **Daily Limit:** 500 emails
- **Per Hour:** ~100 emails
- **Burst:** ~20 emails/minute

### Google Workspace (G Suite)
- **Daily Limit:** 2,000 emails
- **Per Hour:** ~500 emails
- **Better deliverability**

### What Happens at Limit?
- Gmail blocks sending
- Error: "Daily sending quota exceeded"
- Resets after 24 hours

---

## 🔐 Security Best Practices

### DO ✅
- Use App Passwords (not regular password)
- Keep app password in .env file
- Add .env to .gitignore
- Revoke unused app passwords
- Use different app passwords for different apps

### DON'T ❌
- Share your app password
- Commit .env to git
- Use regular Gmail password
- Enable "Less secure app access"
- Reuse app passwords

---

## 🎯 Alternative: Use Console OTP (No Email Setup)

If you don't want to set up Gmail, the system works perfectly with console OTP!

**How it works:**
1. Register user
2. OTP appears in backend console
3. Copy OTP from console
4. Enter on verification page
5. ✅ Done!

**Perfect for:**
- Development
- Testing
- Quick demos
- No email setup needed

---

## 📝 Configuration Summary

### Required Environment Variables

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
EMAIL_FROM_NAME=Seminar Report System
EMAIL_FROM_ADDRESS=your_gmail@gmail.com
EMAIL_REPLY_TO=your_gmail@gmail.com
```

### Optional Variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

---

## 🚀 Quick Start Commands

```powershell
# 1. Update backend/.env with your Gmail credentials

# 2. Start backend
cd backend
npm start

# 3. Start frontend (new terminal)
cd frontend
npm run dev

# 4. Test registration
# Open http://localhost:3001
# Register a new user
# Check email for OTP
```

---

## 📞 Need Help?

### Gmail Support
- Help Center: https://support.google.com/mail/
- App Passwords: https://support.google.com/accounts/answer/185833

### Common Issues
- 2-Step Verification: https://support.google.com/accounts/answer/185839
- App Passwords: https://support.google.com/accounts/answer/185833

---

## ✅ Checklist

Before starting:
- [ ] Gmail account ready
- [ ] 2-Step Verification enabled
- [ ] App password generated
- [ ] App password copied (no spaces)
- [ ] backend/.env updated
- [ ] Backend restarted
- [ ] Test email sent successfully

---

**Setup takes 5 minutes and works perfectly!** 🎉
