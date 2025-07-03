import axios from 'axios';
import { Transaction, Category, DashboardStats, TransactionFormData, CategoryFormData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),
  
  register: (username: string, email: string, password: string) =>
    api.post('/register', { username, email, password }),
};

export const transactionsAPI = {
  getAll: (params?: {
    startDate?: string;
    endDate?: string;
    category?: number;
    type?: 'income' | 'expense';
  }) => api.get<Transaction[]>('/transactions', { params }),
  
  create: (transaction: TransactionFormData) =>
    api.post('/transactions', transaction),
  
  update: (id: number, transaction: TransactionFormData) =>
    api.put(`/transactions/${id}`, transaction),
  
  delete: (id: number) =>
    api.delete(`/transactions/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get<Category[]>('/categories'),
  create: (category: CategoryFormData) => api.post('/categories', category),
};

export const dashboardAPI = {
  getStats: (period: 'week' | 'month' | 'year') =>
    api.get<DashboardStats>('/dashboard/stats', { params: { period } }),
};

export default api;