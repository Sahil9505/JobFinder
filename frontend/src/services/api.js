// Import axios for making HTTP requests
import axios from 'axios';

// Base URL for the backend API (uses environment variable)
// IMPORTANT: Set VITE_API_URL to the server origin WITHOUT trailing /api
// For local: http://localhost:3100
// For production: Your deployed backend URL (e.g., https://api.example.com)
const RAW_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100';

// Normalize to ensure no trailing slash and no trailing /api
const SERVER_URL = RAW_SERVER_URL
  .replace(/\/$/, '')
  .replace(/\/api\/?$/, '');

// Export the base server URL (for static file references like profile images)
export const getServerURL = () => SERVER_URL;

// Compute API base URL
const API_BASE_URL = `${SERVER_URL}/api`;

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
});

// Request interceptor - adds JWT token to every request if available
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Enhanced error logging for debugging (suppressed in production)
    const shouldLog = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';
    if (shouldLog) {
      if (error.response) {
        // Server responded with error status
        console.error('API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url
        });
      } else if (error.request) {
        // Request made but no response received
        console.error('API No Response:', {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          message: 'No response received from server. Check if backend is running.'
        });
      } else {
        // Error setting up request
        console.error('API Request Setup Error:', error.message);
      }
    }

    // If token is invalid/expired, remove it and redirect to login
    if (error.response?.status === 401) {
      if (import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true') {
        console.warn('401 Unauthorized - clearing auth token');
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // You can redirect to login here if needed
    }
    return Promise.reject(error);
  }
);

// ============ AUTH APIs ============

// Register a new user
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Login user and get JWT token
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Get current user profile
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Update user profile (with optional profile image)
export const updateProfile = async (formData) => {
  const response = await api.put('/auth/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Change user password
export const changePassword = async (passwordData) => {
  const response = await api.put('/auth/change-password', passwordData);
  return response.data;
};

// Send or resend email verification
export const sendVerificationEmail = async () => {
  const response = await api.post('/auth/send-verification');
  return response.data;
};

// Verify email with token
export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify-email/${token}`);
  return response.data;
};

// Request password reset email
export const requestPasswordReset = async (email) => {
  const response = await api.post('/auth/request-password-reset', { email });
  return response.data;
};

// Reset password with token
export const resetPassword = async (token, newPassword) => {
  const response = await api.post(`/auth/reset-password/${token}`, { newPassword });
  return response.data;
};

// Get account activity/security info
export const getAccountActivity = async () => {
  const response = await api.get('/auth/account-activity');
  return response.data;
};

// ============ JOB APIs ============

// Get all jobs and internships
export const getJobs = async (params = {}) => {
  const response = await api.get('/jobs', { params });
  return response.data;
};

// Get a single job by ID
export const getJobById = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

// Add a new job (for admin - not used in current frontend)
export const addJob = async (jobData) => {
  const response = await api.post('/jobs/add', jobData);
  return response.data;
};

// ============ APPLICATION APIs ============

// Apply for a job/internship (legacy simple endpoint)
export const applyForJob = async (jobId) => {
  const response = await api.post(`/apply/${jobId}`);
  return response.data;
};

// Submit full application with resume (multipart/form-data)
export const submitApplication = async (formData, onUploadProgress) => {
  // Do not force Content-Type header here; let axios set the multipart boundary
  const response = await api.post('/applications/apply', formData, {
    onUploadProgress
  });
  return response.data;
};

// Get all applications by logged-in user (try preferred endpoint first)
export const getMyApplications = async () => {
  try {
    const response = await api.get('/applications/my');
    return response.data;
  } catch (err) {
    const response = await api.get('/my-applications');
    return response.data;
  }
};

// Cancel an application by application id
export const cancelApplication = async (applicationId) => {
  const response = await api.patch(`/applications/cancel/${applicationId}`);
  // return the full payload (application + updated list)
  return response.data;
};

// Cancel an application by job id (convenience)
// Cancel an application by job id (convenience) - uses PATCH /applications/:jobId/cancel
export const cancelApplicationByJob = async (jobId) => {
  const response = await api.patch(`/applications/${jobId}/cancel`);
  return response.data; // expected { success: true, jobId }
};

// Get user's application by id (helper)
export const getApplicationById = async (id) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};


// ============ EXTERNAL JOBS APIs ============

// Get jobs from external public APIs (Remotive, etc.)
export const getExternalJobs = async () => {
  const response = await api.get('/external-jobs');
  return response.data;
};

// ============ COMPANIES APIs ============

// Get aggregated list of companies
export const getCompanies = async () => {
  const response = await api.get('/companies');
  return response.data;
};

export default api;

