# 📚 Seminar Report Management System

A comprehensive web application for managing seminar reports with role-based access control for Students, Teachers, and Admins.

## ✨ Features

### 🔐 Authentication & Security
- **Email Verification**: All users must verify email with OTP before account creation
- **Forgot Password**: Complete password reset flow with OTP verification
- **Role-Based Access**: Separate dashboards for Students, Teachers, and Admins
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for all passwords

### 👨‍🎓 Student Features
- Submit seminar topics for approval
- Upload seminar reports (PDF)
- Track submission status
- View teacher feedback
- Check grades and approvals

### 👨‍🏫 Teacher Features
- Review student topic submissions
- Approve/reject topics with feedback
- Grade seminar reports
- Provide detailed feedback
- View all student submissions

### 👨‍💼 Admin Features
- Manage all users (Students, Teachers)
- View system-wide statistics
- Monitor all submissions
- User management (edit/delete)

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Nodemailer** for email sending
- **Multer** for file uploads
- **Cloudinary** for file storage

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Gmail account (for email sending)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/adityachandravans/seminarreportmanagement2025.git
cd seminarreportmanagement2025
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/seminar_management
JWT_SECRET=your_jwt_secret_key_change_in_production
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Gmail SMTP Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM_NAME=Seminar Report System
EMAIL_FROM_ADDRESS=your_gmail@gmail.com
EMAIL_REPLY_TO=your_gmail@gmail.com

FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Note:** For Gmail, you need to generate an App Password. See [GET_APP_PASSWORD.md](GET_APP_PASSWORD.md)

Build and start backend:

```bash
npm run build
npm start
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

### 4. Access the Application

Open your browser and go to: **http://localhost:3000**

## 📖 Documentation

### Setup Guides
- [START_DEVELOPMENT.md](START_DEVELOPMENT.md) - Complete development setup
- [GMAIL_SETUP_GUIDE.md](GMAIL_SETUP_GUIDE.md) - Gmail SMTP configuration
- [MONGODB_SETUP_COMPLETE.md](MONGODB_SETUP_COMPLETE.md) - MongoDB setup

### Feature Documentation
- [EMAIL_VERIFICATION_REQUIRED.md](EMAIL_VERIFICATION_REQUIRED.md) - Email verification flow
- [FORGOT_PASSWORD_IMPLEMENTED.md](FORGOT_PASSWORD_IMPLEMENTED.md) - Password reset feature
- [EMAIL_TROUBLESHOOTING.md](EMAIL_TROUBLESHOOTING.md) - Email issues and solutions

### Deployment Guides
- [DEPLOYMENT_COMPLETE_GUIDE.md](DEPLOYMENT_COMPLETE_GUIDE.md) - Full deployment guide
- [RENDER_DOCKER_FIX.md](RENDER_DOCKER_FIX.md) - Render deployment
- [QUICK_DEPLOY_CHECKLIST.md](QUICK_DEPLOY_CHECKLIST.md) - Quick deployment steps

## 🎯 User Roles

### Student
- Register with email verification
- Submit seminar topics
- Upload seminar reports
- View feedback and grades

### Teacher
- Register with email verification
- Review student topics
- Grade seminar reports
- Provide feedback

### Admin
- Register with email verification
- Manage all users
- View system statistics
- Monitor all activities

## 🔒 Security Features

- ✅ Email verification required for all users
- ✅ OTP-based verification (10-minute expiry)
- ✅ Password reset with OTP
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Input validation
- ✅ Role-based access control

## 📧 Email Features

- ✅ OTP verification emails
- ✅ Welcome emails
- ✅ Password reset emails
- ✅ Report submission confirmations
- ✅ Professional HTML templates
- ✅ Gmail SMTP support

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"OK"}
```

### Test Registration Flow
1. Open http://localhost:3000
2. Click on a role (Student/Teacher/Admin)
3. Register with your email
4. Check email for OTP (or backend console)
5. Verify OTP
6. Login and use the system!

## 📁 Project Structure

```
seminarreportmanagement2025/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.ts       # Entry point
│   ├── dist/               # Compiled JavaScript
│   ├── uploads/            # Uploaded files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   └── package.json
└── README.md
```

## 🚢 Deployment

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy!

See [DEPLOYMENT_COMPLETE_GUIDE.md](DEPLOYMENT_COMPLETE_GUIDE.md) for details.

### Frontend (Vercel)
1. Push code to GitHub
2. Import project on Vercel
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy!

## 🐛 Troubleshooting

### Email Not Sending
- Check Gmail app password is correct
- Verify 2-Step Verification is enabled
- Check backend console for OTP (backup)
- See [EMAIL_TROUBLESHOOTING.md](EMAIL_TROUBLESHOOTING.md)

### MongoDB Connection Issues
- Verify MongoDB is running
- Check connection string
- Ensure IP is whitelisted (for Atlas)
- See [MONGODB_SETUP_COMPLETE.md](MONGODB_SETUP_COMPLETE.md)

### CORS Errors
- Check CORS_ORIGIN in backend/.env
- Ensure no trailing slashes in URLs
- Verify frontend URL matches

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Aditya Chandravanshi**
- GitHub: [@adityachandravans](https://github.com/adityachandravans)
- Email: chandravanshiaditya25@gmail.com

## 🙏 Acknowledgments

- React and TypeScript communities
- MongoDB and Express.js teams
- All contributors and testers

## 📞 Support

For issues and questions:
1. Check the documentation files
2. Review troubleshooting guides
3. Open an issue on GitHub
4. Contact the author

---

**Built with ❤️ for efficient seminar report management**
