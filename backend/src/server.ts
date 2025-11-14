import express, { Express } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.routes';
import topicRoutes from './routes/topic.routes';
import reportRoutes from './routes/report.routes';
import userRoutes from './routes/user.routes';

// Load .env file from the backend directory
// Use process.cwd() to find backend/.env from current working directory
const envPath = path.resolve(process.cwd(), 'backend', '.env');
dotenv.config({ path: envPath });

// Fallback if env file not found
if (!process.env.MONGODB_URI) {
  console.warn('Warning: MONGODB_URI not set. Trying root-level .env');
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const app: Express = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Middleware
// Configure CORS to accept frontend dev server and backend origin(s).
// Allow multiple origins via comma-separated `CORS_ORIGIN` in .env (e.g. "http://localhost:3000,http://localhost:5000").
const rawOrigins = process.env.CORS_ORIGIN || '';
const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (Postman, curl) where origin is undefined
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - MUST BE BEFORE STATIC FILES AND CATCH-ALL ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve frontend static files if available (check multiple candidate build locations)
const possibleFrontends = [
  path.join(process.cwd(), 'build'),                  // project-root/build
  path.join(process.cwd(), 'backend', 'build'),       // backend/build
  path.join(process.cwd(), 'frontend', 'build'),      // frontend/build
];

const frontendDist = possibleFrontends.find(p => fs.existsSync(p));
console.log('Checking for frontend build at:', possibleFrontends[0], possibleFrontends[1], possibleFrontends[2]);
if (frontendDist) {
  console.log('✓ Serving frontend from:', frontendDist);
  app.use(express.static(frontendDist));

  // Fallback to index.html for SPA routes - MUST BE LAST
  app.get('*', (req, res, next) => {
    // Don't serve HTML for API routes that weren't matched
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API route not found' });
    }

    const indexPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
} else {
  console.warn('⚠ No frontend build found');
  app.get('/', (req, res) => {
    res.json({ message: 'Backend API running', api: '/api/*', health: '/health' });
  });
}

// Connect to MongoDB and start server
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('Port:', port);

mongoose.connect(process.env.MONGODB_URI!, {
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

    server.on('error', (err: any) => {
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