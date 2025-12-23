import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

// ✅ Axios Instance with Timeout
const instance = axios.create({ 
  baseURL: API_BASE_URL, 
  withCredentials: true,
  timeout: 30000 // 30 Seconds Hard Limit to prevent hanging
});

// ✅ REQUEST INTERCEPTOR (Token Attach karne ke liye)
instance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {}
  return config;
});

// ✅ RESPONSE INTERCEPTOR (Error Handling & Auto Logout)
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    // Agar Request Timeout ho gayi
    if (err.code === 'ECONNABORTED') {
        console.error("Request timed out - Server took too long");
    }

    // Agar 401 Unauthorized aaya (Token Expired/Invalid)
    if (err?.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          // Avoid redirect loop if already on login page
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
  // Auth
  login: async (credentials) => {
    const res = await instance.post('/auth/login', credentials);
    return res.data;
  },
  signup: async (userInfo) => {
    const res = await instance.post('/auth/signup', userInfo);
    return res.data;
  },
  
  // ✅ NEW: Added for AuthContext to fetch user details
  getCurrentUser: async () => {
    const res = await instance.get('/auth/me');
    return res.data;
  },

  // Dashboard & Moods
  getDashboard: async () => {
    const res = await instance.get('/dashboard');
    return res.data;
  },
  logMood: async (moodData) => {
    const res = await instance.post('/moods', moodData);
    return res.data;
  },

  // Assessments
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
  
  // Profile
  updateUserProfile: async (formData) => {
    const res = await instance.put('/auth/profile', formData);
    return res.data;
  },
};