import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole, User, SeminarReport, Topic } from './types';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthMode, setIsAuthMode] = useState<'login' | 'register'>('login');

  // Mock data
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'student@example.com',
      password: 'password',
      name: 'John Student',
      role: 'student',
      rollNumber: 'CS2021001',
      department: 'Computer Science',
      year: 3
    },
    {
      id: '2',
      email: 'teacher@example.com',
      password: 'password',
      name: 'Dr. Jane Teacher',
      role: 'teacher',
      department: 'Computer Science',
      specialization: 'Machine Learning'
    },
    {
      id: '3',
      email: 'admin@example.com',
      password: 'password',
      name: 'Admin User',
      role: 'admin'
    }
  ]);

  const [topics, setTopics] = useState<Topic[]>([
    {
      id: '1',
      title: 'Machine Learning in Healthcare',
      description: 'Exploring applications of ML in medical diagnosis',
      studentId: '1',
      teacherId: '2',
      status: 'approved',
      submittedAt: '2024-01-15',
      reviewedAt: '2024-01-16'
    }
  ]);

  const [reports, setReports] = useState<SeminarReport[]>([
    {
      id: '1',
      title: 'Machine Learning in Healthcare - Final Report',
      topicId: '1',
      studentId: '1',
      teacherId: '2',
      fileName: 'ml-healthcare-report.pdf',
      fileSize: '2.5 MB',
      submittedAt: '2024-02-20',
      status: 'reviewed',
      feedback: 'Excellent work! Well researched and presented.',
      grade: 'A'
    }
  ]);

  const handleLogin = (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setCurrentPage('dashboard');
      return true;
    }
    return false;
  };

  const handleRegister = (userData: Partial<User>) => {
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email!,
      password: userData.password!,
      name: userData.name!,
      role: userData.role!,
      ...(userData.role === 'student' && {
        rollNumber: userData.rollNumber,
        department: userData.department,
        year: userData.year
      }),
      ...(userData.role === 'teacher' && {
        department: userData.department,
        specialization: userData.specialization
      })
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setCurrentPage('dashboard');
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('landing');
    setSelectedRole(null);
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentPage('auth');
  };

  const renderDashboard = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case 'student':
        return (
          <StudentDashboard
            user={currentUser}
            topics={topics}
            reports={reports}
            onLogout={handleLogout}
            onSubmitTopic={(topic) => {
              const newTopic: Topic = {
                id: Date.now().toString(),
                ...topic,
                studentId: currentUser.id,
                status: 'pending',
                submittedAt: new Date().toISOString().split('T')[0]
              };
              setTopics([...topics, newTopic]);
            }}
            onSubmitReport={(report) => {
              const newReport: SeminarReport = {
                id: Date.now().toString(),
                ...report,
                studentId: currentUser.id,
                submittedAt: new Date().toISOString().split('T')[0],
                status: 'submitted'
              };
              setReports([...reports, newReport]);
            }}
          />
        );
      case 'teacher':
        return (
          <TeacherDashboard
            user={currentUser}
            topics={topics}
            reports={reports}
            students={users.filter(u => u.role === 'student')}
            onLogout={handleLogout}
            onUpdateTopic={(topicId, updates) => {
              setTopics(topics.map(t => t.id === topicId ? { ...t, ...updates } : t));
            }}
            onUpdateReport={(reportId, updates) => {
              setReports(reports.map(r => r.id === reportId ? { ...r, ...updates } : r));
            }}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            user={currentUser}
            users={users}
            topics={topics}
            reports={reports}
            onLogout={handleLogout}
            onUpdateUser={(userId, updates) => {
              setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
            }}
            onDeleteUser={(userId) => {
              setUsers(users.filter(u => u.id !== userId));
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {currentPage === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onRoleSelect={handleRoleSelect} />
          </motion.div>
        )}

        {currentPage === 'auth' && selectedRole && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <AuthPage
              role={selectedRole}
              mode={isAuthMode}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onModeChange={setIsAuthMode}
              onBack={() => setCurrentPage('landing')}
            />
          </motion.div>
        )}

        {currentPage === 'dashboard' && currentUser && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            {renderDashboard()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}