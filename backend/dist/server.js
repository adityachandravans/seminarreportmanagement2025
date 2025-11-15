"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const topic_routes_1 = __importDefault(require("./routes/topic.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
// Load .env file from the backend directory
// Use process.cwd() to find backend/.env from current working directory
const envPath = path_1.default.resolve(process.cwd(), 'backend', '.env');
dotenv_1.default.config({ path: envPath });
// Fallback if env file not found
if (!process.env.MONGODB_URI) {
    console.warn('Warning: MONGODB_URI not set. Trying root-level .env');
    dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
}
// Validate required environment variables
if (!process.env.MONGODB_URI) {
    console.error('✗ Error: MONGODB_URI is required. Please set it in your .env file');
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.error('✗ Error: JWT_SECRET is required. Please set it in your .env file');
    process.exit(1);
}
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || '5000', 10);
// Middleware
// Configure CORS to accept frontend dev server and backend origin(s).
// Allow multiple origins via comma-separated `CORS_ORIGIN` in .env (e.g. "http://localhost:3000,http://localhost:5000").
// Default to common development ports if not specified
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173,http://localhost:5000';
const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);
console.log('✓ CORS allowed origins:', allowedOrigins);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow non-browser tools (Postman, curl) where origin is undefined
        if (!origin)
            return callback(null, true);
        // Allow all origins in development if CORS_ORIGIN is empty or contains *
        if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Log CORS rejection for debugging
        console.warn('⚠ CORS blocked origin:', origin);
        return callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging middleware
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    }
    next();
});
// API Routes - MUST BE BEFORE STATIC FILES AND CATCH-ALL ROUTES
app.use('/api/auth', auth_routes_1.default);
app.use('/api/topics', topic_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/users', user_routes_1.default);
// Log all registered routes
console.log('✅ Registered API routes:');
console.log('   POST   /api/auth/register');
console.log('   POST   /api/auth/login');
console.log('   GET    /api/auth/me');
console.log('   GET    /api/topics');
console.log('   POST   /api/topics');
console.log('   GET    /api/reports');
console.log('   POST   /api/reports');
// Health check endpoint
app.get('/health', (req, res) => {
    var _a;
    const mongoState = mongoose_1.default.connection.readyState;
    const mongoStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    res.json({
        status: 'ok',
        message: 'Server is running',
        mongodb: {
            state: mongoState,
            status: mongoStates[mongoState] || 'unknown',
            connected: mongoState === 1,
            database: ((_a = mongoose_1.default.connection.db) === null || _a === void 0 ? void 0 : _a.databaseName) || 'unknown'
        },
        port: port
    });
});
// Test endpoint to verify API is working
app.get('/api/test', (req, res) => {
    var _a;
    res.json({
        message: 'API is working',
        timestamp: new Date().toISOString(),
        mongodb: {
            connected: mongoose_1.default.connection.readyState === 1,
            database: ((_a = mongoose_1.default.connection.db) === null || _a === void 0 ? void 0 : _a.databaseName) || 'unknown'
        }
    });
});
// Serve frontend static files if available (check multiple candidate build locations)
const possibleFrontends = [
    path_1.default.join(process.cwd(), 'build'), // project-root/build
    path_1.default.join(process.cwd(), 'backend', 'build'), // backend/build
    path_1.default.join(process.cwd(), 'frontend', 'build'), // frontend/build
];
const frontendDist = possibleFrontends.find(p => fs_1.default.existsSync(p));
console.log('Checking for frontend build at:', possibleFrontends[0], possibleFrontends[1], possibleFrontends[2]);
if (frontendDist) {
    console.log('✓ Serving frontend from:', frontendDist);
    app.use(express_1.default.static(frontendDist));
    // Fallback to index.html for SPA routes - MUST BE LAST
    app.get('*', (req, res, next) => {
        // Don't serve HTML for API routes that weren't matched
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ message: 'API route not found' });
        }
        const indexPath = path_1.default.join(frontendDist, 'index.html');
        if (fs_1.default.existsSync(indexPath)) {
            res.sendFile(indexPath);
        }
        else {
            next();
        }
    });
}
else {
    console.warn('⚠ No frontend build found');
    app.get('/', (req, res) => {
        res.json({ message: 'Backend API running', api: '/api/*', health: '/health' });
    });
}
// Connect to MongoDB and start server
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'SET (first 20 chars: ' + process.env.MONGODB_URI.substring(0, 20) + '...)' : 'NOT SET');
try {
    if (process.env.MONGODB_URI) {
        const mongoUrl = new URL(process.env.MONGODB_URI);
        const dbName = mongoUrl.pathname.slice(1) || 'default';
        console.log('Database Name:', dbName);
        console.log('MongoDB Host:', mongoUrl.hostname);
        console.log('MongoDB Port:', mongoUrl.port || '27017 (default)');
    }
}
catch (error) {
    console.log('Note: Could not parse MongoDB URI (might be connection string format)');
}
console.log('Port:', port);
mongoose_1.default.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
})
    .then(() => {
    var _a;
    const dbName = ((_a = mongoose_1.default.connection.db) === null || _a === void 0 ? void 0 : _a.databaseName) || 'unknown';
    console.log('✓ Connected to MongoDB');
    console.log('✓ Database Name:', dbName);
    console.log('✓ MongoDB Connection State:', mongoose_1.default.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    console.log('Starting Express server listener...');
    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`✓ Server is running on port ${port}`);
        console.log(`Health check: http://localhost:${port}/health`);
        console.log(`API: http://localhost:${port}/api/auth/register`);
    });
    server.on('listening', () => {
        console.log(`✓ Server listening on 0.0.0.0:${port}`);
    });
    server.on('error', (err) => {
        console.error('✗ Server error:', err.message);
        process.exit(1);
    });
    process.on('uncaughtException', (err) => {
        console.error('✗ Uncaught Exception:', err);
        process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
        console.error('✗ Unhandled Rejection:', reason);
        process.exit(1);
    });
})
    .catch((error) => {
    console.error('✗ MongoDB connection error:', error.message);
    console.error('✗ Error details:', error);
    console.error('✗ Please check:');
    console.error('  1. MongoDB is running');
    console.error('  2. MONGODB_URI in .env file is correct');
    console.error('  3. Network connectivity to MongoDB server');
    console.error('  4. MongoDB server is accessible from this machine');
    process.exit(1);
});
