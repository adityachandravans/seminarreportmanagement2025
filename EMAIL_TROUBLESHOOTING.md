# Email Service Troubleshooting Guide

## 🚨 Current Issue: SendGrid Credits Exceeded

Your SendGrid account has reached its email sending limit.

### Error Message
```
Maximum credits exceeded
```

## 📊 SendGrid Free Tier Limits

- **Daily Limit:** 100 emails/day
- **Monthly Limit:** Varies by plan
- **Reset:** Every 24 hours (midnight UTC)

## ✅ Immediate Solutions

### Solution 1: Use Console OTP (Development)

**The system is designed to work without email!**

When SendGrid fails, OTP codes are automatically logged to the backend console.

**How to use:**
1. Register as student/teacher
2. Check backend terminal for OTP
3. Look for this box:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL VERIFICATION OTP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User: John Doe
Email: user@example.com
Role: student
OTP Code: 123456
Expires: [timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
4. Enter the OTP code on verification page
5. ✅ Success!

**This works perfectly for development and testing!**

### Solution 2: Wait for SendGrid Reset

- SendGrid free tier resets every 24 hours
- Check your SendGrid dashboard for reset time
- Visit: https://app.sendgrid.com/

### Solution 3: Upgrade SendGrid Plan

**Free Plan:**
- 100 emails/day
- $0/month

**Essentials Plan:**
- 40,000 emails/month
- $19.95/month
- Better deliverability

**Pro Plan:**
- 100,000 emails/month
- $89.95/month
- Advanced features

Visit: https://sendgrid.com/pricing/

### Solution 4: Use Alternative Email Service

#### Option A: Gmail SMTP (Free)

1. **Update `.env`:**
```env
# Comment out SendGrid
# SENDGRID_API_KEY=...

# Add Gmail SMTP
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

2. **Enable App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Generate app password
   - Use in EMAIL_PASSWORD

3. **Update email service code** (see below)

#### Option B: Mailgun (Free Tier)

- 5,000 emails/month free
- Visit: https://www.mailgun.com/

#### Option C: AWS SES (Free Tier)

- 62,000 emails/month free (first year)
- Visit: https://aws.amazon.com/ses/

#### Option D: Nodemailer with Gmail

**Install:**
```bash
npm install nodemailer
```

**Create `backend/src/services/gmail.service.ts`:**
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendOTPEmail = async (to: string, name: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: '🔐 Your Email Verification Code',
    html: `
      <h1>Email Verification</h1>
      <p>Hello ${name},</p>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>Valid for 10 minutes.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
```

## 🔧 Verify SendGrid Configuration

### Check API Key

1. **Login to SendGrid:**
   - Visit: https://app.sendgrid.com/

2. **Check API Key:**
   - Go to: Settings → API Keys
   - Verify key is active
   - Check permissions (Mail Send must be enabled)

3. **Test API Key:**
```bash
cd backend
node test-sendgrid.js
```

### Check Sender Verification

1. **Verify Sender:**
   - Go to: https://app.sendgrid.com/settings/sender_auth
   - Verify your email address
   - Check verification status

2. **Domain Authentication (Optional):**
   - Improves deliverability
   - Prevents spam filtering
   - Recommended for production

### Check Account Status

1. **Dashboard:**
   - Visit: https://app.sendgrid.com/
   - Check account status
   - View email statistics
   - Check remaining credits

2. **Activity Feed:**
   - View sent emails
   - Check delivery status
   - See error messages

## 🎯 Production Recommendations

### For Small Projects (< 100 users/day)

**Option 1: SendGrid Free**
- 100 emails/day
- Perfect for testing
- Easy setup

**Option 2: Gmail SMTP**
- Free
- 500 emails/day limit
- Good for small projects

### For Medium Projects (100-1000 users/day)

**Option 1: SendGrid Essentials**
- $19.95/month
- 40,000 emails/month
- Better deliverability

**Option 2: Mailgun**
- Pay as you go
- $0.80 per 1,000 emails
- Good deliverability

### For Large Projects (> 1000 users/day)

**Option 1: SendGrid Pro**
- $89.95/month
- 100,000 emails/month
- Advanced features

**Option 2: AWS SES**
- $0.10 per 1,000 emails
- Highly scalable
- Requires AWS account

## 📝 Current System Behavior

### When Email Fails

1. **Backend logs error** with details
2. **OTP logged to console** (always)
3. **Registration continues** (not blocked)
4. **User can still verify** using console OTP
5. **System remains functional**

### Console OTP Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL VERIFICATION OTP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User: [Name]
Email: [Email]
Role: [Role]
OTP Code: [6-digit code]
Expires: [Timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🧪 Testing Without Email

### Development Mode

1. **Start servers:**
```powershell
.\START_DEV.ps1
```

2. **Register user:**
   - Go to http://localhost:3000
   - Register as student/teacher

3. **Get OTP from console:**
   - Check backend terminal
   - Copy OTP code

4. **Enter OTP:**
   - Paste on verification page
   - Submit

5. **Success!**
   - Redirected to dashboard
   - System works perfectly

### Why This Works

- **Console logging is reliable**
- **No external dependencies**
- **Perfect for development**
- **No cost**
- **Instant delivery**

## 🔐 Security Considerations

### Console OTP (Development Only)

- ✅ Perfect for development
- ✅ No external dependencies
- ⚠️ Not for production
- ⚠️ Console logs visible to server admins

### Email OTP (Production)

- ✅ Secure delivery
- ✅ User privacy
- ✅ Professional
- ✅ Audit trail
- ⚠️ Requires email service
- ⚠️ Costs money (usually)

## 📊 Monitoring Email Delivery

### SendGrid Dashboard

1. **Activity Feed:**
   - Real-time email tracking
   - Delivery status
   - Error messages

2. **Statistics:**
   - Sent emails
   - Delivered emails
   - Bounces
   - Spam reports

3. **Alerts:**
   - Set up alerts for issues
   - Monitor deliverability
   - Track usage

### Application Logs

Backend logs show:
- Email send attempts
- Success/failure status
- Error messages
- OTP codes (development)

## 🎯 Quick Fix Summary

### For Development (Right Now)

**Use Console OTP:**
1. Register user
2. Check backend console
3. Copy OTP
4. Enter on verification page
5. ✅ Done!

**No email needed for development!**

### For Production (Later)

**Option 1: Wait for SendGrid Reset**
- Free
- Resets in 24 hours

**Option 2: Upgrade SendGrid**
- $19.95/month
- 40,000 emails/month

**Option 3: Switch to Gmail SMTP**
- Free
- 500 emails/day

**Option 4: Use AWS SES**
- $0.10 per 1,000 emails
- Highly scalable

## 📞 Support Resources

### SendGrid Support
- Dashboard: https://app.sendgrid.com/
- Docs: https://docs.sendgrid.com/
- Support: https://support.sendgrid.com/

### Alternative Services
- Gmail: https://support.google.com/mail/
- Mailgun: https://www.mailgun.com/
- AWS SES: https://aws.amazon.com/ses/

## ✅ System Status

**Current Status:**
- ✅ Backend running
- ✅ Frontend running
- ✅ MongoDB connected
- ⚠️ SendGrid credits exceeded
- ✅ Console OTP working
- ✅ System fully functional

**Bottom Line:**
**The system works perfectly with console OTP for development!**
No need to fix email service right now for testing.

---

**For immediate testing, just use the console OTP!** 🚀
