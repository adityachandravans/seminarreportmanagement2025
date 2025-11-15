import express from 'express';
import Topic from '../models/topic.model';
import { auth, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

// Get all topics (role-aware)
router.get('/', auth, async (req, res) => {
  try {
    let topics;
    // Students should only see their own topics
    if (req.user?.role === 'student') {
      topics = await Topic.find({ studentId: req.user._id })
        .populate('studentId', 'name email')
        .populate('teacherId', 'name email');
    } else {
      // Teachers and admins see all topics
      topics = await Topic.find()
        .populate('studentId', 'name email')
        .populate('teacherId', 'name email');
    }
    res.json(topics);
  } catch (error: any) {
    console.error('Get topics error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get topics for current student explicitly
router.get('/mine', auth, requireRole(['student']), async (req, res) => {
  try {
    const topics = await Topic.find({ studentId: req.user?._id })
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email');
    res.json(topics);
  } catch (error: any) {
    console.error('Get my topics error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create topic
router.post('/', auth, requireRole(['student']), async (req, res) => {
  try {
    const { title, description } = req.body;

    // Input validation
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const topic = new Topic({
      title,
      description,
      studentId: req.user?._id
    });

    const savedTopic = await topic.save();
    
    // Populate the topic with related data
    const populatedTopic = await Topic.findById(savedTopic._id)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email');
    
    console.log('✅ Topic saved successfully:', {
      id: savedTopic._id,
      title: savedTopic.title,
      studentId: savedTopic.studentId
    });
    
    res.status(201).json(populatedTopic);
  } catch (error: any) {
    console.error('Topic creation error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update topic
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('📝 Updating topic:', { id, updates, userId: req.user?._id, userRole: req.user?.role });

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid topic ID format' });
    }
    
    const topic = await Topic.findById(id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Check if user has permission to update
    // Teachers and admins can approve/reject, students can only update their own pending topics
    if (req.user?.role === 'teacher' || req.user?.role === 'admin') {
      // Teachers/admins can update status, feedback, teacherId, reviewedAt
      if (updates.status && ['approved', 'rejected'].includes(updates.status)) {
        // When approving/rejecting, set teacherId if not already set
        if (!updates.teacherId && req.user?.role === 'teacher') {
          updates.teacherId = req.user._id;
        }
        // Set reviewedAt if status is being changed
        if (!updates.reviewedAt) {
          updates.reviewedAt = new Date();
        }
      }
    } else if (req.user?.role === 'student') {
      // Students can only update their own pending topics (not status changes)
      if (topic.studentId.toString() !== req.user?._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      // Students cannot change status or other teacher fields
      delete updates.status;
      delete updates.feedback;
      delete updates.teacherId;
      delete updates.reviewedAt;
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedTopic = await Topic.findByIdAndUpdate(id, updates, { new: true })
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email');
    
    if (updatedTopic) {
      console.log('✅ Topic updated successfully:', updatedTopic._id);
      res.json(updatedTopic);
    } else {
      console.warn('⚠ Topic updated but result is null for id:', id);
      res.status(404).json({ message: 'Topic not found after update' });
    }
  } catch (error: any) {
    console.error('✗ Topic update error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete topic
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid topic ID format' });
    }

    const topic = await Topic.findById(id);
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Check if user has permission to delete
    if (
      req.user?.role !== 'admin' &&
      topic.studentId.toString() !== req.user?._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Topic.findByIdAndDelete(id);
    res.json({ message: 'Topic deleted successfully' });
  } catch (error: any) {
    console.error('Topic deletion error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;