// Direct SendGrid API test
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

console.log('🔍 Testing SendGrid Direct API...\n');

// Check API key
const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.EMAIL_FROM_ADDRESS;

console.log('Configuration:');
console.log('✓ API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : '❌ NOT SET');
console.log('✓ From Email:', fromEmail);
console.log('');

if (!apiKey) {
  console.error('❌ SENDGRID_API_KEY is not set!');
  process.exit(1);
}

// Set API key
sgMail.setApiKey(apiKey);

// Test email
const msg = {
  to: fromEmail, // Send to yourself for testing
  from: {
    email: fromEmail,
    name: 'Seminar Report System',
  },
  subject: '🧪 SendGrid Test Email',
  text: 'This is a test email from SendGrid API',
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>🧪 SendGrid Test Email</h2>
      <p>This is a test email to verify SendGrid is working correctly.</p>
      <p><strong>Test OTP:</strong> 123456</p>
      <p>If you received this email, SendGrid is configured correctly!</p>
    </div>
  `,
};

console.log('📤 Sending test email...');
console.log('   To:', msg.to);
console.log('   From:', msg.from.email);
console.log('');

sgMail
  .send(msg)
  .then((response) => {
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('   Status Code:', response[0].statusCode);
    console.log('   Message ID:', response[0].headers['x-message-id']);
    console.log('');
    console.log('📧 Check your inbox:', fromEmail);
    console.log('   Subject: 🧪 SendGrid Test Email');
    console.log('');
    console.log('✅ SendGrid is working correctly!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ EMAIL SENDING FAILED!');
    console.error('');
    console.error('Error Message:', error.message);
    
    if (error.response) {
      console.error('');
      console.error('SendGrid Response:');
      console.error('  Status Code:', error.response.statusCode);
      console.error('  Body:', JSON.stringify(error.response.body, null, 2));
      
      // Specific error handling
      if (error.response.body.errors) {
        console.error('');
        console.error('Errors:');
        error.response.body.errors.forEach((err, index) => {
          console.error(`  ${index + 1}. ${err.message}`);
          if (err.field) console.error(`     Field: ${err.field}`);
          if (err.help) console.error(`     Help: ${err.help}`);
        });
      }
    }
    
    console.error('');
    console.error('🔧 TROUBLESHOOTING:');
    console.error('1. Check if sender email is verified in SendGrid');
    console.error('   https://app.sendgrid.com/settings/sender_auth');
    console.error('2. Check API key permissions');
    console.error('   https://app.sendgrid.com/settings/api_keys');
    console.error('3. Check SendGrid account status');
    console.error('   https://app.sendgrid.com/');
    
    process.exit(1);
  });
