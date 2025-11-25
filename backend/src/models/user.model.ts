import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../types';

export interface UserDocument extends Omit<User, 'id'>, Document {}

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
  rollNumber: { type: String },
  department: { type: String },
  year: { type: Number },
  specialization: { type: String },
  // Email verification fields
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationOTP: { type: String },
  emailVerificationOTPExpires: { type: Date },
  emailVerificationAttempts: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<UserDocument>('User', userSchema);