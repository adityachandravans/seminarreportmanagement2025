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
const user_model_1 = __importDefault(require("../models/user.model"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
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
        // Create new user
        const user = new user_model_1.default({
            email,
            password: hashedPassword,
            name,
            role,
            rollNumber,
            department,
            year,
            specialization
        });
        yield user.save();
        console.log('✓ User saved to MongoDB:', {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            database: user.constructor.name
        });
        // Create token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        console.log('✓ Registration successful, returning response');
        res.status(201).json({
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
        const { email, password } = req.body;
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
        // Create token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
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
