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

// Load environment variables
// This tries, in order:
// 1) backend/.env relative to this file
// 2) .env in the current working directory
// 3) backend/.env in the current working directory (monorepo root)
const candidateEnvPaths = [
  path.resolve(__dirname, '..', '.env'),                // backend/.env when running from backend
  path.resolve(process.cwd(), '.env'),                  // project-root/.env
  path.resolve(process.cwd(), 'backend', '.env'),       // project-root/backend/.env
];

let loadedEnvPath: string | null = null;
for (const p of candidateEnvPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    loadedEnvPath = p;
    console.log('✓ Loaded environment from', p);
    break;
  }
}

if (!loadedEnvPath) {
  console.warn('⚠️  No .env file found in expected locations. Using process.env only.');
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

const app: Express = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Middleware
// Configure CORS to accept frontend dev server and backend origin(s).
// Allow multiple origins via comma-separated `CORS_ORIGIN` in .env (e.g. "http://localhost:3000,http://localhost:5000").
// Default to common development ports if not specified
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173,http://localhost:5000';
const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);

console.log('✓ CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (Postman, curl) where origin is undefined
    if (!origin) return callback(null, true);
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  }
  next();
});

// API Routes - MUST BE BEFORE STATIC FILES AND CATCH-ALL ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

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
  const mongoState = mongoose.connection.readyState;
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
      status: mongoStates[mongoState as keyof typeof mongoStates] || 'unknown',
      connected: mongoState === 1,
      database: mongoose.connection.db?.databaseName || 'unknown'
    },
    port: port
  });
});

// Test endpoint to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    mongodb: {
      connected: mongoose.connection.readyState === 1,
      database: mongoose.connection.db?.databaseName || 'unknown'
    }
  });
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
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'SET (first 20 chars: ' + process.env.MONGODB_URI.substring(0, 20) + '...)' : 'NOT SET');
try {
  if (process.env.MONGODB_URI) {
    const mongoUrl = new URL(process.env.MONGODB_URI);
    const dbName = mongoUrl.pathname.slice(1) || 'default';
    console.log('Database Name:', dbName);
    console.log('MongoDB Host:', mongoUrl.hostname);
    console.log('MongoDB Port:', mongoUrl.port || '27017 (default)');
  }
} catch (error) {
  console.log('Note: Could not parse MongoDB URI (might be connection string format)');
}
console.log('Port:', port);

mongoose.connect(process.env.MONGODB_URI!, {
  serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
})
  .then(() => {
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    console.log('✓ Connected to MongoDB');
    console.log('✓ Database Name:', dbName);
    console.log('✓ MongoDB Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
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
    console.error('✗ Error details:', error);
    console.error('✗ Please check:');
    console.error('  1. MongoDB is running');
    console.error('  2. MONGODB_URI in .env file is correct');
    console.error('  3. Network connectivity to MongoDB server');
    console.error('  4. MongoDB server is accessible from this machine');
    process.exit(1);
  });