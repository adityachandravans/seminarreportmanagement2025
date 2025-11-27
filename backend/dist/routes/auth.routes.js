"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const email_service_1 = require("../services/email.service");
const router = express_1.default.Router();
// Helper function to generate 6-digit OTP
const generateOTP = () => {
    return crypto_1.default.randomInt(100000, 999999).toString();
};
// Register User
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('📥 Register request received at:', new Date().toISOString());
        console.log('📥 Request headers:', req.headers);
        console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
        const { email, password, name, role, rollNumber, department, year, specialization } = req.body;
        console.log('📥 Register request received:', { email, name, role, hasPassword: !!password });
        // Check MongoDB connection
        console.log('📊 MongoDB connection state:', mongoose_1.default.connection.readyState);
        if (mongoose_1.default.connection.readyState !== 1) {
            console.error('✗ MongoDB not connected. ReadyState:', mongoose_1.default.connection.readyState);
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
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        // Generate OTP for students and teachers (admin gets auto-verified)
        const requiresVerification = role === 'student' || role === 'teacher';
        let otp;
        let otpExpires;
        if (requiresVerification) {
            otp = generateOTP();
            otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        }
        // Create new user
        const user = new user_model_1.default({
            email,
            password: hashedPassword,
            name,
            role,
            rollNumber,
            department,
            year,
            specialization,
            isEmailVerified: !requiresVerification, // Admin auto-verified, others need OTP
            emailVerificationOTP: otp,
            emailVerificationOTPExpires: otpExpires,
            emailVerificationAttempts: 0
        });
        yield user.save();
        console.log('✓ User saved to MongoDB:', {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            requiresVerification,
            database: user.constructor.name
        });
        // For admin, create token and send welcome email
        if (!requiresVerification) {
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            try {
                yield email_service_1.emailService.sendWelcomeEmail(email, name, role);
                console.log('✓ Welcome email sent to:', email);
            }
            catch (emailError) {
                console.error('⚠️ Failed to send welcome email:', emailError);
            }
            console.log('✓ Admin registration successful (auto-verified)');
            return res.status(201).json({
                message: 'Registration successful',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                }
            });
        }
        // For students and teachers, send OTP email
        try {
            yield email_service_1.emailService.sendOTPEmail(email, name, otp);
            console.log('✓ OTP email sent to:', email);
        }
        catch (emailError) {
            console.error('⚠️ Failed to send OTP email:', emailError);
            // Continue registration even if email fails - OTP is logged to console
        }
        // DEVELOPMENT: Log OTP to console for testing
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 EMAIL VERIFICATION OTP');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('User:', name);
        console.log('Email:', email);
        console.log('Role:', role);
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
    }
    catch (error) {
        console.error('✗ Registration error:', error.message);
        console.error('✗ Error stack:', error.stack);
        console.error('✗ Error details:', error);
        // Handle MongoDB duplicate key error
        if (error.code === 11000 || error.code === 11001) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: 'Validation error', errors: validationErrors });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Login User
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role } = req.body;
        // Input validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        // Check if user exists
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Validate password
        const isValidPassword = yield bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
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
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Verify OTP
router.post('/verify-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, otp } = req.body;
        // Input validation
        if (!userId || !otp) {
            return res.status(400).json({ message: 'User ID and OTP are required' });
        }
        // Find user
        const user = yield user_model_1.default.findById(userId);
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
        if ((user.emailVerificationAttempts || 0) >= 3) {
            return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please request a new OTP.' });
        }
        // Verify OTP
        if (user.emailVerificationOTP !== otp) {
            user.emailVerificationAttempts = (user.emailVerificationAttempts || 0) + 1;
            yield user.save();
            const remainingAttempts = 3 - (user.emailVerificationAttempts || 0);
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
        yield user.save();
        // Create token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        console.log('✅ Email verified successfully for:', user.email);
        // Send welcome email
        try {
            yield email_service_1.emailService.sendWelcomeEmail(user.email, user.name, user.role);
        }
        catch (emailError) {
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
    }
    catch (error) {
        console.error('OTP verification error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Resend OTP
router.post('/resend-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        // Input validation
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        // Find user
        const user = yield user_model_1.default.findById(userId);
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
        yield user.save();
        // Send OTP email
        try {
            yield email_service_1.emailService.sendOTPEmail(user.email, user.name, otp);
            console.log('✓ New OTP sent to:', user.email);
        }
        catch (emailError) {
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
    }
    catch (error) {
        console.error('Resend OTP error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Get current user
router.get('/me', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = yield user_model_1.default.findById(req.user._id).select('-password');
        res.json(user);
    }
    catch (error) {
        console.error('Get current user error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
exports.default = router;
