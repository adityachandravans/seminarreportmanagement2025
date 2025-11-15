"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const topic_model_1 = __importDefault(require("../models/topic.model"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Get all topics (role-aware)
router.get('/', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let topics;
        // Students should only see their own topics
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'student') {
            topics = yield topic_model_1.default.find({ studentId: req.user._id })
                .populate('studentId', 'name email')
                .populate('teacherId', 'name email');
        }
        else {
            // Teachers and admins see all topics
            topics = yield topic_model_1.default.find()
                .populate('studentId', 'name email')
                .populate('teacherId', 'name email');
        }
        res.json(topics);
    }
    catch (error) {
        console.error('Get topics error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Get topics for current student explicitly
router.get('/mine', auth_middleware_1.auth, (0, auth_middleware_1.requireRole)(['student']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const topics = yield topic_model_1.default.find({ studentId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })
            .populate('studentId', 'name email')
            .populate('teacherId', 'name email');
        res.json(topics);
    }
    catch (error) {
        console.error('Get my topics error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Create topic
router.post('/', auth_middleware_1.auth, (0, auth_middleware_1.requireRole)(['student']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description } = req.body;
        // Input validation
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }
        const topic = new topic_model_1.default({
            title,
            description,
            studentId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
        });
        const savedTopic = yield topic.save();
        // Populate the topic with related data
        const populatedTopic = yield topic_model_1.default.findById(savedTopic._id)
            .populate('studentId', 'name email')
            .populate('teacherId', 'name email');
        console.log('✅ Topic saved successfully:', {
            id: savedTopic._id,
            title: savedTopic.title,
            studentId: savedTopic.studentId
        });
        res.status(201).json(populatedTopic);
    }
    catch (error) {
        console.error('Topic creation error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Update topic
router.put('/:id', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { id } = req.params;
        const updates = req.body;
        console.log('📝 Updating topic:', { id, updates, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id, userRole: (_b = req.user) === null || _b === void 0 ? void 0 : _b.role });
        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid topic ID format' });
        }
        const topic = yield topic_model_1.default.findById(id);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        // Check if user has permission to update
        // Teachers and admins can approve/reject, students can only update their own pending topics
        if (((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) === 'teacher' || ((_d = req.user) === null || _d === void 0 ? void 0 : _d.role) === 'admin') {
            // Teachers/admins can update status, feedback, teacherId, reviewedAt
            if (updates.status && ['approved', 'rejected'].includes(updates.status)) {
                // When approving/rejecting, set teacherId if not already set
                if (!updates.teacherId && ((_e = req.user) === null || _e === void 0 ? void 0 : _e.role) === 'teacher') {
                    updates.teacherId = req.user._id;
                }
                // Set reviewedAt if status is being changed
                if (!updates.reviewedAt) {
                    updates.reviewedAt = new Date();
                }
            }
        }
        else if (((_f = req.user) === null || _f === void 0 ? void 0 : _f.role) === 'student') {
            // Students can only update their own pending topics (not status changes)
            if (topic.studentId.toString() !== ((_g = req.user) === null || _g === void 0 ? void 0 : _g._id.toString())) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            // Students cannot change status or other teacher fields
            delete updates.status;
            delete updates.feedback;
            delete updates.teacherId;
            delete updates.reviewedAt;
        }
        else {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const updatedTopic = yield topic_model_1.default.findByIdAndUpdate(id, updates, { new: true })
            .populate('studentId', 'name email')
            .populate('teacherId', 'name email');
        if (updatedTopic) {
            console.log('✅ Topic updated successfully:', updatedTopic._id);
            res.json(updatedTopic);
        }
        else {
            console.warn('⚠ Topic updated but result is null for id:', id);
            res.status(404).json({ message: 'Topic not found after update' });
        }
    }
    catch (error) {
        console.error('✗ Topic update error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Delete topic
router.delete('/:id', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid topic ID format' });
        }
        const topic = yield topic_model_1.default.findById(id);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        // Check if user has permission to delete
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin' &&
            topic.studentId.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        yield topic_model_1.default.findByIdAndDelete(id);
        res.json({ message: 'Topic deleted successfully' });
    }
    catch (error) {
        console.error('Topic deletion error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
exports.default = router;
