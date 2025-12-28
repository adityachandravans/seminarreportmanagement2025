import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get API URL from environment variable or use default
const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:5000/api';

// Only log in development
if ((import.meta as any).env?.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90 seconds timeout for Render cold starts
});

// Add JWT token to every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('❌ Request error:', error);
  return Promise.reject(error);
});

// Handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status! >= 500) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response?.status}`, error.response?.data);
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'teacher' | 'admin';
    rollNumber?: string;
    department?: string;
    year?: number;
    specialization?: string;
  }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string, role?: string) => {
    const response = await apiClient.post('/auth/login', { email, password, role });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  verifyOTP: async (userId: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-otp', { userId, otp });
    return response.data;
  },

  resendOTP: async (userId: string) => {
    const response = await apiClient.post('/auth/resend-otp', { userId });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyResetOTP: async (resetId: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-reset-otp', { resetId, otp });
    return response.data;
  },

  resetPassword: async (resetId: string, otp: string, newPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', { resetId, otp, newPassword });
    return response.data;
  },

  resendResetOTP: async (resetId: string) => {
    const response = await apiClient.post('/auth/resend-reset-otp', { resetId });
    return response.data;
  },
};

// Topic endpoints
export const topicsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/topics');
    return response.data;
  },
  getMine: async () => {
    const response = await apiClient.get('/topics/mine');
    return response.data;
  },

  create: async (data: { title: string; description: string }) => {
    const response = await apiClient.post('/topics', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/topics/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/topics/${id}`);
    return response.data;
  },
};

// Report endpoints
export const reportsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/reports');
    return response.data;
  },

  create: async (data: { title: string; topicId: string; file: File }) => {
    console.log('📦 Creating FormData with:', {
      title: data.title,
      topicId: data.topicId,
      file: data.file,
      fileName: data.file?.name,
      fileSize: data.file?.size,
      fileType: data.file?.type,
      fileIsValid: data.file instanceof File
    });

    // Validate file exists and is valid
    if (!data.file || !(data.file instanceof File)) {
      throw new Error('Invalid file object provided');
    }

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('topicId', data.topicId);
    formData.append('file', data.file, data.file.name);
    
    // Log FormData contents
    console.log('📦 FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File { name: "${value.name}", size: ${value.size}, type: "${value.type}" }`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }
    
    // Test if FormData is properly constructed
    console.log('📦 FormData has file:', formData.has('file'));
    console.log('📦 FormData get file:', formData.get('file'));
    
    // Use a completely clean axios instance for file upload
    const authToken = localStorage.getItem('authToken');
    
    try {
      console.log('📤 Sending FormData to /reports');
      console.log('📤 Auth token exists:', !!authToken);
      
      // Make the request with minimal configuration
      const response = await axios.post(`${API_BASE_URL}/reports`, formData, {
        timeout: 60000,
        headers: {
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
      });
      
      console.log('✅ Upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/reports/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/reports/${id}`);
    return response.data;
  },

  download: async (id: string) => {
    // First get the download info from backend
    const response = await apiClient.get(`/reports/${id}/download`);
    
    // If it's a Cloudinary file, open the URL directly
    if (response.data.isCloudinary && response.data.downloadUrl) {
      // Open in new tab for download
      window.open(response.data.downloadUrl, '_blank');
      return null;
    }
    
    // For local files, download as blob
    const blobResponse = await apiClient.get(`/reports/${id}/download`, {
      responseType: 'blob',
    });
    return blobResponse.data;
  },
};

// User endpoints
export const usersAPI = {
  getAll: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};

export default apiClient;