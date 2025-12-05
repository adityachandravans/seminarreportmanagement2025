import { Resend } from 'resend';

/**
 * Email Service using Resend
 * Modern, reliable email delivery
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private resend: Resend | null = null;
  private isEnabled: boolean = false;
  private fromEmail: string = '';
  private fromName: string = '';

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      this.fromEmail = process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev';
      this.fromName = process.env.EMAIL_FROM_NAME || 'Seminar Report System';

      if (apiKey) {
        this.resend = new Resend(apiKey);
        this.isEnabled = true;
        console.log('✅ Resend email service initialized');
        console.log('   From:', this.fromEmail);
      } else {
        throw new Error('RESEND_API_KEY not configured');
      }
    } catch (error: any) {
      console.error('❌ Email service initialization failed:', error.message);
      console.warn('⚠️  Email notifications disabled - OTP will be logged to console');
      this.isEnabled = false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isEnabled || !this.resend) {
      console.warn('⚠️  Email service disabled - using console OTP');
      return false;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        throw error;
      }

      console.log('✅ Email sent successfully to:', options.to);
      console.log('   Message ID:', data?.id);
      return true;
    } catch (error: any) {
      console.error('❌ Email sending failed:', error.message);
      console.warn('⚠️  Email delivery failed - OTP logged to console');
      return false;
    }
  }

  async sendOTPEmail(to: string, name: string, otp: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; padding: 30px; text-align: center; border-radius: 10px; margin: 30px 0; border: 2px dashed #3b82f6; }
          .otp-code { font-size: 36px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .warning { background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Email Verification Code</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering! Use this code to verify your email:</p>
            
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your Verification Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
            </div>

            <div class="warning">
              <strong>🔒 Security Tips:</strong><br>
              • This code expires in 10 minutes<br>
              • Never share this code<br>
              • You have 3 attempts
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Seminar Report System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject: '🔐 Your Verification Code', html });
  }

  async sendWelcomeEmail(to: string, name: string, role: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Seminar Report System!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Your account as <strong>${role}</strong> has been created successfully.</p>
            <p>You can now log in and start using the system.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Seminar Report System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject: 'Welcome to Seminar Report System', html });
  }

  async sendPasswordResetOTP(to: string, name: string, otp: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; padding: 30px; text-align: center; border-radius: 10px; margin: 30px 0; border: 2px dashed #f59e0b; }
          .otp-code { font-size: 36px; font-weight: bold; color: #f59e0b; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Use this code to reset your password:</p>
            
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Reset Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Seminar Report System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject: '🔐 Password Reset Code', html });
  }

  async sendPasswordResetConfirmation(to: string, name: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Reset Successful</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Your password has been reset successfully!</p>
            <p>You can now login with your new password.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Seminar Report System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject: '✅ Password Reset Successful', html });
  }
}

export const emailService = new EmailService();
