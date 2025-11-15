import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserDocument } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Please authenticate' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Validate ObjectId format
    if (!decoded.userId || !decoded.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Please authenticate' });
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};