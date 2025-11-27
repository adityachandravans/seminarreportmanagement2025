import * as nodemailer from 'nodemailer';

/**
 * Email Configuration
 * Supports Gmail, SendGrid, and custom SMTP
 */

// Create reusable transporter
export const createEmailTransporter = () => {
  // For production, use SendGrid or AWS SES
  // For development, use Gmail or Mailtrap
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });
  }
  
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }
  
  // Default SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Email configuration
export const emailConfig = {
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Seminar Report System',
    address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || 'noreply@seminar.com',
  },
  replyTo: process.env.EMAIL_REPLY_TO,
};

// Verify email configuration on startup
export const verifyEmailConfig = async () => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error: any) {
    console.error('❌ Email service error:', error.message);
    console.warn('⚠️  Email notifications will be disabled');
    return false;
  }
};
