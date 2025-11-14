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
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || '5000', 10);
// Middleware
// Configure CORS to accept frontend dev server and backend origin(s).
// Allow multiple origins via comma-separated `CORS_ORIGIN` in .env (e.g. "http://localhost:3000,http://localhost:5000").
const rawOrigins = process.env.CORS_ORIGIN || '';
const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow non-browser tools (Postman, curl) where origin is undefined
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.length === 0)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// API Routes - MUST BE BEFORE STATIC FILES AND CATCH-ALL ROUTES
app.use('/api/auth', auth_routes_1.default);
app.use('/api/topics', topic_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/users', user_routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
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
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('Port:', port);
mongoose_1.default.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => {
    console.log('✓ Connected to MongoDB');
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
    process.exit(1);
});
