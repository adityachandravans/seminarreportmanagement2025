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
const user_model_1 = __importDefault(require("../models/user.model"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Get all users (admin only)
router.get('/', auth_middleware_1.auth, (0, auth_middleware_1.requireRole)(['admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.default.find().select('-password');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// Update user
router.put('/:id', auth_middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const updates = req.body;
        // Don't allow role updates unless admin
        if (updates.role && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to change roles' });
        }
        // Only allow users to update their own profile unless admin
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin' && id !== ((_c = req.user) === null || _c === void 0 ? void 0 : _c._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const user = yield user_model_1.default.findByIdAndUpdate(id, updates, {
            new: true,
            select: '-password'
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// Delete user (admin only)
router.delete('/:id', auth_middleware_1.auth, (0, auth_middleware_1.requireRole)(['admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield user_model_1.default.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        yield user_model_1.default.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = router;
