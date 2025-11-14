import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Topic, SeminarReport } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
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
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

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

  const handleUpdateUser = () => {
    if (selectedUser && userForm) {
      onUpdateUser(selectedUser.id, userForm);
      setSelectedUser(null);
      setUserForm({});
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
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="system">
              <Activity className="h-4 w-4 mr-2" />
              System
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
                  { title: 'Active Sessions', value: '12', icon: Activity, color: 'from-orange-500 to-orange-600' }
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
                  <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
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
                  <ResponsiveContainer width="100%" height={300}>
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
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6 bg-white shadow-lg border-0">
                  <h3 className="text-lg font-semibold mb-4">Topic Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <RechartsPieChart
                        data={topicsByStatus}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                      >
                        {topicsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center space-x-4 mt-4">
                    {topicsByStatus.map((item, index) => (
                      <div key={item.name} className="flex items-center space-x-2">
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
                      <span>Last Backup</span>
                      <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Sessions</span>
                      <span className="text-sm text-muted-foreground">12</span>
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
                  {[
                    { action: 'New student registered', user: 'John Doe', time: '2 minutes ago' },
                    { action: 'Topic approved', user: 'Dr. Smith', time: '15 minutes ago' },
                    { action: 'Report submitted', user: 'Jane Student', time: '1 hour ago' },
                    { action: 'User updated profile', user: 'Mike Teacher', time: '2 hours ago' }
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">by {activity.user}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </motion.div>
                  ))}
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
                <Select value={userForm.role} onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value as any }))}>
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
    </div>
  );
}