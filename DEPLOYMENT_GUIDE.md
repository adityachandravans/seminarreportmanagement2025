# Seminar Management System - Deployment Guide

## System Overview

A full-stack web application for managing seminar reports with role-based access control.

### Technology Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB
- **Authentication**: JWT
- **Email**: SendGrid

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or remote)
- npm or yarn

### Installation

1. **Install Dependencies**
```powershell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. **Configure Environment Variables**

Backend (`.env` in `backend/` folder):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/seminar_management
JWT_SECRET=your_jwt_secret_key_change_in_production_2024
CORS_ORIGIN=http://localhost:3000
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM_NAME=Seminar Report System
EMAIL_FROM_ADDRESS=your_email@example.com
EMAIL_REPLY_TO=your_email@example.com
FRONTEND_URL=http://localhost:3000
```

Frontend (`.env` in `frontend/` folder):
```env
VITE_API_URL=http://localhost:5000/api
```

3. **Start Development Servers**

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

4. **Verify System**
```powershell
.\test-system.ps1
```

### Development URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

## Production Deployment

### 1. Build Frontend

```powershell
cd frontend
npm run build
```

This creates a `frontend/build` folder with optimized static files.

### 2. Build Backend

```powershell
cd backend
npm run build
```

This compiles TypeScript to JavaScript in `backend/dist` folder.

### 3. Production Environment Variables

**Backend Production `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seminar_management
JWT_SECRET=generate_a_strong_random_secret_here
CORS_ORIGIN=https://yourdomain.com
SENDGRID_API_KEY=your_production_sendgrid_key
EMAIL_FROM_NAME=Seminar Report System
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_REPLY_TO=support@yourdomain.com
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

### 4. Deployment Options

#### Option A: Traditional Server (VPS/Dedicated)

1. **Install Node.js and MongoDB** on server
2. **Copy files** to server
3. **Install dependencies** (production only):
```bash
cd backend
npm ci --production
cd ../frontend
npm ci --production
npm run build
```
4. **Use PM2** for process management:
```bash
npm install -g pm2
cd backend
pm2 start dist/server.js --name seminar-backend
pm2 save
pm2 startup
```

#### Option B: Docker Deployment

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/seminar_management
      - JWT_SECRET=${JWT_SECRET}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
    depends_on:
      - mongodb
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### Option C: Cloud Platforms

**Vercel (Frontend):**
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Add environment variable: `VITE_API_URL`

**Heroku/Railway (Backend):**
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add all environment variables

**MongoDB Atlas (Database):**
1. Create cluster
2. Get connection string
3. Update `MONGODB_URI` in backend

### 5. Nginx Configuration (Optional)

If serving both frontend and backend from same domain:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/seminar-frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use HTTPS in production
- [ ] Set proper CORS origins
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Set up monitoring

## Database Backup

```bash
# Backup
mongodump --uri="mongodb://localhost:27017/seminar_management" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/seminar_management" /backup/20241125
```

## Monitoring

### Health Check Endpoint
```
GET http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "mongodb": {
    "state": 1,
    "status": "connected",
    "connected": true,
    "database": "seminar_management"
  },
  "port": 5000
}
```

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify `.env` file exists and has correct values
- Check port 5000 is not in use: `netstat -ano | findstr :5000`

### Frontend can't connect to backend
- Verify `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend
- Ensure backend is running

### Database connection errors
- Verify MongoDB is running
- Check `MONGODB_URI` format
- Test connection: `mongosh "mongodb://localhost:27017/seminar_management"`

## Support

For issues or questions, check:
- Backend logs: `pm2 logs seminar-backend`
- Frontend console: Browser DevTools
- MongoDB logs: Check MongoDB service logs
