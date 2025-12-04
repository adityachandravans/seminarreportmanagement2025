import * as nodemailer from 'nodemailer';

/**
 * Email Service
 * Handles all email sending functionality with Gmail SMTP
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private isEnabled: boolean = false;
  private isInitialized: boolean = false;
  private fromEmail: string = '';
  private fromName: string = '';
  private transporter: any = null;

  private initialize() {
    if (this.isInitialized) return;
    
    try {
      this.fromEmail = process.env.EMAIL_FROM_ADDRESS || 'noreply@seminarreport.com';
      this.fromName = process.env.EMAIL_FROM_NAME || 'Seminar Report System';

      // Check if Gmail is configured
      if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        console.log('✅ Gmail email service initialized');
        console.log('   From:', this.fromEmail);
        console.log('   User:', process.env.EMAIL_USER);
        this.isEnabled = true;
        this.isInitialized = true;
      } else {
        throw new Error('Gmail not configured (EMAIL_SERVICE, EMAIL_USER, or EMAIL_PASSWORD missing)');
      }
    } catch (error: any) {
      console.error('❌ Email service initialization failed:', error.message);
      console.warn('⚠️  Email notifications will be disabled - OTP will be logged to console');
      this.isEnabled = false;
      this.isInitialized = true;
    }
  }

  /**
   * Send email with error handling
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    // Initialize on first use
    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.isEnabled) {
      console.warn('⚠️  Email service is disabled - using console OTP instead');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully to:', options.to);
      console.log('   Message ID:', info.messageId);
      return true;
    } catch (error: any) {
      console.error('❌ Email sending failed:', error.message);
      
      // Provide specific guidance for common errors
      if (error.message.includes('Invalid login')) {
        console.error('');
        console.error('   📧 Gmail Authentication Failed:');
        console.error('   - Check EMAIL_USER is correct');
        console.error('   - Check EMAIL_PASSWORD is your app password (not regular password)');
        console.error('   - Make sure 2-Step Verification is enabled');
        console.error('   - Generate new app password if needed');
        console.error('   - For now: OTP will be logged to console');
        console.error('');
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
        console.error('');
        console.error('   📧 Connection Failed:');
        console.error('   - Check internet connection');
        console.error('   - Check firewall settings');
        console.error('   - Gmail SMTP might be blocked');
        console.error('   - For now: OTP will be logged to console');
        console.error('');
      }
      
      console.warn('⚠️  Email delivery failed - OTP is logged to console for testing');
      return false;
    }
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * Send welcome email on registration
   */
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
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
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
            <p>Your account has been successfully created as a <strong>${role}</strong>.</p>
            <p>You can now log in and start using the system:</p>
            <ul>
              ${role === 'student' ? '<li>Upload seminar reports</li><li>Track submission status</li><li>View feedback from faculty</li>' : ''}
              ${role === 'teacher' ? '<li>Review student submissions</li><li>Provide feedback</li><li>Approve/reject reports</li>' : ''}
              ${role === 'admin' ? '<li>Manage users</li><li>View analytics</li><li>System administration</li>' : ''}
            </ul>
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Go to Dashboard</a>
            </center>
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Seminar Report System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: 'Welcome to Seminar Report System',
      html,
    });
  }

  /**
   * Send report submission confirmation
   */
  async sendReportSubmissionEmail(to: string, studentName: string, reportTitle: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Report Submitted Successfully!</h1>
          </div>
          <div class="content">
            <h2>Hello ${studentName}!</h2>
            <p>Your seminar report has been successfully submitted and is now under review.</p>
            <div class="info-box">
              <strong>Report Title:</strong> ${reportTitle}<br>
              <strong>Submitted:</strong> ${new Date().toLocaleString()}<br>
              <strong>Status:</strong> Pending Review
            </div>
            <p>You will receive an email notification once your report has been reviewed by the faculty.</p>
            <p>You can track the status of your submission in your dashboard.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Seminar Report System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `Report Submitted: ${reportTitle}`,
      html,
    });
  }

  /**
   * Send report approval notification
   */
  async sendReportApprovalEmail(
    to: string,
    studentName: string,
    reportTitle: string,
    feedback?: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d1fae5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .feedback-box { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Report Approved!</h1>
          </div>
          <div class="content">
            <h2>Congratulations ${studentName}!</h2>
            <div class="success-box">
              <h3 style="color: #059669; margin: 0;">Your report has been approved!</h3>
            </div>
            <p><strong>Report Title:</strong> ${reportTitle}</p>
            ${feedback ? `
              <div class="feedback-box">
                <strong>Faculty Feedback:</strong><br>
                ${feedback}
              </div>
            ` : ''}
            <p>You can download your approved report from your dashboard.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Seminar Report System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `✅ Report Approved: ${reportTitle}`,
      html,
    });
  }

  /**
   * Send report rejection notification
   */
  async sendReportRejectionEmail(
    to: string,
    studentName: string,
    reportTitle: string,
    feedback: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning-box { background: #fee2e2; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .feedback-box { background: white; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Report Requires Revision</h1>
          </div>
          <div class="content">
            <h2>Hello ${studentName},</h2>
            <div class="warning-box">
              <p style="margin: 0;"><strong>Report Title:</strong> ${reportTitle}</p>
              <p style="margin: 10px 0 0 0;"><strong>Status:</strong> Requires Revision</p>
            </div>
            <p>Your report has been reviewed and requires some revisions before approval.</p>
            <div class="feedback-box">
              <strong>Faculty Feedback:</strong><br>
              ${feedback}
            </div>
            <p>Please make the necessary changes and resubmit your report.</p>
            <p>If you have any questions about the feedback, please contact your faculty advisor.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Seminar Report System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `⚠️ Report Requires Revision: ${reportTitle}`,
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              • This link will expire in 1 hour<br>
              • If you didn't request this, please ignore this email<br>
              • Never share this link with anyone
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Seminar Report System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: 'Password Reset Request',
      html,
    });
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(to: string, name: string, verificationToken: string): Promise<boolean> {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering! Please verify your email address to activate your account.</p>
            <center>
              <a href="${verifyUrl}" class="button">Verify Email</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Seminar Report System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: 'Verify Your Email Address',
      html,
    });
  }

  /**
   * Send OTP for email verification
   */
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
            <p>Thank you for registering with Seminar Report System! Please use the following verification code to complete your registration:</p>
            
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your Verification Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
            </div>

            <div class="warning">
              <strong>🔒 Security Tips:</strong><br>
              • This code will expire in 10 minutes<br>
              • Never share this code with anyone<br>
              • If you didn't request this code, please ignore this email<br>
              • You have 3 attempts to enter the correct code
            </div>

            <p>Enter this code on the verification page to activate your account and start using the system.</p>
            
            <p style="color: #666; font-size: 14px;">If you're having trouble, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Seminar Report System. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: '🔐 Your Email Verification Code',
      html,
    });
  }

  /**
   * Send password reset OTP
   */
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
          .warning { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password. Please use the following verification code to reset your password:</p>
            
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your Password Reset Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
            </div>

            <div class="warning">
              <strong>🔒 Security Tips:</strong><br>
              • This code will expire in 10 minutes<br>
              • Never share this code with anyone<br>
              • If you didn't request this, please ignore this email<br>
              • You have 3 attempts to enter the correct code
            </div>

            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <p style="color: #666; font-size: 14px;">If you're having trouble, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Seminar Report System. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: '🔐 Password Reset Code',
      html,
    });
  }

  /**
   * Send password reset confirmation
   */
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
          .success-box { background: #d1fae5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
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
            <div class="success-box">
              <h3 style="color: #059669; margin: 0;">Your password has been reset successfully!</h3>
            </div>
            <p>Your password was changed on ${new Date().toLocaleString()}.</p>
            <p>You can now login with your new password.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              If you didn't make this change, please contact our support team immediately.
            </div>

            <p>For security reasons, we recommend:</p>
            <ul>
              <li>Use a strong, unique password</li>
              <li>Don't share your password with anyone</li>
              <li>Enable two-factor authentication if available</li>
              <li>Change your password regularly</li>
            </ul>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Seminar Report System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: '✅ Password Reset Successful',
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
