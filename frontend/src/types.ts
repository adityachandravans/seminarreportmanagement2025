export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  rollNumber?: string;
  department?: string;
  year?: number;
  specialization?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  studentId: string;
  teacherId?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  feedback?: string;
}

export interface SeminarReport {
  id: string;
  title: string;
  topicId: string;
  studentId: string;
  teacherId?: string;
  fileName: string;
  fileSize: string;
  submittedAt: string;
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected';
  feedback?: string;
  grade?: string;
}