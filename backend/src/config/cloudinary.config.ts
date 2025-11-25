import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

/**
 * Cloudinary Configuration for Cloud File Storage
 * Replace local file storage with cloud storage
 */

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage for Multer
export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Generate unique filename
    const timestamp = Date.now();
    const userId = (req as any).user?._id || 'unknown';
    const originalName = file.originalname.replace(/\s+/g, '_');
    
    return {
      folder: 'seminar-reports', // Cloudinary folder
      format: 'pdf', // Force PDF format
      public_id: `${userId}_${timestamp}_${originalName}`,
      resource_type: 'raw' as const, // For non-image files
      allowed_formats: ['pdf', 'doc', 'docx'],
    };
  },
});

// Create Multer upload instance with Cloudinary
export const cloudinaryUpload = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  },
});

// Utility functions
export const cloudinaryUtils = {
  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<boolean> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      console.log('✅ File deleted from Cloudinary:', publicId);
      return true;
    } catch (error: any) {
      console.error('❌ Cloudinary delete error:', error.message);
      return false;
    }
  },

  /**
   * Get file URL
   */
  getFileUrl(publicId: string): string {
    return cloudinary.url(publicId, { resource_type: 'raw' });
  },

  /**
   * Get secure file URL
   */
  getSecureFileUrl(publicId: string): string {
    return cloudinary.url(publicId, { 
      resource_type: 'raw',
      secure: true,
    });
  },

  /**
   * Extract public ID from Cloudinary URL
   */
  extractPublicId(url: string): string | null {
    const match = url.match(/\/v\d+\/(.+)\.\w+$/);
    return match ? match[1] : null;
  },
};

// Verify Cloudinary configuration
export const verifyCloudinaryConfig = (): boolean => {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Cloudinary not configured. Missing:', missing.join(', '));
    console.warn('⚠️  Using local file storage instead');
    return false;
  }
  
  console.log('✅ Cloudinary configured successfully');
  return true;
};

export default cloudinary;
