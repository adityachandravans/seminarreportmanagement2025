import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Progress } from './ui/progress';
import { 
  Plus, 
  Upload, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  LogOut,
  GraduationCap,
  BookOpen,
  TrendingUp
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  topics: Topic[];
  reports: SeminarReport[];
  onLogout: () => void;
  onSubmitTopic: (topic: Omit<Topic, 'id' | 'studentId' | 'status' | 'submittedAt'>) => void;
  onSubmitReport: (report: Omit<SeminarReport, 'id' | 'studentId' | 'submittedAt' | 'status'>) => void;
}

export default function StudentDashboard({ 
  user, 
  topics: initialTopics, 
  reports: initialReports, 
  onLogout, 
  onSubmitTopic, 
  onSubmitReport 
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [topicForm, setTopicForm] = useState({ title: '', description: '' });
  const [reportForm, setReportForm] = useState({ title: '', topicId: '', file: null as File | null });
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [error, setError] = useState('');

  const [topicsList, setTopicsList] = useState<Topic[]>(initialTopics || []);
  const [reportsList, setReportsList] = useState<SeminarReport[]>(initialReports || []);

  // Fetch student's topics on mount and after submissions
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await topicsAPI.getMine();
        if (mounted) setTopicsList(data || []);
      } catch (err) {
        // ignore - will show empty list
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const userTopics = topicsList.filter(t => {
    const topicStudentId = typeof t.studentId === 'object' && t.studentId ? (t.studentId as any)?._id : t.studentId;
    return String(topicStudentId) === String(user.id) || t.studentId === user.id;
  });
  const userReports = reportsList.filter(r => {
    const reportStudentId = typeof r.studentId === 'object' && r.studentId ? (r.studentId as any)?._id : r.studentId;
    return String(reportStudentId) === String(user.id) || r.studentId === user.id;
  });

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

  const handleTopicSubmit = async () => {
    if (!topicForm.title || !topicForm.description) {
      setError('Please fill in all fields');
      return;
    }
    setIsSubmittingTopic(true);
    setError('');
    try {
      const created = await topicsAPI.create({ title: topicForm.title, description: topicForm.description });
      // Refresh topic list
      try {
        const data = await topicsAPI.getMine();
        setTopicsList(data || []);
      } catch (e) {
        // ignore
      }
      setTopicForm({ title: '', description: '' });
      // call callback if parent wants to know
      onSubmitTopic && onSubmitTopic(topicForm);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit topic');
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportForm.title || !reportForm.topicId || !reportForm.file) {
      setError('Please fill in all fields and select a file');
      return;
    }

    // Validate file type
    const fileExtension = reportForm.file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please upload PDF, DOC, or DOCX files only.');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (reportForm.file.size > maxSize) {
      setError('File size too large. Maximum size is 10MB.');
      return;
    }

    setIsSubmittingReport(true);
    setError('');
    
    try {
      console.log('📤 Uploading report:', { 
        title: reportForm.title, 
        topicId: reportForm.topicId, 
        fileName: reportForm.file.name,
        fileSize: reportForm.file.size 
      });
      
      const newReport = await reportsAPI.create({
        title: reportForm.title,
        topicId: reportForm.topicId,
        file: reportForm.file
      });
      
      console.log('✅ Report uploaded successfully:', newReport);
      
      onSubmitReport({
        title: reportForm.title,
        topicId: reportForm.topicId,
        fileName: reportForm.file.name,
        fileSize: (reportForm.file.size / 1024 / 1024).toFixed(2) + ' MB',
        feedback: undefined,
        grade: undefined
      });
      
      setReportForm({ title: '', topicId: '', file: null });
    } catch (err: any) {
      console.error('❌ Error uploading report:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const approvedTopics = userTopics.filter(t => t.status === 'approved');
  const pendingTopics = userTopics.filter(t => t.status === 'pending');
  const completedReports = userReports.filter(r => r.status === 'reviewed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Student Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user.name}</p>
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
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Topics</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span>Profile</span>
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
                  { title: 'Total Topics', value: userTopics.length, icon: BookOpen, color: 'from-blue-500 to-blue-600' },
                  { title: 'Approved Topics', value: approvedTopics.length, icon: CheckCircle, color: 'from-green-500 to-green-600' },
                  { title: 'Pending Topics', value: pendingTopics.length, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
                  { title: 'Completed Reports', value: completedReports.length, icon: FileText, color: 'from-purple-500 to-purple-600' }
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

              {/* Recent Activity */}
              <Card className="p-6 bg-white shadow-lg border-0">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {userTopics.slice(0, 3).map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(topic.status)}
                        <div>
                          <p className="font-medium">{topic.title}</p>
                          <p className="text-sm text-muted-foreground">Submitted on {topic.submittedAt}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(topic.status || 'pending')}>
                        {(topic.status || 'pending').toUpperCase()}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="topics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Seminar Topics</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit New Topic
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Submit Seminar Topic</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
                        >
                          {error}
                        </motion.div>
                      )}
                      <div>
                        <Label htmlFor="title">Topic Title</Label>
                        <Input
                          id="title"
                          value={topicForm.title}
                          onChange={(e) => setTopicForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter topic title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={topicForm.description}
                          onChange={(e) => setTopicForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Provide a detailed description of your topic"
                          rows={4}
                        />
                      </div>
                      <Button
                        onClick={handleTopicSubmit}
                        disabled={isSubmittingTopic || !topicForm.title || !topicForm.description}
                        className="w-full"
                      >
                        {isSubmittingTopic ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                        ) : null}
                        Submit Topic
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {userTopics.map((topic, index) => (
                  <motion.div
                    key={topic.id}
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
                            <Badge className={getStatusColor(topic.status || 'pending')}>
                              {getStatusIcon(topic.status || 'pending')}
                              <span className="ml-1 capitalize">{(topic.status || 'pending').toUpperCase()}</span>
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{topic.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Submitted: {topic.submittedAt}</span>
                            {topic.reviewedAt && <span>Reviewed: {topic.reviewedAt}</span>}
                          </div>
                          {topic.feedback && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-900">Feedback:</p>
                              <p className="text-sm text-blue-800">{topic.feedback}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
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
                <h2 className="text-2xl font-bold">Seminar Reports</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-gradient-to-r from-green-500 to-teal-600 text-white"
                      disabled={approvedTopics.length === 0}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Upload Seminar Report</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
                        >
                          {error}
                        </motion.div>
                      )}
                      <div>
                        <Label htmlFor="reportTitle">Report Title</Label>
                        <Input
                          id="reportTitle"
                          value={reportForm.title}
                          onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter report title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="topicSelect">Select Topic</Label>
                        <select
                          id="topicSelect"
                          value={reportForm.topicId}
                          onChange={(e) => setReportForm(prev => ({ ...prev, topicId: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                        >
                          <option value="">Select an approved topic</option>
                          {approvedTopics.map(topic => (
                            <option key={topic.id} value={topic.id}>{topic.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="fileInput">Upload File (PDF, DOC, DOCX)</Label>
                        <Input
                          id="fileInput"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setReportForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                          className="w-full"
                        />
                        {reportForm.file && (
                          <p className="mt-2 text-sm text-gray-600">
                            Selected: {reportForm.file.name} ({(reportForm.file.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={handleReportSubmit}
                        disabled={isSubmittingReport || !reportForm.title || !reportForm.topicId || !reportForm.file}
                        className="w-full"
                      >
                        {isSubmittingReport ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                        ) : null}
                        Upload Report
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {userReports.map((report, index) => (
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
                                Grade: {report.grade}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                            <span>File: {report.fileName}</span>
                            <span>Size: {report.fileSize}</span>
                            <span>Submitted: {report.submittedAt}</span>
                          </div>
                          {report.feedback && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                              <p className="text-sm font-medium text-green-900">Feedback:</p>
                              <p className="text-sm text-green-800">{report.feedback}</p>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              const blob = await reportsAPI.download(report.id);
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = report.fileName;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            } catch (error) {
                              console.error('Error downloading report:', error);
                              alert('Failed to download report');
                            }
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
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
                <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <p className="text-lg">{user.name}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <Label>Roll Number</Label>
                    <p className="text-lg">{user.rollNumber}</p>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <p className="text-lg">{user.department}</p>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <p className="text-lg">{user.year} Year</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white shadow-lg border-0">
                <h3 className="text-lg font-semibold mb-4">Academic Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Topics Approved</span>
                      <span>{approvedTopics.length}/{userTopics.length}</span>
                    </div>
                    <Progress value={(approvedTopics.length / Math.max(userTopics.length, 1)) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Reports Completed</span>
                      <span>{completedReports.length}/{approvedTopics.length}</span>
                    </div>
                    <Progress value={(completedReports.length / Math.max(approvedTopics.length, 1)) * 100} />
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}