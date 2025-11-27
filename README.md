# Seminar Management System

A comprehensive full-stack web application for managing seminar reports with role-based access control for students, teachers, and administrators.

## 🚀 Features

### Student Features
- Register and login with email/password
- Submit seminar topics for approval
- Upload seminar reports (PDF)
- Track topic and report status
- View feedback from teachers

### Teacher Features
- Review and approve/reject student topics
- Grade seminar reports
- Provide feedback to students
- View all students and their submissions

### Admin Features
- Manage all users (students, teachers)
- View all topics and reports
- System-wide oversight
- User management (edit, delete)

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Radix UI** for accessible components
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **SendGrid** for email notifications
- **Multer** for file uploads

## 📋 Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- npm or yarn
- SendGrid API key (for emails)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd seminar-management-system
```

### 2. Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Configure environment variables

**Backend** - Create `backend/.env`:
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

**Frontend** - Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Development Mode

**Option 1: Using PowerShell script (Windows)**
```powershell
.\START_DEV.ps1
```

**Option 2: Manual start**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Access the application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

### Test the system
```powershell
.\test-system.ps1
```

## 📦 Production Deployment

### Build for production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm run build
npm start
```

### Docker Deployment

```bash
# Copy environment example
cp .env.example .env

# Edit .env with your production values
# Then start with Docker Compose
docker-compose up -d
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 📁 Project Structure

```
seminar-management-system/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── server.ts       # Entry point
│   ├── uploads/            # Uploaded files
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── .env                # Environment variables
│   └── package.json
│
├── docker-compose.yml      # Docker configuration
├── DEPLOYMENT_GUIDE.md     # Deployment instructions
└── README.md               # This file
```

## 🔐 Default User Roles

The system supports three user roles:

1. **Student** - Can submit topics and reports
2. **Teacher** - Can review and grade submissions
3. **Admin** - Full system access

Users register with their chosen role and are automatically verified.

## 🧪 Testing

### Test system health
```powershell
.\test-system.ps1
```

### Manual API testing
```bash
# Health check
curl http://localhost:5000/health

# Test API
curl http://localhost:5000/api/test
```

## 🐛 Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check `.env` file exists with correct values
- Verify port 5000 is not in use

### Frontend can't connect
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

### Database errors
- Verify MongoDB connection string
- Check MongoDB service is running
- Test connection: `mongosh "mongodb://localhost:27017/seminar_management"`

### Port conflicts
```powershell
# Check what's using the port
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill process if needed
taskkill /F /PID <process_id>
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Topics
- `GET /api/topics` - Get all topics
- `POST /api/topics` - Create topic
- `PUT /api/topics/:id` - Update topic
- `DELETE /api/topics/:id` - Delete topic

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Upload report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/:id/download` - Download report

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- File upload restrictions
- Role-based access control

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions:
- Check the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Review the troubleshooting section above
- Check application logs

## ✅ System Status

All systems operational:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ MongoDB connected
- ✅ No TypeScript errors
- ✅ All tests passing
- ✅ Deployment ready

---

**Built with ❤️ for efficient seminar management**
