import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Topic, SeminarReport } from '../types';
import { topicsAPI, reportsAPI } from '../services/api';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  Search, 
  Eye, 
  MessageSquare,
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  LogOut,
  Star
} from 'lucide-react';

interface TeacherDashboardProps {
  user: User;
  topics: Topic[];
  reports: SeminarReport[];
  students: User[];
  onLogout: () => void;
  onUpdateTopic: (topicId: string, updates: Partial<Topic>) => void;
  onUpdateReport: (reportId: string, updates: Partial<SeminarReport>) => void;
}

export default function TeacherDashboard({ 
  user, 
  topics, 
  reports, 
  students, 
  onLogout, 
  onUpdateTopic, 
  onUpdateReport 
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedReport, setSelectedReport] = useState<SeminarReport | null>(null);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState('');

  const pendingTopics = topics.filter(t => t.status === 'pending');
  // For teachers, show all reports (they can review any submitted report)
  const assignedReports = reports; // Teachers can see all reports
  const pendingReports = assignedReports.filter(r => r.status === 'submitted');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleTopicReview = async (topicId: string, status: 'approved' | 'rejected', feedback?: string) => {
    try {
      if (import.meta.env.DEV) {
        console.log('📝 Reviewing topic:', { topicId, status, feedback });
      }
      const updatedTopic = await topicsAPI.update(topicId, {
        status,
        feedback: feedback || undefined,
        reviewedAt: new Date().toISOString().split('T')[0],
        teacherId: user.id
      });
      if (import.meta.env.DEV) {
        console.log('✅ Topic reviewed successfully:', updatedTopic);
      }
      onUpdateTopic(topicId, updatedTopic);
      setSelectedTopic(null);
      setFeedback('');
    } catch (error: any) {
      console.error('❌ Error reviewing topic:', error);
      alert(error.response?.data?.message || 'Failed to review topic');
    }
  };

  const handleReportReview = async (reportId: string) => {
    try {
      if (!grade || !feedback) {
        alert('Please provide both grade and feedback');
        return;
      }
      if (import.meta.env.DEV) {
        console.log('📝 Reviewing report:', { reportId, feedback, grade });
      }
      const updatedReport = await reportsAPI.update(reportId, {
        status: 'reviewed',
        feedback,
        grade,
        teacherId: user.id
      });
      if (import.meta.env.DEV) {
        console.log('✅ Report reviewed successfully:', updatedReport);
      }
      onUpdateReport(reportId, updatedReport);
      setSelectedReport(null);
      setFeedback('');
      setGrade('');
    } catch (error: any) {
      console.error('❌ Error reviewing report:', error);
      alert(error.response?.data?.message || 'Failed to review report');
    }
  };

  const getStudentInfo = (studentId: string) => {
    // Try to find in students array
    let student = students.find(s => s.id === studentId);
    
    // If not found, try to get from populated topic/report data
    if (!student) {
      const topicWithStudent = topics.find(t => t.studentId === studentId);
      if (topicWithStudent && (topicWithStudent as any).studentId && typeof (topicWithStudent as any).studentId === 'object') {
        const studentData = (topicWithStudent as any).studentId;
        student = {
          id: studentData._id || studentId,
          name: studentData.name || 'Unknown',
          email: studentData.email || '',
          role: 'student' as const,
          password: ''
        };
      }
    }
    
    return student;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Teacher Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="overview">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="topics">
              <BookOpen className="h-4 w-4 mr-2" />
              Topics
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Users className="h-4 w-4 mr-2" />
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
                  { title: 'Pending Topics', value: pendingTopics.length, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
                  { title: 'Pending Reports', value: pendingReports.length, icon: FileText, color: 'from-orange-500 to-orange-600' },
                  { title: 'Total Students', value: students.length, icon: Users, color: 'from-blue-500 to-blue-600' },
                  { title: 'Reviewed Reports', value: assignedReports.filter(r => r.status === 'reviewed').length, icon: CheckCircle, color: 'from-green-500 to-green-600' }
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

              {/* Pending Reviews */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white shadow-lg border-0">
                  <h3 className="text-lg font-semibold mb-4">Pending Topic Reviews</h3>
                  <div className="space-y-3">
                    {pendingTopics.slice(0, 3).map((topic, index) => {
                      const topicStudentId = typeof topic.studentId === 'object' ? (topic.studentId as any)?._id : topic.studentId;
                      const student = getStudentInfo(topicStudentId || topic.studentId);
                      return (
                        <motion.div
                          key={topic.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{topic.title}</p>
                            <p className="text-sm text-muted-foreground">By {student?.name}</p>
                          </div>
                          <Button size="sm" onClick={() => setSelectedTopic(topic)}>
                            Review
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-6 bg-white shadow-lg border-0">
                  <h3 className="text-lg font-semibold mb-4">Pending Report Reviews</h3>
                  <div className="space-y-3">
                    {pendingReports.slice(0, 3).map((report, index) => {
                      const reportStudentId = typeof report.studentId === 'object' ? (report.studentId as any)?._id : report.studentId;
                      const student = getStudentInfo(reportStudentId || report.studentId);
                      return (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{report.title}</p>
                            <p className="text-sm text-muted-foreground">By {student?.name}</p>
                          </div>
                          <Button size="sm" onClick={() => setSelectedReport(report)}>
                            Review
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="topics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Topic Reviews</h2>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {pendingTopics.length} Pending
                </Badge>
              </div>

              <div className="grid gap-4">
                {topics.map((topic, index) => {
                  const topicStudentId = typeof topic.studentId === 'object' ? (topic.studentId as any)?._id : topic.studentId;
                  const student = getStudentInfo(topicStudentId || topic.studentId);
                  // Ensure we have a valid topic ID
                  const topicId = topic.id || (topic as any)?._id;
                  return (
                    <motion.div
                      key={topicId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="p-6 bg-white shadow-lg border-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">{topic.title}</h3>
                              <Badge className={getStatusColor(topic.status)}>
                                {getStatusIcon(topic.status)}
                                <span className="ml-1">{topic.status}</span>
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-2">{topic.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                              <span>Student: {student?.name} ({student?.rollNumber})</span>
                              <span>Submitted: {topic.submittedAt}</span>
                            </div>
                            {topic.feedback && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-900">Your Feedback:</p>
                                <p className="text-sm text-blue-800">{topic.feedback}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {topic.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => await handleTopicReview(topicId, 'approved')}
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedTopic(topic)}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="reports">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Report Reviews</h2>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {pendingReports.length} Pending
                </Badge>
              </div>

              <div className="grid gap-4">
                {assignedReports.map((report, index) => {
                  const reportStudentId = typeof report.studentId === 'object' ? (report.studentId as any)?._id : report.studentId;
                  const student = getStudentInfo(reportStudentId || report.studentId);
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="p-6 bg-white shadow-lg border-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">{report.title}</h3>
                              <Badge className={getStatusColor(report.status)}>
                                {getStatusIcon(report.status)}
                                <span className="ml-1">{report.status}</span>
                              </Badge>
                              {report.grade && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  {report.grade}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                              <span>Student: {student?.name} ({student?.rollNumber})</span>
                              <span>File: {report.fileName}</span>
                              <span>Size: {report.fileSize}</span>
                              <span>Submitted: {report.submittedAt}</span>
                            </div>
                            {report.feedback && (
                              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm font-medium text-green-900">Your Feedback:</p>
                                <p className="text-sm text-green-800">{report.feedback}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
                                try {
                                  const result = await reportsAPI.download(report.id);
                                  // If result is null, it means Cloudinary URL was opened in new tab
                                  if (result) {
                                    const url = window.URL.createObjectURL(result);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = report.fileName;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                  }
                                } catch (error) {
                                  console.error('Error downloading report:', error);
                                  alert('Failed to download report. The file may have been deleted.');
                                }
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            {report.status === 'submitted' && (
                              <Button
                                size="sm"
                                onClick={() => setSelectedReport(report)}
                                className="bg-gradient-to-r from-green-500 to-teal-600 text-white"
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="students">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Student Records</h2>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-80"
                  />
                </div>
              </div>

              <div className="grid gap-4">
                {filteredStudents.map((student, index) => {
                  const studentTopics = topics.filter(t => {
                    const topicStudentId = typeof t.studentId === 'object' ? (t.studentId as any)?._id : t.studentId;
                    return topicStudentId === student.id || String(t.studentId) === String(student.id);
                  });
                  const studentReports = reports.filter(r => {
                    const reportStudentId = typeof r.studentId === 'object' ? (r.studentId as any)?._id : r.studentId;
                    return reportStudentId === student.id || String(r.studentId) === String(student.id);
                  });
                  
                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="p-6 bg-white shadow-lg border-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{student.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                              <span>Roll: {student.rollNumber}</span>
                              <span>Department: {student.department}</span>
                              <span>Year: {student.year}</span>
                              <span>Email: {student.email}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{studentTopics.length}</p>
                                <p className="text-sm text-blue-800">Topics Submitted</p>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">
                                  {studentTopics.filter(t => t.status === 'approved').length}
                                </p>
                                <p className="text-sm text-green-800">Topics Approved</p>
                              </div>
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600">{studentReports.length}</p>
                                <p className="text-sm text-purple-800">Reports Submitted</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6 bg-white shadow-lg border-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-blue-600 font-medium">Faculty Account</span>
                  </div>
                </div>
                
                {/* Personal Information */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
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
                      <Label className="text-sm text-gray-600">Faculty ID</Label>
                      <p className="text-sm font-mono text-gray-500">{user.id || 'Not available'}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Professional Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Label className="text-sm text-blue-600">Department</Label>
                      <p className="text-lg font-medium">{user.department || 'Not provided'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Label className="text-sm text-blue-600">Specialization</Label>
                      <p className="text-lg font-medium">{user.specialization || 'Not provided'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Label className="text-sm text-blue-600">Employee ID</Label>
                      <p className="text-lg font-medium">{user.rollNumber || 'Not provided'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Label className="text-sm text-blue-600">Academic Year</Label>
                      <p className="text-lg font-medium">{user.year ? `${user.year}` : 'Current'}</p>
                    </div>
                  </div>
                </div>

                {/* Teaching Statistics */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Teaching Statistics
                  </h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{topics.length}</p>
                      <Label className="text-sm text-green-600">Total Topics</Label>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{topics.filter(t => t.status === 'approved').length}</p>
                      <Label className="text-sm text-blue-600">Topics Approved</Label>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600">{reports.length}</p>
                      <Label className="text-sm text-purple-600">Reports Reviewed</Label>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-600">{reports.filter(r => r.status === 'reviewed').length}</p>
                      <Label className="text-sm text-orange-600">Reports Graded</Label>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Topic Review Dialog */}
      <Dialog open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Topic: {selectedTopic?.title}</DialogTitle>
          </DialogHeader>
          {selectedTopic && (
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground">{selectedTopic.description}</p>
              </div>
              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback (optional for approval, required for rejection)"
                  rows={4}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={async () => {
                    const topicId = selectedTopic.id || (selectedTopic as any)?._id;
                    await handleTopicReview(topicId, 'approved', feedback || undefined);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={async () => {
                    const topicId = selectedTopic.id || (selectedTopic as any)?._id;
                    await handleTopicReview(topicId, 'rejected', feedback || undefined);
                  }}
                  disabled={!feedback}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Review Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Report: {selectedReport?.title}</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>File Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedReport.fileName}</p>
                </div>
                <div>
                  <Label>File Size</Label>
                  <p className="text-sm text-muted-foreground">{selectedReport.fileSize}</p>
                </div>
              </div>
              <div>
                <Label htmlFor="grade">Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C+">C+</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reportFeedback">Feedback</Label>
                <Textarea
                  id="reportFeedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide detailed feedback on the report"
                  rows={4}
                />
              </div>
              <Button
                onClick={async () => await handleReportReview(selectedReport.id)}
                disabled={!grade || !feedback}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white"
              >
                Submit Review
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}