import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get API URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_BASE_URL);

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
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

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
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
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('topicId', data.topicId);
    formData.append('file', data.file);
    
    // Do NOT set the Content-Type header manually when sending FormData with axios.
    // Let axios/browser set the correct multipart boundary for you.
    // Create a new request config without Content-Type header
    const config = {
      timeout: 60000, // 60 seconds timeout for file upload
      headers: {
        ...apiClient.defaults.headers.common,
        // Remove Content-Type to let browser set it with boundary
      },
    };
    // Remove Content-Type if it exists
    delete (config.headers as any)['Content-Type'];
    
    const response = await apiClient.post('/reports', formData, config);
    return response.data;
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
    const response = await apiClient.get(`/reports/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
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