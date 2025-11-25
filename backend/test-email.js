// Quick test script to verify SendGrid email configuration
require('dotenv').config();
const nodemailer = require('nodemailer').default || require('nodemailer');

console.log('🔍 Testing SendGrid Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('✓ EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('✓ SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set (hidden)' : '❌ NOT SET');
console.log('✓ EMAIL_FROM_ADDRESS:', process.env.EMAIL_FROM_ADDRESS);
console.log('✓ EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME);
console.log('');

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

// Verify connection
console.log('🔌 Verifying SMTP connection...');
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ SMTP Connection Failed:');
    console.log(error.message);
    console.log('\n⚠️  Common Issues:');
    console.log('1. Invalid SendGrid API Key');
    console.log('2. Sender email not verified in SendGrid dashboard');
    console.log('3. Network/firewall blocking SMTP port 587');
    console.log('\n📝 Next Steps:');
    console.log('1. Verify your sender email at: https://app.sendgrid.com/');
    console.log('2. Go to Settings → Sender Authentication → Verify a Single Sender');
    console.log('3. Update EMAIL_FROM_ADDRESS in .env with verified email');
  } else {
    console.log('✅ SMTP Connection Successful!');
    console.log('✅ SendGrid is ready to send emails');
    console.log('\n📧 You can now:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Test registration with email verification');
    console.log('3. Check your inbox for OTP emails');
    console.log('\n⚠️  IMPORTANT: Verify your sender email in SendGrid dashboard');
    console.log('   Visit: https://app.sendgrid.com/settings/sender_auth');
  }
  process.exit(error ? 1 : 0);
});
