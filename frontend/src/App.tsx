import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole, User, SeminarReport, Topic } from './types';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import OTPVerification from './components/OTPVerification';
import ForgotPassword from './components/ForgotPassword';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import { authAPI, topicsAPI, reportsAPI, usersAPI } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'otp' | 'dashboard' | 'forgotPassword'>('landing');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthMode, setIsAuthMode] = useState<'login' | 'register'>('login');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [reports, setReports] = useState<SeminarReport[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState<{ userId: string; email: string } | null>(null);

  // Helper function to normalize MongoDB _id to id
  const normalizeTopic = (topic: any): Topic => {
    return {
      id: topic._id || topic.id,
      title: topic.title,
      description: topic.description,
      studentId: topic.studentId && typeof topic.studentId === 'object' ? (topic.studentId._id || topic.studentId.id) : topic.studentId,
      teacherId: topic.teacherId ? (typeof topic.teacherId === 'object' ? (topic.teacherId._id || topic.teacherId.id) : topic.teacherId) : undefined,
      status: topic.status || 'pending',
      submittedAt: topic.submittedAt || new Date().toISOString().split('T')[0],
      reviewedAt: topic.reviewedAt,
      feedback: topic.feedback
    };
  };

  const normalizeReport = (report: any): SeminarReport => {
    return {
      id: report._id || report.id,
      title: report.title,
      topicId: report.topicId && typeof report.topicId === 'object' ? (report.topicId._id || report.topicId.id) : report.topicId,
      studentId: report.studentId && typeof report.studentId === 'object' ? (report.studentId._id || report.studentId.id) : report.studentId,
      teacherId: report.teacherId ? (typeof report.teacherId === 'object' ? (report.teacherId._id || report.teacherId.id) : report.teacherId) : undefined,
      fileName: report.fileName,
      fileSize: report.fileSize,
      submittedAt: report.submittedAt || new Date().toISOString().split('T')[0],
      status: report.status || 'submitted',
      feedback: report.feedback,
      grade: report.grade
    };
  };

  // Load topics, reports, and students from API
  // NOTE: This function is NOT memoized to avoid re-triggering effects unnecessarily
  const loadData = async () => {
    try {
      const [topicsData, reportsData] = await Promise.all([
        topicsAPI.getAll(),
        reportsAPI.getAll()
      ]);
      
      // Normalize MongoDB _id to id for all topics and reports
      // Filter out null/undefined values before normalizing
      const normalizedTopics = (Array.isArray(topicsData) ? topicsData : [])
        .filter(t => t != null)
        .map(normalizeTopic);
      const normalizedReports = (Array.isArray(reportsData) ? reportsData : [])
        .filter(r => r != null)
        .map(normalizeReport);
      
      setTopics(normalizedTopics);
      setReports(normalizedReports);
      
      // Load all users if user is teacher or admin
      if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
        try {
          const usersData = await usersAPI.getAll();
          const normalizedUsers = (Array.isArray(usersData) ? usersData : [])
            .map((u: any) => ({
              ...u,
              id: u._id || u.id
            }));
          setStudents(normalizedUsers); // This now contains ALL users, not just students
        } catch (error) {
          console.error('Error loading users:', error);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Load user from localStorage on app start (once on mount)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          // Verify token is still valid by fetching current user
          try {
            const user = await authAPI.getCurrentUser();
            setCurrentUser(user as User);
            setCurrentPage('dashboard');
            // Load data after setting user
            await loadData();
          } catch (error) {
            // Token invalid, clear storage
            console.error('Token validation failed:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setIsLoading(false);
          }
        } else {
          // No token, set loading to false
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setIsLoading(false);
      }
    };

    loadUser();
    // Only run once on mount, not on dependency changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate effect to load data when user changes (explicit refresh only)
  useEffect(() => {
    if (currentUser && currentPage === 'dashboard') {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]); // Only depend on user ID, not the entire user object

  const handleLogin = async (email: string, password: string) => {
    try {
      // Check if login requires verification
      const loginData = localStorage.getItem('loginData');
      if (loginData) {
        const data = JSON.parse(loginData);
        if (data.requiresVerification) {
          // Show OTP verification page
          setPendingVerification({ userId: data.userId, email: data.email });
          setCurrentPage('otp');
          localStorage.removeItem('loginData');
          return true;
        }
      }

      // User is already authenticated by AuthPage component
      // Just navigate to dashboard
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setCurrentPage('dashboard');
        await loadData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in handleLogin:', error);
      return false;
    }
  };

  const handleRegister = async (userData: Partial<User>) => {
    try {
      // Check if registration requires verification
      const registrationData = localStorage.getItem('registrationData');
      if (registrationData) {
        const data = JSON.parse(registrationData);
        if (data.requiresVerification) {
          // Show OTP verification page
          setPendingVerification({ userId: data.userId, email: data.email });
          setCurrentPage('otp');
          localStorage.removeItem('registrationData');
          return true;
        }
      }

      // User is already authenticated by AuthPage component
      // Just navigate to dashboard
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setCurrentPage('dashboard');
        await loadData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in handleRegister:', error);
      return false;
    }
  };

  const handleOTPVerified = async (token: string, user: any) => {
    // Store token and user
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    setCurrentPage('dashboard');
    setPendingVerification(null);
    await loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentPage('landing');
    setSelectedRole(null);
    setTopics([]);
    setReports([]);
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
            onSubmitTopic={async (topic) => {
              // Topic is already created in StudentDashboard, just refresh data
              try {
                await loadData();
              } catch (error) {
                console.error('Error refreshing data after topic submission:', error);
              }
            }}
            onSubmitReport={async (report) => {
              // Report is already created in StudentDashboard, just refresh data
              try {
                await loadData();
              } catch (error) {
                console.error('Error refreshing data after report submission:', error);
              }
            }}
          />
        );
      case 'teacher':
        return (
          <TeacherDashboard
            user={currentUser}
            topics={topics}
            reports={reports}
            students={students.filter(u => u.role === 'student')}
            onLogout={handleLogout}
            onUpdateTopic={async (topicId, updates) => {
              try {
                // Ensure topicId is a valid MongoDB ObjectId format
                let normalizedTopicId = topicId;
                if (topicId && !topicId.match(/^[0-9a-fA-F]{24}$/)) {
                  // If it's not a valid ObjectId, try to find the topic by id field
                  const topic = topics.find(t => t.id === topicId);
                  if (topic) {
                    // Use the topic's id which should already be normalized
                    normalizedTopicId = topic.id;
                  } else {
                    throw new Error('Invalid topic ID format');
                  }
                }
                
                if (import.meta.env.DEV) {
                  console.log('📝 Updating topic:', { topicId, normalizedTopicId, updates });
                }
                
                // Update local state immediately for better UX
                const currentTopic = topics.find(t => t.id === topicId || t.id === normalizedTopicId);
                if (currentTopic) {
                  const updatedTopicLocal = { ...currentTopic, ...updates } as Topic;
                  setTopics(topics.map(t => (t.id === topicId || t.id === normalizedTopicId) ? updatedTopicLocal : t));
                }
                
                // Then sync with backend
                const updatedTopic = await topicsAPI.update(normalizedTopicId, updates);
                const normalizedUpdatedTopic = normalizeTopic(updatedTopic);
                setTopics(topics.map(t => t.id === normalizedTopicId ? normalizedUpdatedTopic : t));
              } catch (error: any) {
                console.error('Error updating topic:', error);
                alert(error.response?.data?.message || error.message || 'Failed to update topic');
                // Reload topics to get correct state
                await loadData();
              }
            }}
            onUpdateReport={async (reportId, updates) => {
              try {
                // Ensure reportId is a valid MongoDB ObjectId format
                let normalizedReportId = reportId;
                if (reportId && !reportId.match(/^[0-9a-fA-F]{24}$/)) {
                  // If it's not a valid ObjectId, try to find the report by id field
                  const report = reports.find(r => r.id === reportId);
                  if (report) {
                    normalizedReportId = report.id;
                  } else {
                    throw new Error('Invalid report ID format');
                  }
                }
                
                // Update local state immediately for better UX
                const currentReport = reports.find(r => r.id === reportId || r.id === normalizedReportId);
                if (currentReport) {
                  const updatedReportLocal = { ...currentReport, ...updates } as SeminarReport;
                  setReports(reports.map(r => (r.id === reportId || r.id === normalizedReportId) ? updatedReportLocal : r));
                }
                
                // Then sync with backend
                const updatedReport = await reportsAPI.update(normalizedReportId, updates);
                const normalizedUpdatedReport = normalizeReport(updatedReport);
                setReports(reports.map(r => r.id === normalizedReportId ? normalizedUpdatedReport : r));
              } catch (error: any) {
                console.error('Error updating report:', error);
                alert(error.response?.data?.message || error.message || 'Failed to update report');
                // Reload reports to get correct state
                await loadData();
              }
            }}
          />
        );
        case 'admin':
        return (
          <AdminDashboard
            user={currentUser}
            users={students}
            topics={topics}
            reports={reports}
            onLogout={handleLogout}
            onUpdateUser={async (userId, updates) => {
              try {
                if (import.meta.env.DEV) {
                  console.log('📝 Admin updating user:', userId, updates);
                }
                const updatedUser = await usersAPI.update(userId, updates);
                
                // Update local student list
                setStudents(students.map(u => u.id === userId ? { ...updatedUser, id: updatedUser._id || updatedUser.id } : u));
                
                // Refresh all data to ensure consistency
                await loadData();
                alert('User updated successfully');
              } catch (error: any) {
                console.error('Error updating user:', error);
                alert(error.response?.data?.message || error.message || 'Failed to update user');
              }
            }}
            onDeleteUser={async (userId) => {
              try {
                if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                  return;
                }
                if (import.meta.env.DEV) {
                  console.log('🗑️ Admin deleting user:', userId);
                }
                await usersAPI.delete(userId);
                
                // Remove from local state
                setStudents(students.filter(u => u.id !== userId));
                
                // Refresh all data
                await loadData();
                alert('User deleted successfully');
              } catch (error: any) {
                console.error('Error deleting user:', error);
                alert(error.response?.data?.message || error.message || 'Failed to delete user');
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
              onForgotPassword={() => setCurrentPage('forgotPassword')}
            />
          </motion.div>
        )}

        {currentPage === 'otp' && pendingVerification && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <OTPVerification
              userId={pendingVerification.userId}
              email={pendingVerification.email}
              onVerified={handleOTPVerified}
              onBack={() => {
                setCurrentPage('auth');
                setPendingVerification(null);
              }}
            />
          </motion.div>
        )}

        {currentPage === 'forgotPassword' && (
          <motion.div
            key="forgotPassword"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ForgotPassword
              onBack={() => setCurrentPage('auth')}
              onSuccess={() => {
                setCurrentPage('auth');
                setIsAuthMode('login');
              }}
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