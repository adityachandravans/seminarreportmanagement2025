import express from 'express';
import User from '../models/user.model';
import { auth, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

// Get all users (admin only) or students (teacher can access)
router.get('/', auth, async (req, res) => {
  try {
    // Teachers can get students, admins can get all users
    if (req.user?.role === 'teacher') {
      const students = await User.find({ role: 'student' }).select('-password');
      res.json(students);
    } else if (req.user?.role === 'admin') {
      const users = await User.find().select('-password');
      res.json(users);
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
  } catch (error: any) {
    console.error('Get users error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    // Don't allow role updates unless admin
    if (updates.role && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to change roles' });
    }

    // Only allow users to update their own profile unless admin
    if (req.user?.role !== 'admin' && id !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findByIdAndUpdate(id, updates, { 
      new: true,
      select: '-password'
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('User update error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('User deletion error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;