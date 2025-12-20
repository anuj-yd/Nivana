import axios from 'axios';
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

// ✅ UPDATE: Added 'timeout' so requests don't hang forever
const instance = axios.create({ 
  baseURL: API_BASE_URL, 
  withCredentials: true,
  timeout: 30000 // 30 Seconds Hard Limit
});

instance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {}
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    // Agar Request Timeout ho gayi (Server too slow)
    if (err.code === 'ECONNABORTED') {
        console.error("Request timed out");
    }

    if (err?.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          // Optional: Check if we are already on login page to avoid loop
          if (!window.location.pathname.includes('/login')) {
             window.location.replace('/login');
          }
        }
      } catch (e) {}
    }
    return Promise.reject(err);
  }
);

export const apiService = {
  login: async (credentials) => {
    const res = await instance.post('/auth/login', credentials);
    return res.data;
  },
  signup: async (userInfo) => {
    const res = await instance.post('/auth/signup', userInfo);
    return res.data;
  },
  getDashboard: async () => {
    const res = await instance.get('/dashboard');
    return res.data;
  },
  logMood: async (moodData) => {
    const res = await instance.post('/moods', moodData);
    return res.data;
  },
  getAssessmentHistory: async () => {
    const res = await instance.get('/assessments/history');
    return res.data;
  },
  startAssessment: async (age) => {
    const res = await instance.post('/assessments/start', { age });
    return res.data;
  },
  submitAssessment: async (payload) => {
    const res = await instance.post('/assessments/submit', payload);
    return res.data;
  },
  updateUserProfile: async (formData) => {
    const res = await instance.put('/auth/profile', formData);
    return res.data;
  },
};