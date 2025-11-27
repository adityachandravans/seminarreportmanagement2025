// Utility functions to normalize MongoDB documents to frontend format

import { Topic, SeminarReport, User } from '../types';

export const normalizeTopic = (data: any): Topic => {
  if (!data) {
    throw new Error('Cannot normalize null or undefined topic data');
  }
  
  return {
    id: data._id || data.id,
    title: data.title,
    description: data.description,
    studentId: data.studentId && typeof data.studentId === 'object' ? (data.studentId._id || data.studentId.id) : data.studentId,
    teacherId: data.teacherId ? (typeof data.teacherId === 'object' ? (data.teacherId._id || data.teacherId.id) : data.teacherId) : undefined,
    status: data.status || 'pending',
    submittedAt: data.submittedAt ? new Date(data.submittedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    reviewedAt: data.reviewedAt ? new Date(data.reviewedAt).toISOString().split('T')[0] : undefined,
    feedback: data.feedback
  };
};

export const normalizeReport = (data: any): SeminarReport => {
  if (!data) {
    throw new Error('Cannot normalize null or undefined report data');
  }
  
  return {
    id: data._id || data.id,
    title: data.title,
    topicId: data.topicId && typeof data.topicId === 'object' ? (data.topicId._id || data.topicId.id) : data.topicId,
    studentId: data.studentId && typeof data.studentId === 'object' ? (data.studentId._id || data.studentId.id) : data.studentId,
    teacherId: data.teacherId ? (typeof data.teacherId === 'object' ? (data.teacherId._id || data.teacherId.id) : data.teacherId) : undefined,
    fileName: data.fileName,
    fileSize: data.fileSize,
    submittedAt: data.submittedAt ? new Date(data.submittedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: data.status || 'submitted',
    feedback: data.feedback,
    grade: data.grade
  };
};

export const normalizeUser = (data: any): User => {
  return {
    id: data._id || data.id,
    email: data.email,
    password: data.password || '',
    name: data.name,
    role: data.role,
    rollNumber: data.rollNumber,
    department: data.department,
    year: data.year,
    specialization: data.specialization
  };
};
