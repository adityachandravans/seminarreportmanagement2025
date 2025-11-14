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
// Get all topics
router.get('/', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topics = yield topic_model_1.default.find()
            .populate('studentId', 'name email')
            .populate('teacherId', 'name email');
        res.json(topics);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// Create topic
router.post('/', auth_middleware_1.auth, (0, auth_middleware_1.requireRole)(['student']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description } = req.body;
        const topic = new topic_model_1.default({
            title,
            description,
            studentId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
        });
        yield topic.save();
        res.status(201).json(topic);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// Update topic
router.put('/:id', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const updates = req.body;
        const topic = yield topic_model_1.default.findById(id);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        // Check if user has permission to update
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin' &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'teacher' &&
            topic.studentId.toString() !== ((_c = req.user) === null || _c === void 0 ? void 0 : _c._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const updatedTopic = yield topic_model_1.default.findByIdAndUpdate(id, updates, { new: true });
        res.json(updatedTopic);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// Delete topic
router.delete('/:id', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
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
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = router;
