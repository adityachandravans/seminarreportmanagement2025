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
        const uploadDir = 'uploads/reports';
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
        res.status(500).json({ message: 'Server error' });
    }
}));
// Submit report
router.post('/', auth_middleware_1.auth, (0, auth_middleware_1.requireRole)(['student']), upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { title, topicId } = req.body;
        const report = new report_model_1.default({
            title,
            topicId,
            studentId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            fileName: req.file.filename,
            fileSize: req.file.size
        });
        yield report.save();
        res.status(201).json(report);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// Update report
router.put('/:id', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const updates = req.body;
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
        const updatedReport = yield report_model_1.default.findByIdAndUpdate(id, updates, { new: true });
        res.json(updatedReport);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// Download report
router.get('/:id/download', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const report = yield report_model_1.default.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        const filePath = path_1.default.join(__dirname, '../../uploads/reports', report.fileName);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }
        res.download(filePath);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// Delete report
router.delete('/:id', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
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
        const filePath = path_1.default.join(__dirname, '../../uploads/reports', report.fileName);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        yield report_model_1.default.findByIdAndDelete(id);
        res.json({ message: 'Report deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = router;
