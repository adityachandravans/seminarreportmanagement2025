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
const pendingRegistrations = new Map();
const passwordResetRequests = new Map();
// Clean up expired pending registrations and password resets every 15 minutes
setInterval(() => {
    const now = new Date();
    // Clean up pending registrations
    for (const [userId, data] of pendingRegistrations.entries()) {
        if (data.otpExpires < now) {
            pendingRegistrations.delete(userId);
            console.log('🗑️ Cleaned up expired pending registration:', data.email);
        }
    }
    // Clean up password reset requests
    for (const [resetId, data] of passwordResetRequests.entries()) {
        if (data.otpExpires < now) {
            passwordResetRequests.delete(resetId);
            console.log('🗑️ Cleaned up expired password reset:', data.email);
        }
    }
}, 15 * 60 * 1000);
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
        // Check if user already exists in database
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }
        // Check if user has pending registration
        const existingPending = Array.from(pendingRegistrations.values()).find(p => p.email === email);
        if (existingPending) {
            console.log('User has pending registration:', email);
            return res.status(400).json({ message: 'Registration pending. Please verify your email or request a new OTP.' });
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        // Generate OTP and temporary user ID
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const tempUserId = crypto_1.default.randomBytes(16).toString('hex');
        // Store registration data temporarily (NOT in database yet)
        pendingRegistrations.set(tempUserId, {
            email,
            password: hashedPassword,
            name,
            role,
            rollNumber,
            department,
            year,
            specialization,
            otp,
            otpExpires,
            attempts: 0,
            createdAt: new Date()
        });
        console.log('✓ Registration data stored temporarily (not in database yet)');
        console.log('  Email:', email);
        console.log('  Role:', role);
        console.log('  Temp ID:', tempUserId);
        // Send OTP email
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
        console.log('⚠️  USER NOT SAVED TO DATABASE YET');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✓ Registration initiated, OTP sent. User will be saved after verification.');
        res.status(201).json({
            message: 'Registration initiated. Please verify your email with the OTP sent to your email address.',
            userId: tempUserId,
            email: email,
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
        // Check if this is a pending registration
        const pendingData = pendingRegistrations.get(userId);
        if (pendingData) {
            // This is a new registration - verify OTP and create user
            // Check if OTP has expired
            if (pendingData.otpExpires < new Date()) {
                pendingRegistrations.delete(userId);
                return res.status(400).json({ message: 'OTP has expired. Please register again.' });
            }
            // Check attempts
            if (pendingData.attempts >= 3) {
                pendingRegistrations.delete(userId);
                return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please register again.' });
            }
            // Verify OTP
            if (pendingData.otp !== otp) {
                pendingData.attempts += 1;
                const remainingAttempts = 3 - pendingData.attempts;
                return res.status(400).json({
                    message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
                    remainingAttempts
                });
            }
            // OTP is valid - NOW save user to database
            const user = new user_model_1.default({
                email: pendingData.email,
                password: pendingData.password,
                name: pendingData.name,
                role: pendingData.role,
                rollNumber: pendingData.rollNumber,
                department: pendingData.department,
                year: pendingData.year,
                specialization: pendingData.specialization,
                isEmailVerified: true, // Already verified
                emailVerificationOTP: undefined,
                emailVerificationOTPExpires: undefined,
                emailVerificationAttempts: 0
            });
            yield user.save();
            // Remove from pending registrations
            pendingRegistrations.delete(userId);
            console.log('✅ Email verified and user saved to database:', {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            });
            // Create token
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            // Send welcome email
            try {
                yield email_service_1.emailService.sendWelcomeEmail(user.email, user.name, user.role);
            }
            catch (emailError) {
                console.error('⚠️ Failed to send welcome email:', emailError);
            }
            return res.json({
                message: 'Email verified successfully. Your account has been created.',
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
        // If not in pending, check if it's an existing user (shouldn't happen with new flow)
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found or registration expired. Please register again.' });
        }
        // Check if already verified
        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }
        // This shouldn't happen with new flow, but handle it anyway
        return res.status(400).json({ message: 'Invalid verification request. Please register again.' });
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
        // Check if this is a pending registration
        const pendingData = pendingRegistrations.get(userId);
        if (pendingData) {
            // Generate new OTP
            const otp = generateOTP();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            // Update pending registration
            pendingData.otp = otp;
            pendingData.otpExpires = otpExpires;
            pendingData.attempts = 0; // Reset attempts
            // Send OTP email
            try {
                yield email_service_1.emailService.sendOTPEmail(pendingData.email, pendingData.name, otp);
                console.log('✓ New OTP sent to:', pendingData.email);
            }
            catch (emailError) {
                console.error('⚠️ Failed to send OTP email:', emailError);
                // Continue even if email fails - OTP is logged to console
            }
            // DEVELOPMENT: Log OTP to console for testing
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 RESEND OTP');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('User:', pendingData.name);
            console.log('Email:', pendingData.email);
            console.log('OTP Code:', otp);
            console.log('Expires:', otpExpires.toLocaleString());
            console.log('⚠️  USER NOT SAVED TO DATABASE YET');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return res.json({
                message: 'New OTP sent to your email address',
                expiresIn: '10 minutes'
            });
        }
        // If not in pending, registration might have expired
        return res.status(404).json({ message: 'Registration not found or expired. Please register again.' });
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
// Forgot Password - Request OTP
router.post('/forgot-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Input validation
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        // Check if user exists
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({
                message: 'If an account exists with this email, you will receive a password reset OTP.',
                success: true
            });
        }
        // Generate OTP and reset ID
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const resetId = crypto_1.default.randomBytes(16).toString('hex');
        // Store password reset request
        passwordResetRequests.set(resetId, {
            email: user.email,
            userId: user._id.toString(),
            otp,
            otpExpires,
            attempts: 0,
            createdAt: new Date()
        });
        // Send OTP email
        try {
            yield email_service_1.emailService.sendPasswordResetOTP(user.email, user.name, otp);
            console.log('✓ Password reset OTP sent to:', user.email);
        }
        catch (emailError) {
            console.error('⚠️ Failed to send password reset OTP:', emailError);
        }
        // DEVELOPMENT: Log OTP to console
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔐 PASSWORD RESET OTP');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('User:', user.name);
        console.log('Email:', user.email);
        console.log('OTP Code:', otp);
        console.log('Expires:', otpExpires.toLocaleString());
        console.log('Reset ID:', resetId);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        res.json({
            message: 'Password reset OTP sent to your email address',
            resetId,
            success: true
        });
    }
    catch (error) {
        console.error('Forgot password error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Verify Password Reset OTP
router.post('/verify-reset-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { resetId, otp } = req.body;
        // Input validation
        if (!resetId || !otp) {
            return res.status(400).json({ message: 'Reset ID and OTP are required' });
        }
        // Find reset request
        const resetData = passwordResetRequests.get(resetId);
        if (!resetData) {
            return res.status(404).json({ message: 'Password reset request not found or expired' });
        }
        // Check if OTP has expired
        if (resetData.otpExpires < new Date()) {
            passwordResetRequests.delete(resetId);
            return res.status(400).json({ message: 'OTP has expired. Please request a new password reset.' });
        }
        // Check attempts
        if (resetData.attempts >= 3) {
            passwordResetRequests.delete(resetId);
            return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please request a new password reset.' });
        }
        // Verify OTP
        if (resetData.otp !== otp) {
            resetData.attempts += 1;
            const remainingAttempts = 3 - resetData.attempts;
            return res.status(400).json({
                message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
                remainingAttempts
            });
        }
        console.log('✅ Password reset OTP verified for:', resetData.email);
        res.json({
            message: 'OTP verified successfully. You can now reset your password.',
            verified: true
        });
    }
    catch (error) {
        console.error('Verify reset OTP error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Reset Password
router.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { resetId, otp, newPassword } = req.body;
        // Input validation
        if (!resetId || !otp || !newPassword) {
            return res.status(400).json({ message: 'Reset ID, OTP, and new password are required' });
        }
        // Password validation
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        // Find reset request
        const resetData = passwordResetRequests.get(resetId);
        if (!resetData) {
            return res.status(404).json({ message: 'Password reset request not found or expired' });
        }
        // Verify OTP again
        if (resetData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        // Check if OTP has expired
        if (resetData.otpExpires < new Date()) {
            passwordResetRequests.delete(resetId);
            return res.status(400).json({ message: 'OTP has expired. Please request a new password reset.' });
        }
        // Find user
        const user = yield user_model_1.default.findById(resetData.userId);
        if (!user) {
            passwordResetRequests.delete(resetId);
            return res.status(404).json({ message: 'User not found' });
        }
        // Hash new password
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 12);
        // Update password
        user.password = hashedPassword;
        yield user.save();
        // Delete reset request
        passwordResetRequests.delete(resetId);
        console.log('✅ Password reset successfully for:', user.email);
        // Send confirmation email
        try {
            yield email_service_1.emailService.sendPasswordResetConfirmation(user.email, user.name);
        }
        catch (emailError) {
            console.error('⚠️ Failed to send password reset confirmation:', emailError);
        }
        res.json({
            message: 'Password reset successfully. You can now login with your new password.',
            success: true
        });
    }
    catch (error) {
        console.error('Reset password error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Resend Password Reset OTP
router.post('/resend-reset-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { resetId } = req.body;
        // Input validation
        if (!resetId) {
            return res.status(400).json({ message: 'Reset ID is required' });
        }
        // Find reset request
        const resetData = passwordResetRequests.get(resetId);
        if (!resetData) {
            return res.status(404).json({ message: 'Password reset request not found or expired' });
        }
        // Find user
        const user = yield user_model_1.default.findById(resetData.userId);
        if (!user) {
            passwordResetRequests.delete(resetId);
            return res.status(404).json({ message: 'User not found' });
        }
        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Update reset request
        resetData.otp = otp;
        resetData.otpExpires = otpExpires;
        resetData.attempts = 0; // Reset attempts
        // Send OTP email
        try {
            yield email_service_1.emailService.sendPasswordResetOTP(user.email, user.name, otp);
            console.log('✓ New password reset OTP sent to:', user.email);
        }
        catch (emailError) {
            console.error('⚠️ Failed to send password reset OTP:', emailError);
        }
        // DEVELOPMENT: Log OTP to console
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔐 RESEND PASSWORD RESET OTP');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('User:', user.name);
        console.log('Email:', user.email);
        console.log('OTP Code:', otp);
        console.log('Expires:', otpExpires.toLocaleString());
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        res.json({
            message: 'New password reset OTP sent to your email address',
            expiresIn: '10 minutes'
        });
    }
    catch (error) {
        console.error('Resend reset OTP error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
exports.default = router;
