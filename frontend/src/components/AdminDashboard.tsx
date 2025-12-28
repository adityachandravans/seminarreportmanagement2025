import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Topic, SeminarReport } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { 
  Shield, 
  Users, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  LogOut,
  Search,
  Edit,
  Trash2,
  Plus,
  Download,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface AdminDashboardProps {
  user: User;
  users: User[];
  topics: Topic[];
  reports: SeminarReport[];
  onLogout: () => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
}

export default function AdminDashboard({ 
  user, 
  users, 
  topics, 
  reports, 
  onLogout, 
  onUpdateUser, 
  onDeleteUser 
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Partial<User>>({});
  const [isAddingUser, setIsAddingUser] = useState(false);

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');
  const admins = users.filter(u => u.role === 'admin');

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Analytics data
  const topicsByStatus = [
    { name: 'Pending', value: topics.filter(t => t.status === 'pending').length, color: '#f59e0b' },
    { name: 'Approved', value: topics.filter(t => t.status === 'approved').length, color: '#10b981' },
    { name: 'Rejected', value: topics.filter(t => t.status === 'rejected').length, color: '#ef4444' }
  ];

  const reportsByStatus = [
    { name: 'Submitted', value: reports.filter(r => r.status === 'submitted').length, color: '#f59e0b' },
    { name: 'Reviewed', value: reports.filter(r => r.status === 'reviewed').length, color: '#10b981' },
    { name: 'Approved', value: reports.filter(r => r.status === 'approved').length, color: '#3b82f6' }
  ];

  const departmentData = [
    { department: 'Computer Science', students: students.filter(s => s.department === 'Computer Science').length },
    { department: 'Electronics', students: students.filter(s => s.department === 'Electronics').length },
    { department: 'Mechanical', students: students.filter(s => s.department === 'Mechanical').length },
    { department: 'Civil', students: students.filter(s => s.department === 'Civil').length },
    { department: 'Chemical', students: students.filter(s => s.department === 'Chemical').length }
  ];

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserForm(user);
  };

  const handleUpdateUser = async () => {
    if (selectedUser && userForm) {
      try {
        await onUpdateUser(selectedUser.id, userForm);
        setSelectedUser(null);
        setUserForm({});
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }
  };

  const handleAddUser = () => {
    setIsAddingUser(true);
    setUserForm({
      email: '',
      name: '',
      role: 'student',
      password: '',
      rollNumber: '',
      department: '',
      year: undefined,
      specialization: ''
    });
  };

  const handleCreateUser = async () => {
    if (!userForm.email || !userForm.name || !userForm.role || !userForm.password) {
      alert('Please fill in all required fields (email, name, role, password)');
      return;
    }

    try {
      // Call the register API to create a new user
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(userForm)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      alert('User created successfully!');
      setIsAddingUser(false);
      setUserForm({});
      // Refresh the page to show new user
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(error.message || 'Failed to create user');
    }
  };

  const generateReport = () => {
    const reportData = {
      totalUsers: users.length,
      students: students.length,
      teachers: teachers.length,
      topics: {
        total: topics.length,
        approved: topics.filter(t => t.status === 'approved').length,
        pending: topics.filter(t => t.status === 'pending').length,
        rejected: topics.filter(t => t.status === 'rejected').length
      },
      reports: {
        total: reports.length,
        reviewed: reports.filter(r => r.status === 'reviewed').length,
        pending: reports.filter(r => r.status === 'submitted').length
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">System Administrator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={generateReport}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </Button>
              <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="overview">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="teachers">
              <BookOpen className="h-4 w-4 mr-2" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="system">
              <Activity className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Shield className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { title: 'Total Users', value: users.length, icon: Users, color: 'from-blue-500 to-blue-600' },
                  { title: 'Total Topics', value: topics.length, icon: BookOpen, color: 'from-green-500 to-green-600' },
                  { title: 'Total Reports', value: reports.length, icon: FileText, color: 'from-purple-500 to-purple-600' },
                  { title: 'Teachers', value: teachers.length, icon: Activity, color: 'from-orange-500 to-orange-600' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card className="p-6 bg-white shadow-lg border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* User Distribution */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white shadow-lg border-0">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    User Distribution
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Students</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-blue-100 rounded-full">
                          <div 
                            className="h-2 bg-blue-600 rounded-full" 
                            style={{ width: `${(students.length / users.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{students.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Teachers</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-green-100 rounded-full">
                          <div 
                            className="h-2 bg-green-600 rounded-full" 
                            style={{ width: `${(teachers.length / users.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{teachers.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Admins</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-orange-100 rounded-full">
                          <div 
                            className="h-2 bg-orange-600 rounded-full" 
                            style={{ width: `${(admins.length / users.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{admins.length}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white shadow-lg border-0">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                    Topic Status
                  </h3>
                  <div className="space-y-4">
                    {topicsByStatus.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-sm">{item.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${(item.value / topics.length) * 100}%`,
                                backgroundColor: item.color
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-white shadow-lg border-0">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    Report Status
                  </h3>
                  <div className="space-y-4">
                    {reportsByStatus.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-sm">{item.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${(item.value / reports.length) * 100}%`,
                                backgroundColor: item.color
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">User Management</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-80"
                    />
                  </div>
                  <Button 
                    onClick={handleAddUser}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="p-6 bg-white shadow-lg border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-full ${
                            user.role === 'student' ? 'bg-blue-100 text-blue-600' :
                            user.role === 'teacher' ? 'bg-green-100 text-green-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {user.role === 'student' ? '👨‍🎓' : user.role === 'teacher' ? '👨‍🏫' : '👨‍💼'}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <Badge variant="outline" className={
                                user.role === 'student' ? 'border-blue-200 text-blue-800' :
                                user.role === 'teacher' ? 'border-green-200 text-green-800' :
                                'border-orange-200 text-orange-800'
                              }>
                                {user.role}
                              </Badge>
                              {user.department && (
                                <span className="text-sm text-muted-foreground">
                                  {user.department}
                                </span>
                              )}
                              {user.rollNumber && (
                                <span className="text-sm text-muted-foreground">
                                  Roll: {user.rollNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteUser(user.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="teachers">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Teacher Management</h2>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                    {teachers.length} Teachers Registered
                  </Badge>
                </div>
              </div>

              {/* Teacher Stats Overview */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4 bg-white shadow-lg border-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{teachers.length}</p>
                      <p className="text-sm text-muted-foreground">Total Teachers</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-white shadow-lg border-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {topics.filter(t => t.status === 'approved').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Topics Approved</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-white shadow-lg border-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        {reports.filter(r => r.status === 'reviewed' || r.status === 'approved').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Reports Reviewed</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-white shadow-lg border-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {topics.filter(t => t.status === 'pending').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Pending Reviews</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Teacher List */}
              <Card className="p-6 bg-white shadow-lg border-0">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  All Teachers
                </h3>
                {teachers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No teachers registered yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teachers.map((teacher, index) => {
                      // Calculate teacher's activity
                      const teacherTopicsReviewed = topics.filter(t => 
                        t.teacherId === teacher.id && (t.status === 'approved' || t.status === 'rejected')
                      ).length;
                      const teacherReportsReviewed = reports.filter(r => 
                        r.teacherId === teacher.id && (r.status === 'reviewed' || r.status === 'approved')
                      ).length;
                      
                      return (
                        <motion.div
                          key={teacher.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <Card className="p-4 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="p-3 bg-green-100 rounded-full">
                                  <span className="text-2xl">👨‍🏫</span>
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold">{teacher.name}</h4>
                                  <p className="text-sm text-muted-foreground">{teacher.email}</p>
                                  <div className="flex items-center space-x-3 mt-1">
                                    {teacher.department && (
                                      <Badge variant="outline" className="border-green-300 text-green-700">
                                        {teacher.department}
                                      </Badge>
                                    )}
                                    {teacher.specialization && (
                                      <span className="text-sm text-muted-foreground">
                                        {teacher.specialization}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-6">
                                <div className="text-center">
                                  <p className="text-xl font-bold text-blue-600">{teacherTopicsReviewed}</p>
                                  <p className="text-xs text-muted-foreground">Topics Reviewed</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xl font-bold text-purple-600">{teacherReportsReviewed}</p>
                                  <p className="text-xs text-muted-foreground">Reports Reviewed</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditUser(teacher)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDeleteUser(teacher.id)}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Teacher Activity Summary */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white shadow-lg border-0">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                    Topic Review Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Approved Topics</span>
                      <Badge className="bg-green-100 text-green-800">
                        {topics.filter(t => t.status === 'approved').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium">Pending Topics</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {topics.filter(t => t.status === 'pending').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Rejected Topics</span>
                      <Badge className="bg-red-100 text-red-800">
                        {topics.filter(t => t.status === 'rejected').length}
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white shadow-lg border-0">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    Report Review Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Reviewed Reports</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {reports.filter(r => r.status === 'reviewed').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Approved Reports</span>
                      <Badge className="bg-green-100 text-green-800">
                        {reports.filter(r => r.status === 'approved').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium">Pending Reports</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {reports.filter(r => r.status === 'submitted').length}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">System Analytics</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white shadow-lg border-0">
                  <h3 className="text-lg font-semibold mb-4">Students by Department</h3>
                  <ChartContainer
                    config={{
                      students: {
                        label: "Students",
                        color: "#3b82f6",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="department" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="students" fill="#3b82f6" />
                    </BarChart>
                  </ChartContainer>
                </Card>

                <Card className="p-6 bg-white shadow-lg border-0">
                  <h3 className="text-lg font-semibold mb-4">Topic Status Distribution</h3>
                  <ChartContainer
                    config={{
                      pending: {
                        label: "Pending",
                        color: "#f59e0b",
                      },
                      approved: {
                        label: "Approved", 
                        color: "#10b981",
                      },
                      rejected: {
                        label: "Rejected",
                        color: "#ef4444",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <RechartsPieChart>
                      <Pie
                        data={topicsByStatus}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                      >
                        {topicsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPieChart>
                  </ChartContainer>
                  <div className="flex justify-center space-x-4 mt-4">
                    {topicsByStatus.map((item, index) => (
                      <div key={`legend-${item.name}-${index}`} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-6 bg-white shadow-lg border-0">
                <h3 className="text-lg font-semibold mb-4">System Statistics</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{students.length}</p>
                    <p className="text-sm text-muted-foreground">Active Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{teachers.length}</p>
                    <p className="text-sm text-muted-foreground">Active Teachers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {topics.filter(t => t.status === 'approved').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Approved Topics</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">
                      {reports.filter(r => r.status === 'reviewed').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Reviewed Reports</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="system">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">System Management</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white shadow-lg border-0">
                  <h3 className="text-lg font-semibold mb-4">System Health</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Database Status</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Server Status</span>
                      <Badge className="bg-green-100 text-green-800">Running</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Users</span>
                      <span className="text-sm text-muted-foreground">{users.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Teachers</span>
                      <span className="text-sm text-muted-foreground">{teachers.length}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white shadow-lg border-0">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={generateReport}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export System Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      View Activity Logs
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Bulk User Import
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Security Settings
                    </Button>
                  </div>
                </Card>
              </div>

              <Card className="p-6 bg-white shadow-lg border-0">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {/* Show recent topics */}
                  {topics.slice(-3).reverse().map((topic, index) => (
                    <motion.div
                      key={`topic-${topic.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          Topic {topic.status === 'approved' ? 'approved' : topic.status === 'rejected' ? 'rejected' : 'submitted'}: {topic.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {users.find(u => u.id === topic.studentId)?.name || 'Student'}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{topic.submittedAt}</span>
                    </motion.div>
                  ))}
                  {/* Show recent reports */}
                  {reports.slice(-2).reverse().map((report, index) => (
                    <motion.div
                      key={`report-${report.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index + 3) * 0.1 }}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          Report {report.status}: {report.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {users.find(u => u.id === report.studentId)?.name || 'Student'}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{report.submittedAt}</span>
                    </motion.div>
                  ))}
                  {topics.length === 0 && reports.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                  )}
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Administrator Profile</h2>
              
              <Card className="p-6 bg-white shadow-lg border-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600 font-medium">Administrator Account</span>
                  </div>
                </div>
                
                {/* Personal Information */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Personal Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Label className="text-sm text-gray-600">Full Name</Label>
                      <p className="text-lg font-medium">{user.name || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Label className="text-sm text-gray-600">Email Address</Label>
                      <p className="text-lg font-medium">{user.email || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Label className="text-sm text-gray-600">User Role</Label>
                      <p className="text-lg font-medium capitalize">{user.role || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Label className="text-sm text-gray-600">Administrator ID</Label>
                      <p className="text-sm font-mono text-gray-500">{user.id || 'Not available'}</p>
                    </div>
                  </div>
                </div>

                {/* Administrative Information */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Administrative Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-3 rounded-lg">
                      <Label className="text-sm text-red-600">Department</Label>
                      <p className="text-lg font-medium">{user.department || 'System Administration'}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <Label className="text-sm text-red-600">Specialization</Label>
                      <p className="text-lg font-medium">{user.specialization || 'System Management'}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <Label className="text-sm text-red-600">Employee ID</Label>
                      <p className="text-lg font-medium">{user.rollNumber || 'ADMIN-001'}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <Label className="text-sm text-red-600">Access Level</Label>
                      <p className="text-lg font-medium">Full System Access</p>
                    </div>
                  </div>
                </div>

                {/* System Management Statistics */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    System Management Statistics
                  </h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                      <Label className="text-sm text-blue-600">Total Users</Label>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{topics.length}</p>
                      <Label className="text-sm text-green-600">Total Topics</Label>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600">{reports.length}</p>
                      <Label className="text-sm text-purple-600">Total Reports</Label>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-600">{users.filter(u => u.role === 'admin').length}</p>
                      <Label className="text-sm text-orange-600">Admin Users</Label>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Administrative Privileges */}
              <Card className="p-6 bg-white shadow-lg border-0">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  Administrative Privileges
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">User Management</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Create, edit, and delete users
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Manage user roles and permissions
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        View all user activities
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Export user data
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">System Management</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        View system analytics
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Monitor system health
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Manage database backups
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Configure system settings
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Account Security */}
              <Card className="p-6 bg-white shadow-lg border-0">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-600" />
                  Account Security
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-700">Two-Factor Auth</p>
                    <p className="text-sm text-green-600">Enabled</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium text-blue-700">Password Strength</p>
                    <p className="text-sm text-blue-600">Strong</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-medium text-purple-700">Last Login</p>
                    <p className="text-sm text-purple-600">Today</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Edit user information and update their details
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={userForm.name || ''}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={userForm.email || ''}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={userForm.role} onValueChange={(value: string) => setUserForm(prev => ({ ...prev, role: value as 'student' | 'teacher' | 'admin' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {userForm.role === 'student' && (
                <>
                  <div>
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      value={userForm.rollNumber || ''}
                      onChange={(e) => setUserForm(prev => ({ ...prev, rollNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={userForm.department || ''}
                      onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                </>
              )}
              <Button onClick={handleUpdateUser} className="w-full">
                Update User
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddingUser} onOpenChange={() => setIsAddingUser(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account by filling in the required information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newName">Name *</Label>
              <Input
                id="newName"
                value={userForm.name || ''}
                onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="newEmail">Email *</Label>
              <Input
                id="newEmail"
                type="email"
                value={userForm.email || ''}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Password *</Label>
              <Input
                id="newPassword"
                type="password"
                value={userForm.password || ''}
                onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password (min 6 characters)"
              />
            </div>
            <div>
              <Label htmlFor="newRole">Role *</Label>
              <Select value={userForm.role} onValueChange={(value: string) => setUserForm(prev => ({ ...prev, role: value as 'student' | 'teacher' | 'admin' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {userForm.role === 'student' && (
              <>
                <div>
                  <Label htmlFor="newRollNumber">Roll Number</Label>
                  <Input
                    id="newRollNumber"
                    value={userForm.rollNumber || ''}
                    onChange={(e) => setUserForm(prev => ({ ...prev, rollNumber: e.target.value }))}
                    placeholder="Enter roll number"
                  />
                </div>
                <div>
                  <Label htmlFor="newDepartment">Department</Label>
                  <Select value={userForm.department} onValueChange={(value: string) => setUserForm(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                      <SelectItem value="Chemical">Chemical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="newYear">Year</Label>
                  <Select value={userForm.year?.toString()} onValueChange={(value: string) => setUserForm(prev => ({ ...prev, year: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {userForm.role === 'teacher' && (
              <>
                <div>
                  <Label htmlFor="newTeacherDepartment">Department</Label>
                  <Select value={userForm.department} onValueChange={(value: string) => setUserForm(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                      <SelectItem value="Chemical">Chemical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="newSpecialization">Specialization</Label>
                  <Input
                    id="newSpecialization"
                    value={userForm.specialization || ''}
                    onChange={(e) => setUserForm(prev => ({ ...prev, specialization: e.target.value }))}
                    placeholder="Enter specialization"
                  />
                </div>
              </>
            )}
            <Button onClick={handleCreateUser} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white">
              Create User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}