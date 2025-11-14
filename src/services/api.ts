import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

    const response = await apiClient.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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