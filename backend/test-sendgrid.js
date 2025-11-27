// Test SendGrid Email Service
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

console.log('Testing SendGrid Configuration...\n');

// Check environment variables
console.log('1. Checking Environment Variables:');
console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✓ Set (length: ' + process.env.SENDGRID_API_KEY.length + ')' : '✗ Not set');
console.log('   EMAIL_FROM_ADDRESS:', process.env.EMAIL_FROM_ADDRESS || '✗ Not set');
console.log('   EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || '✗ Not set');
console.log('');

if (!process.env.SENDGRID_API_KEY) {
  console.error('✗ SENDGRID_API_KEY is not set in .env file');
  process.exit(1);
}

if (!process.env.EMAIL_FROM_ADDRESS) {
  console.error('✗ EMAIL_FROM_ADDRESS is not set in .env file');
  process.exit(1);
}

// Initialize SendGrid
console.log('2. Initializing SendGrid...');
try {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('   ✓ SendGrid initialized');
} catch (error) {
  console.error('   ✗ Failed to initialize SendGrid:', error.message);
  process.exit(1);
}
console.log('');

// Test email sending
console.log('3. Testing Email Send...');
const testEmail = {
  to: process.env.EMAIL_FROM_ADDRESS, // Send to yourself for testing
  from: {
    email: process.env.EMAIL_FROM_ADDRESS,
    name: process.env.EMAIL_FROM_NAME || 'Seminar Report System'
  },
  subject: 'SendGrid Test Email',
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: #3b82f6;">SendGrid Test Successful!</h1>
      <p>This is a test email from your Seminar Management System.</p>
      <p>If you received this email, SendGrid is configured correctly.</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
    </div>
  `
};

console.log('   Sending test email to:', testEmail.to);
console.log('   From:', testEmail.from.email);
console.log('');

sgMail.send(testEmail)
  .then((response) => {
    console.log('✓ Email sent successfully!');
    console.log('');
    console.log('Response Details:');
    console.log('   Status Code:', response[0].statusCode);
    console.log('   Message ID:', response[0].headers['x-message-id']);
    console.log('');
    console.log('✓ SendGrid is working correctly!');
    console.log('');
    console.log('Next Steps:');
    console.log('1. Check your email inbox:', testEmail.to);
    console.log('2. Check spam folder if not in inbox');
    console.log('3. If email received, SendGrid is ready for OTP emails');
  })
  .catch((error) => {
    console.error('✗ Email sending failed!');
    console.error('');
    console.error('Error Details:');
    console.error('   Message:', error.message);
    
    if (error.response && error.response.body) {
      console.error('   SendGrid Response:', JSON.stringify(error.response.body, null, 2));
      
      if (error.response.body.errors) {
        console.error('');
        console.error('Specific Errors:');
        error.response.body.errors.forEach((err, index) => {
          console.error(`   ${index + 1}. ${err.message}`);
          if (err.field) console.error(`      Field: ${err.field}`);
          if (err.help) console.error(`      Help: ${err.help}`);
        });
      }
    }
    
    console.error('');
    console.error('Common Issues:');
    console.error('1. Invalid API Key - Check your SendGrid dashboard');
    console.error('2. Sender not verified - Verify sender in SendGrid');
    console.error('3. API Key permissions - Ensure "Mail Send" permission is enabled');
    console.error('4. Account suspended - Check SendGrid account status');
    console.error('');
    console.error('Visit: https://app.sendgrid.com/settings/sender_auth');
    
    process.exit(1);
  });
