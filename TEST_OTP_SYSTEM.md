# OTP Verification System - Testing Guide

## Overview

The system now implements OTP (One-Time Password) email verification for **Students** and **Teachers** during registration. **Admins** are auto-verified and don't require OTP.

## How It Works

### Registration Flow

1. **Student/Teacher Registration:**
   - User fills registration form
   - Backend creates unverified user account
   - Generates 6-digit OTP (valid for 10 minutes)
   - Sends OTP via SendGrid email
   - Logs OTP to console (for development/testing)
   - Returns `requiresVerification: true` with `userId` and `email`
   - Frontend redirects to OTP verification page

2. **Admin Registration:**
   - User fills registration form
   - Backend creates verified user account
   - Sends welcome email
   - Returns JWT token immediately
   - Frontend redirects to dashboard (no OTP needed)

### OTP Verification

1. User receives email with 6-digit code
2. User enters code on verification page
3. Backend validates:
   - Code matches
   - Not expired (10 minutes)
   - Attempts < 3
4. On success:
   - Marks email as verified
   - Generates JWT token
   - Sends welcome email
   - Returns token and user data
5. Frontend stores token and redirects to dashboard

## Testing the System

### Test 1: Student Registration with OTP

1. **Start servers:**
   ```powershell
   .\START_DEV.ps1
   ```

2. **Open browser:** http://localhost:3000

3. **Register as Student:**
   - Click "Student" role
   - Click "Register here"
   - Fill in details:
     - Email: your_email@example.com
     - Password: test123
     - Name: Test Student
     - Roll Number: 12345
     - Department: Computer Science
     - Year: 3rd Year
   - Click "Create Account"

4. **Check Console:**
   - Backend terminal will show:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📧 EMAIL VERIFICATION OTP
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   User: Test Student
   Email: your_email@example.com
   Role: student
   OTP Code: 123456
   Expires: [timestamp]
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

5. **Check Email:**
   - Check inbox for email from "Seminar Report System"
   - Subject: "🔐 Your Email Verification Code"
   - Contains 6-digit OTP code

6. **Enter OTP:**
   - Frontend shows OTP verification page
   - Enter the 6-digit code
   - Code auto-submits when all 6 digits entered
   - Or click "Verify Email" button

7. **Success:**
   - Shows "Email verified successfully!"
   - Redirects to student dashboard
   - Welcome email sent

### Test 2: Teacher Registration with OTP

Same as Test 1, but:
- Select "Teacher" role
- Fill teacher-specific fields (Department, Specialization)
- Rest of flow is identical

### Test 3: Admin Registration (No OTP)

1. **Register as Admin:**
   - Click "Admin" role
   - Fill in details
   - Click "Create Account"

2. **Expected:**
   - No OTP page shown
   - Immediately redirected to dashboard
   - Welcome email sent
   - No OTP in console

### Test 4: OTP Expiration

1. Register as student/teacher
2. Wait 10 minutes
3. Try to enter OTP
4. Should show: "OTP has expired. Please request a new one."
5. Click "Resend Code"
6. New OTP generated and sent

### Test 5: Invalid OTP

1. Register as student/teacher
2. Enter wrong OTP code
3. Should show: "Invalid OTP. 2 attempt(s) remaining."
4. Try again with wrong code
5. Should show: "Invalid OTP. 1 attempt(s) remaining."
6. Third wrong attempt
7. Should show: "Maximum verification attempts exceeded. Please request a new OTP."
8. Click "Resend Code" to get new OTP

### Test 6: Resend OTP

1. Register as student/teacher
2. On OTP page, click "Resend Code"
3. New OTP generated
4. Check console for new code
5. Check email for new code
6. Attempts counter reset to 0
7. Timer reset to 10 minutes

## SendGrid Email Configuration

### Current Setup

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM_NAME=Seminar Report System
EMAIL_FROM_ADDRESS=your_email@example.com
EMAIL_REPLY_TO=your_email@example.com
```

### Email Templates

1. **OTP Email:**
   - Beautiful HTML template
   - Large, centered OTP code
   - Expiration time
   - Security tips
   - Professional design

2. **Welcome Email:**
   - Role-specific content
   - Feature highlights
   - Call-to-action button
   - Professional branding

## Troubleshooting

### Email Not Received

1. **Check Spam Folder**
   - SendGrid emails might go to spam initially

2. **Check Console**
   - OTP is always logged to backend console
   - Use console OTP if email fails

3. **Verify SendGrid API Key**
   - Check `.env` file has valid key
   - Test key at https://app.sendgrid.com/

4. **Check Email Service Status**
   - Backend logs show: "✅ SendGrid email service initialized"
   - Or: "❌ Email service initialization failed"

### OTP Not Working

1. **Check Expiration**
   - OTP valid for 10 minutes only
   - Timer shown on verification page

2. **Check Attempts**
   - Maximum 3 attempts allowed
   - Use "Resend Code" to get new OTP

3. **Check Database**
   - User should exist in MongoDB
   - `isEmailVerified` should be `false`
   - `emailVerificationOTP` should match

### Backend Errors

Check backend console for:
- MongoDB connection issues
- SendGrid API errors
- JWT token generation errors

## API Endpoints

### Register
```
POST /api/auth/register
Body: {
  email, password, name, role,
  rollNumber?, department?, year?, specialization?
}
Response (Student/Teacher): {
  message, userId, email, requiresVerification: true
}
Response (Admin): {
  message, token, user
}
```

### Verify OTP
```
POST /api/auth/verify-otp
Body: { userId, otp }
Response: {
  message, token, user
}
```

### Resend OTP
```
POST /api/auth/resend-otp
Body: { userId }
Response: {
  message, expiresIn
}
```

## Security Features

1. **OTP Expiration:** 10 minutes
2. **Attempt Limit:** 3 attempts max
3. **Secure Generation:** Crypto-random 6-digit code
4. **Password Hashing:** bcrypt with salt rounds 12
5. **JWT Tokens:** 24-hour expiration
6. **Email Validation:** Format checking
7. **Role Verification:** Enforced at registration

## Development vs Production

### Development
- OTP logged to console
- Email failures don't block registration
- Detailed error messages

### Production
- OTP only sent via email
- Email failures logged but silent to user
- Generic error messages
- Use environment variables for all secrets

## Success Criteria

✅ Student registration requires OTP
✅ Teacher registration requires OTP
✅ Admin registration skips OTP
✅ OTP sent via SendGrid
✅ OTP logged to console (dev)
✅ OTP expires after 10 minutes
✅ Maximum 3 verification attempts
✅ Resend OTP functionality works
✅ Welcome email sent after verification
✅ JWT token generated on success
✅ User redirected to dashboard
✅ Beautiful email templates
✅ Professional UI/UX
✅ Error handling robust
✅ TypeScript errors resolved

## Next Steps

1. Test with real email addresses
2. Verify SendGrid sender authentication
3. Monitor email delivery rates
4. Add email analytics
5. Consider SMS backup (Twilio)
6. Add rate limiting for OTP requests
7. Add CAPTCHA for registration
8. Add password strength meter
9. Add "Remember Me" functionality
10. Add social login (Google, GitHub)
