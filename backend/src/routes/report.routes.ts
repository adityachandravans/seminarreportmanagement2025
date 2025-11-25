import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Report from '../models/report.model';
import { auth, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(process.cwd(), 'uploads', 'reports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type') as any);
    }
  }
});

// Get all reports
router.get('/', auth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email')
      .populate('topicId');
    res.json(reports);
  } catch (error: any) {
    console.error('Get reports error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit report
router.post('/', auth, requireRole(['student']), (req, res, next) => {
  console.log('📥 POST /api/reports - Starting file upload');
  console.log('📥 Content-Type:', req.headers['content-type']);
  console.log('📥 Request body keys:', Object.keys(req.body));
  
  upload.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      console.log('❌ Multer error:', err.code, err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 10MB' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    if (err) {
      console.log('❌ Upload error:', err.message);
      return res.status(400).json({ message: err.message || 'File upload error' });
    }
    console.log('✅ Multer middleware completed');
    console.log('✅ req.file exists:', !!req.file);
    next();
  });
}, async (req, res) => {
  try {
    console.log('📥 Report upload request received:', {
      body: req.body,
      file: req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : null,
      user: req.user ? { id: req.user._id, email: req.user.email } : null
    });

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, topicId } = req.body;

    // Input validation
    if (!title || !topicId) {
      console.log('❌ Missing required fields:', { title: !!title, topicId: !!topicId });
      return res.status(400).json({ message: 'Title and topicId are required' });
    }

    // Validate ObjectId
    console.log('🔍 Validating topicId:', { topicId, length: topicId.length, type: typeof topicId });
    if (!topicId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ Invalid topicId format:', topicId);
      return res.status(400).json({ message: `Invalid topicId format: ${topicId}. Expected 24-character hex string.` });
    }

    const report = new Report({
      title,
      topicId,
      studentId: req.user?._id,
      fileName: req.file.filename,
      fileSize: String(req.file.size)
    });

    const savedReport = await report.save();
    
    // Populate the report with related data
    const populatedReport = await Report.findById(savedReport._id)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email')
      .populate('topicId');
    
    console.log('✅ Report saved successfully:', {
      id: savedReport._id,
      title: savedReport.title,
      fileName: savedReport.fileName,
      studentId: savedReport.studentId
    });
    
    res.status(201).json(populatedReport);
  } catch (error: any) {
    console.error('✗ Report submission error:', error.message);
    console.error('✗ Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update report
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid report ID format' });
    }
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user has permission to update
    if (
      req.user?.role !== 'admin' &&
      req.user?.role !== 'teacher' &&
      report.studentId.toString() !== req.user?._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // If teacher is reviewing, set teacherId if not already set
    if ((updates.status === 'reviewed' || updates.status === 'approved') && req.user?.role === 'teacher' && !updates.teacherId) {
      updates.teacherId = req.user._id;
    }

    const updatedReport = await Report.findByIdAndUpdate(id, updates, { new: true })
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email')
      .populate('topicId');
    
    console.log('✅ Report updated successfully:', {
      id: updatedReport?._id,
      status: updatedReport?.status,
      grade: updatedReport?.grade
    });
    
    res.json(updatedReport);
  } catch (error: any) {
    console.error('Report update error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download report
router.get('/:id/download', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid report ID format' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const filePath = path.resolve(process.cwd(), 'uploads', 'reports', report.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath);
  } catch (error: any) {
    console.error('Download error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete report
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid report ID format' });
    }

    const report = await Report.findById(id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user has permission to delete
    if (
      req.user?.role !== 'admin' &&
      report.studentId.toString() !== req.user?._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete file from storage
    const filePath = path.resolve(process.cwd(), 'uploads', 'reports', report.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Report.findByIdAndDelete(id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error: any) {
    console.error('Report deletion error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;