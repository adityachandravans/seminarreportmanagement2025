import mongoose, { Schema, Document } from 'mongoose';
import { Topic } from '../types';

export interface TopicDocument extends Omit<Topic, 'id'>, Document {}

const topicSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  feedback: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<TopicDocument>('Topic', topicSchema);