# Resend Email Setup Guide

## ✅ Code Updated - Now Get Your API Key

### Step 1: Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Click **Sign Up**
3. Use your email (or GitHub login)
4. Verify your email

### Step 2: Get API Key

1. After login, go to **API Keys** section
2. Click **Create API Key**
3. Give it a name: `Seminar Management Production`
4. Click **Create**
5. **Copy the API key** (starts with `re_`)
   - ⚠️ Save it now! You won't see it again

### Step 3: Update Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service
3. Go to **Environment** tab
4. **Remove these old variables:**
   - `EMAIL_SERVICE`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `EMAIL_REPLY_TO`

5. **Add new variable:**
   - Key: `RESEND_API_KEY`
   - Value: `re_your_api_key_here` (paste your key)

6. **Update existing:**
   - `EMAIL_FROM_ADDRESS`: `onboarding@resend.dev`
   - Keep `EMAIL_FROM_NAME`: `Seminar Report System`

7. Click **Save Changes**

Render will auto-redeploy (takes 2-3 minutes).

### Step 4: Test It!

1. Wait for Render to finish deploying
2. Register a new user on your site
3. **Check your email** - OTP should arrive in seconds!
4. Enter OTP and complete registration

## 📧 Email Limits

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for testing and small projects

**Paid Plans:**
- Start at $20/month for 50,000 emails
- Upgrade when needed

## 🎯 Why Resend?

✅ Works on Render (HTTP API, not SMTP)
✅ Fast delivery (< 5 seconds)
✅ Modern, developer-friendly
✅ Free tier is generous
✅ No complex SMTP setup

## 🔧 Troubleshooting

### Emails not sending?

1. Check Render logs for errors
2. Verify `RESEND_API_KEY` is set correctly
3. Make sure you verified your Resend email
4. Check Resend dashboard for delivery status

### Still using onboarding@resend.dev?

That's fine for testing! To use your own domain:

1. Go to Resend → **Domains**
2. Add your domain
3. Add DNS records
4. Update `EMAIL_FROM_ADDRESS` to `noreply@yourdomain.com`

## ✅ Done!

Once Render redeploys, your emails will work perfectly!

**Current Status:**
- ✅ Code updated to use Resend
- ✅ Package installed
- ⏳ Waiting for your API key
- ⏳ Waiting for Render environment update

**Next:** Get your Resend API key and update Render!
