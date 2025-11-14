import express from 'express';
import Topic from '../models/topic.model';
import { auth, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

// Get all topics
router.get('/', auth, async (req, res) => {
  try {
    const topics = await Topic.find()
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email');
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create topic
router.post('/', auth, requireRole(['student']), async (req, res) => {
  try {
    const { title, description } = req.body;
    const topic = new Topic({
      title,
      description,
      studentId: req.user?._id
    });

    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update topic
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const topic = await Topic.findById(id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Check if user has permission to update
    if (
      req.user?.role !== 'admin' &&
      req.user?.role !== 'teacher' &&
      topic.studentId.toString() !== req.user?._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedTopic = await Topic.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedTopic);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete topic
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
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
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;