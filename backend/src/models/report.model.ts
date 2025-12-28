import mongoose, { Schema, Document } from 'mongoose';
import { SeminarReport } from '../types';

export interface ReportDocument extends Omit<SeminarReport, 'id'>, Document {}

const reportSchema = new Schema({
  title: { type: String, required: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
  fileName: { type: String, required: true },
  fileUrl: { type: String }, // Cloudinary URL for cloud storage
  fileSize: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['submitted', 'reviewed', 'approved', 'rejected'],
    default: 'submitted'
  },
  feedback: { type: String },
  grade: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<ReportDocument>('Report', reportSchema);