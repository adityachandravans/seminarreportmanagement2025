import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import User from '../models/user.model';
import { auth } from '../middleware/auth.middleware';
import { emailService } from '../services/email.service';

const router = express.Router();

// Helper function to generate 6-digit OTP
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Register User
router.post('/register', async (req, res) => {
  try {
    console.log('📥 Register request received at:', new Date().toISOString());
    console.log('📥 Request headers:', req.headers);
    console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
    
    const { email, password, name, role, rollNumber, department, year, specialization } = req.body;
    console.log('📥 Register request received:', { email, name, role, hasPassword: !!password });
    
    // Check MongoDB connection
    console.log('📊 MongoDB connection state:', mongoose.connection.readyState);
    if (mongoose.connection.readyState !== 1) {
      console.error('✗ MongoDB not connected. ReadyState:', mongoose.connection.readyState);
      console.error('  ReadyState codes: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
      return res.status(503).json({ message: 'Database connection unavailable' });
    }
    console.log('✅ MongoDB is connected');

    // Input validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'Missing required fields: email, password, name, role' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Role validation
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be student, teacher, or admin' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user (not verified yet)
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      rollNumber,
      department,
      year,
      specialization,
      isEmailVerified: false,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: otpExpires,
      emailVerificationAttempts: 0
    });

    await user.save();
    console.log('✓ User saved to MongoDB:', {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      database: user.constructor.name
    });

    // Send OTP email
    try {
      await emailService.sendOTPEmail(email, name, otp);
      console.log('✓ OTP email sent to:', email);
    } catch (emailError) {
      console.error('⚠️ Failed to send OTP email:', emailError);
      // Continue registration even if email fails
    }

    // DEVELOPMENT: Log OTP to console for testing
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 EMAIL VERIFICATION OTP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('User:', name);
    console.log('Email:', email);
    console.log('OTP Code:', otp);
    console.log('Expires:', otpExpires.toLocaleString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('✓ Registration successful, OTP sent');

    res.status(201).json({
      message: 'Registration successful. Please verify your email with the OTP sent to your email address.',
      userId: user._id,
      email: user.email,
      requiresVerification: true
    });
  } catch (error: any) {
    console.error('✗ Registration error:', error.message);
    console.error('✗ Error stack:', error.stack);
    console.error('✗ Error details:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000 || error.code === 11001) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: 'Validation error', errors: validationErrors });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.log(`⚠️ Unverified email login attempt: ${email}`);
      return res.status(403).json({ 
        message: 'Please verify your email before logging in.',
        requiresVerification: true,
        userId: user._id,
        email: user.email
      });
    }

    // Role-based access control: Verify the user's role matches the requested role
    if (role && user.role !== role) {
      console.log(`⚠️ Role mismatch: User ${email} has role '${user.role}' but tried to login as '${role}'`);
      return res.status(403).json({ 
        message: `Access denied. This email is registered as ${user.role}, not ${role}.`,
        registeredRole: user.role
      });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    console.log(`✅ Login successful for ${user.role}: ${email}`);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Input validation
    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check if OTP has expired
    if (!user.emailVerificationOTPExpires || user.emailVerificationOTPExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check attempts
    if (user.emailVerificationAttempts >= 3) {
      return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    // Verify OTP
    if (user.emailVerificationOTP !== otp) {
      user.emailVerificationAttempts += 1;
      await user.save();
      
      const remainingAttempts = 3 - user.emailVerificationAttempts;
      return res.status(400).json({ 
        message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
        remainingAttempts
      });
    }

    // OTP is valid - verify user
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    user.emailVerificationAttempts = 0;
    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    console.log('✅ Email verified successfully for:', user.email);

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.name, user.role);
    } catch (emailError) {
      console.error('⚠️ Failed to send welcome email:', emailError);
    }

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error: any) {
    console.error('OTP verification error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;

    // Input validation
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = otpExpires;
    user.emailVerificationAttempts = 0; // Reset attempts
    await user.save();

    // Send OTP email
    try {
      await emailService.sendOTPEmail(user.email, user.name, otp);
      console.log('✓ New OTP sent to:', user.email);
    } catch (emailError) {
      console.error('⚠️ Failed to send OTP email:', emailError);
      // Continue even if email fails - OTP is logged to console
    }

    // DEVELOPMENT: Log OTP to console for testing
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 RESEND OTP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('User:', user.name);
    console.log('Email:', user.email);
    console.log('OTP Code:', otp);
    console.log('Expires:', otpExpires.toLocaleString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      message: 'New OTP sent to your email address',
      expiresIn: '10 minutes'
    });
  } catch (error: any) {
    console.error('Resend OTP error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error: any) {
    console.error('Get current user error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;