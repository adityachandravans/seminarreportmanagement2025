import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Topic, SeminarReport } from '../types';
import { topicsAPI, reportsAPI } from '../services/api';
import { normalizeTopic, normalizeReport } from '../utils/normalize';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Clear error when dialogs open
  const handleDialogOpen = (dialogType: 'topic' | 'report') => {
    setError('');
    if (dialogType === 'topic') {
      setIsDialogOpen(true);
    } else {
      setIsReportDialogOpen(true);
    }
  };

  const [topicsList, setTopicsList] = useState<Topic[]>(initialTopics || []);
  const [reportsList, setReportsList] = useState<SeminarReport[]>(initialReports || []);
  const [rawTopicsData, setRawTopicsData] = useState<any[]>([]);

  // Fetch student's topics and reports on mount
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        // Load topics
        const topicsData = await topicsAPI.getMine();
        if (mounted && topicsData) {
          console.log('🔍 Raw topics data from API:', topicsData);
          const rawArray = Array.isArray(topicsData) ? topicsData : [];
          setRawTopicsData(rawArray); // Store raw data for ObjectId lookup
          const normalized = rawArray.map(normalizeTopic);
          console.log('🔍 Normalized topics:', normalized);
          setTopicsList(normalized);
        }
        
        // Load reports
        const reportsData = await reportsAPI.getAll();
        if (mounted && reportsData) {
          const normalized = Array.isArray(reportsData) ? reportsData.map(normalizeReport) : [];
          // Filter to only show current user's reports
          const userReports = normalized.filter(r => String(r.studentId) === String(user.id));
          setReportsList(userReports);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [user.id]);

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
      const normalized = normalizeTopic(created);
      
      // Add to local list immediately
      setTopicsList(prev => [...prev, normalized]);
      
      // Clear form
      setTopicForm({ title: '', description: '' });
      
      // Close dialog
      setIsDialogOpen(false);
      
      // Show success message
      alert('Topic submitted successfully! Waiting for teacher approval.');
      
      // Call parent callback if provided
      if (onSubmitTopic) {
        onSubmitTopic(topicForm);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to submit topic';
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportForm.title || !reportForm.topicId || !reportForm.file) {
      setError('Please fill in all fields and select a file');
      return;
    }

    // Validate topicId is selected
    if (reportForm.topicId === '') {
      setError('Please select an approved topic');
      return;
    }

    // Validate file type
    const fileExtension = reportForm.file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please upload PDF, DOC, or DOCX files only.');
      return;
    }

    // Validate file name
    if (reportForm.file.name.length > 255) {
      setError('File name is too long. Please rename the file to be shorter.');
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
      // Validate that topicId exists in approved topics
      const selectedTopic = approvedTopics.find(t => t.id === reportForm.topicId);
      if (!selectedTopic) {
        setError('Selected topic is not valid. Please select a valid approved topic.');
        return;
      }

      // Find the original MongoDB ObjectId from raw data
      const rawTopic = rawTopicsData.find(t => (t._id || t.id) === reportForm.topicId);
      const mongoTopicId = rawTopic?._id || reportForm.topicId;
      
      console.log('🔍 Topic ID mapping:', {
        selectedTopicId: reportForm.topicId,
        rawTopicId: rawTopic?._id,
        finalTopicId: mongoTopicId
      });

      console.log('📤 Uploading report:', { 
        title: reportForm.title, 
        originalTopicId: reportForm.topicId, 
        finalTopicId: mongoTopicId,
        fileName: reportForm.file.name,
        fileSize: reportForm.file.size,
        fileType: reportForm.file.type,
        topicIdLength: mongoTopicId.length,
        topicIdType: typeof mongoTopicId,
        selectedTopic: selectedTopic
      });

      // Test backend connectivity first
      console.log('🔗 Testing backend connectivity...');
      try {
        const healthResponse = await fetch('http://localhost:5000/health');
        console.log('✅ Backend health check:', healthResponse.status);
      } catch (healthErr) {
        console.error('❌ Backend not reachable:', healthErr);
        throw new Error('Backend server is not reachable. Please ensure it is running on http://localhost:5000');
      }

      // Check authentication
      const authToken = localStorage.getItem('authToken');
      console.log('🔐 Auth token present:', !!authToken);
      console.log('🔐 Auth token length:', authToken?.length || 0);
      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Test reports API endpoint
      console.log('🧪 Testing reports API endpoint...');
      try {
        const testResponse = await fetch('http://localhost:5000/api/reports', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Reports API test:', testResponse.status);
        if (!testResponse.ok) {
          console.error('❌ Reports API error:', await testResponse.text());
        }
      } catch (apiErr) {
        console.error('❌ Reports API not reachable:', apiErr);
      }
      
      // Final validation before upload
      if (!reportForm.file) {
        throw new Error('No file selected. Please select a file to upload.');
      }

      if (!(reportForm.file instanceof File)) {
        throw new Error('Invalid file object. Please select a file again.');
      }

      console.log('📁 File details before upload:', {
        file: reportForm.file,
        name: reportForm.file.name,
        size: reportForm.file.size,
        type: reportForm.file.type,
        lastModified: reportForm.file.lastModified,
        isFile: reportForm.file instanceof File,
        constructor: reportForm.file.constructor.name
      });

      // Additional file validation
      if (reportForm.file.size === 0) {
        throw new Error('Selected file is empty. Please select a valid file.');
      }

      if (reportForm.file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit.');
      }

      const newReport = await reportsAPI.create({
        title: reportForm.title,
        topicId: mongoTopicId,
        file: reportForm.file
      });
      
      console.log('✅ Report uploaded successfully:', newReport);
      
      // Normalize and add to local list
      const normalizedReport = normalizeReport(newReport);
      setReportsList(prev => [...prev, normalizedReport]);
      
      // Clear form and file input
      setReportForm({ title: '', topicId: '', file: null });
      
      // Clear the file input element
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Close dialog
      setIsReportDialogOpen(false);
      
      // Show success message
      alert('Report uploaded successfully! Your teacher will review it soon.');
      
      // Call parent callback if provided
      if (onSubmitReport) {
        onSubmitReport({
          title: reportForm.title,
          topicId: reportForm.topicId,
          fileName: reportForm.file.name,
          fileSize: (reportForm.file.size / 1024 / 1024).toFixed(2) + ' MB',
          feedback: undefined,
          grade: undefined
        });
      }
    } catch (err: any) {
      console.error('❌ Error uploading report:', err);
      console.error('❌ Error type:', typeof err);
      console.error('❌ Error name:', err.name);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error request:', err.request);
      console.error('❌ Error config:', err.config);
      
      let errorMessage = 'Failed to upload report';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        console.error('❌ Backend error message:', errorMessage);
      } else if (err.request) {
        // Network error - request was made but no response received
        console.error('❌ Network error - no response received');
        errorMessage = 'Network error. Please check your connection and backend server.';
      } else if (err.code === 'ERR_NETWORK') {
        // Network connection error
        console.error('❌ Network connection error');
        errorMessage = 'Cannot connect to server. Please check if the backend is running on http://localhost:5000';
      } else {
        // Other error
        console.error('❌ Other error type');
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
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
                      key={`recent-topic-${topic.id}-${index}`}
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
                <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => open ? handleDialogOpen('topic') : setIsDialogOpen(false)}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit New Topic
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Submit Seminar Topic</DialogTitle>
                      <DialogDescription>
                        Fill in the form to submit a new seminar topic for approval
                      </DialogDescription>
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

              {userTopics.length === 0 ? (
                <Card className="p-12 bg-white shadow-lg border-0 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Topics Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any seminar topics yet. Click the button above to submit your first topic!
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {userTopics.map((topic, index) => (
                  <motion.div
                    key={`topic-${topic.id}-${index}`}
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
              )}
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
                <Dialog open={isReportDialogOpen} onOpenChange={(open: boolean) => open ? handleDialogOpen('report') : setIsReportDialogOpen(false)}>
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
                      <DialogDescription>
                        Upload your seminar report for an approved topic
                      </DialogDescription>
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
                        <Label htmlFor="topicSelect">Select Topic *</Label>
                        {approvedTopics.length === 0 ? (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                            No approved topics available. Please submit and get a topic approved first.
                          </div>
                        ) : (
                          <Select 
                            value={reportForm.topicId} 
                            onValueChange={(value: string) => setReportForm(prev => ({ ...prev, topicId: value }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an approved topic" />
                            </SelectTrigger>
                            <SelectContent>
                              {approvedTopics.map((topic, index) => (
                                <SelectItem key={`approved-topic-${topic.id}-${index}`} value={topic.id}>
                                  {topic.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="fileInput">Upload File (PDF, DOC, DOCX)</Label>
                        <Input
                          id="fileInput"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            console.log('📁 File input changed:', e.target.files);
                            const file = e.target.files?.[0] || null;
                            
                            if (file) {
                              console.log('📁 Selected file:', {
                                name: file.name,
                                size: file.size,
                                type: file.type,
                                lastModified: file.lastModified,
                                isFile: file instanceof File
                              });
                              
                              // Validate file type
                              const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                              const fileExtension = file.name.split('.').pop()?.toLowerCase();
                              const allowedExtensions = ['pdf', 'doc', 'docx'];
                              
                              if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
                                setError('Invalid file type. Please upload PDF, DOC, or DOCX files only.');
                                e.target.value = '';
                                return;
                              }
                              
                              // Validate file size (10MB max)
                              if (file.size > 10 * 1024 * 1024) {
                                setError('File size too large. Maximum size is 10MB.');
                                e.target.value = '';
                                return;
                              }
                              
                              setError(''); // Clear any previous errors
                            } else {
                              console.log('📁 No file selected');
                            }
                            
                            setReportForm(prev => ({ ...prev, file }));
                            console.log('📁 Updated reportForm.file:', file);
                          }}
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

              {userReports.length === 0 ? (
                <Card className="p-12 bg-white shadow-lg border-0 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {approvedTopics.length === 0 
                      ? "You need to have an approved topic before you can upload a report."
                      : "You haven't uploaded any reports yet. Click the button above to upload your first report!"}
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {userReports.map((report, index) => (
                  <motion.div
                    key={`report-${report.id}-${index}`}
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
              )}
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
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">Student Account</span>
                  </div>
                </div>
                
                {/* Personal Information */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" />
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
                      <Label className="text-sm text-gray-600">Account ID</Label>
                      <p className="text-sm font-mono text-gray-500">{user.id || 'Not available'}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Academic Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Label className="text-sm text-blue-600">Roll Number</Label>
                      <p className="text-lg font-medium">{user.rollNumber || 'Not provided'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Label className="text-sm text-blue-600">Department</Label>
                      <p className="text-lg font-medium">{user.department || 'Not provided'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Label className="text-sm text-blue-600">Academic Year</Label>
                      <p className="text-lg font-medium">{user.year ? `${user.year} Year` : 'Not provided'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Label className="text-sm text-blue-600">Specialization</Label>
                      <p className="text-lg font-medium">{user.specialization || 'General'}</p>
                    </div>
                  </div>
                </div>

                {/* Account Statistics */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Account Statistics
                  </h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{userTopics.length}</p>
                      <Label className="text-sm text-green-600">Topics Submitted</Label>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{approvedTopics.length}</p>
                      <Label className="text-sm text-blue-600">Topics Approved</Label>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600">{userReports.length}</p>
                      <Label className="text-sm text-purple-600">Reports Uploaded</Label>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-600">{completedReports.length}</p>
                      <Label className="text-sm text-orange-600">Reports Reviewed</Label>
                    </div>
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