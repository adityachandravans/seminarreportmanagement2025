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
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const report_model_1 = __importDefault(require("../models/report.model"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Configure multer for file upload
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.resolve(process.cwd(), 'uploads', 'reports');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
// Get all reports
router.get('/', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reports = yield report_model_1.default.find()
            .populate('studentId', 'name email')
            .populate('teacherId', 'name email')
            .populate('topicId');
        res.json(reports);
    }
    catch (error) {
        console.error('Get reports error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Submit report
router.post('/', auth_middleware_1.auth, (0, auth_middleware_1.requireRole)(['student']), (req, res, next) => {
    console.log('📥 POST /api/reports - Starting file upload');
    console.log('📥 Content-Type:', req.headers['content-type']);
    console.log('📥 Request body keys:', Object.keys(req.body));
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
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
}, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const report = new report_model_1.default({
            title,
            topicId,
            studentId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            fileName: req.file.filename,
            fileSize: String(req.file.size)
        });
        const savedReport = yield report.save();
        // Populate the report with related data
        const populatedReport = yield report_model_1.default.findById(savedReport._id)
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
    }
    catch (error) {
        console.error('✗ Report submission error:', error.message);
        console.error('✗ Error stack:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Update report
router.put('/:id', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { id } = req.params;
        const updates = req.body;
        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid report ID format' });
        }
        const report = yield report_model_1.default.findById(id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        // Check if user has permission to update
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin' &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'teacher' &&
            report.studentId.toString() !== ((_c = req.user) === null || _c === void 0 ? void 0 : _c._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        // If teacher is reviewing, set teacherId if not already set
        if ((updates.status === 'reviewed' || updates.status === 'approved') && ((_d = req.user) === null || _d === void 0 ? void 0 : _d.role) === 'teacher' && !updates.teacherId) {
            updates.teacherId = req.user._id;
        }
        const updatedReport = yield report_model_1.default.findByIdAndUpdate(id, updates, { new: true })
            .populate('studentId', 'name email')
            .populate('teacherId', 'name email')
            .populate('topicId');
        console.log('✅ Report updated successfully:', {
            id: updatedReport === null || updatedReport === void 0 ? void 0 : updatedReport._id,
            status: updatedReport === null || updatedReport === void 0 ? void 0 : updatedReport.status,
            grade: updatedReport === null || updatedReport === void 0 ? void 0 : updatedReport.grade
        });
        res.json(updatedReport);
    }
    catch (error) {
        console.error('Report update error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Download report
router.get('/:id/download', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid report ID format' });
        }
        const report = yield report_model_1.default.findById(id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        const filePath = path_1.default.resolve(process.cwd(), 'uploads', 'reports', report.fileName);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }
        res.download(filePath);
    }
    catch (error) {
        console.error('Download error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
// Delete report
router.delete('/:id', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid report ID format' });
        }
        const report = yield report_model_1.default.findById(id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        // Check if user has permission to delete
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin' &&
            report.studentId.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        // Delete file from storage
        const filePath = path_1.default.resolve(process.cwd(), 'uploads', 'reports', report.fileName);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        yield report_model_1.default.findByIdAndDelete(id);
        res.json({ message: 'Report deleted successfully' });
    }
    catch (error) {
        console.error('Report deletion error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
exports.default = router;
