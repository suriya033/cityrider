import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentConfig } from '../config/environment';

// Get configuration based on environment (dev/prod)
const config = getCurrentConfig();
export const API_BASE_URL = config.baseURL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.timeout,
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Don't throw on 4xx errors
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
      // console.log('🔑 Token attached');
    } else {
      console.log('⚠️ No token found in storage for request:', config.url);
    }
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.message);

    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        error.message = 'Request timeout. Server is taking too long to respond.\n\nPlease check:\n1. Backend server is running\n2. Correct IP address in API settings\n3. Your network connection';
      } else if (error.message === 'Network Error') {
        error.message = 'Cannot connect to server.\n\nPlease check:\n1. Backend is running on port 5004\n2. IP address is correct: ' + API_BASE_URL + '\n3. Firewall settings';
      } else {
        error.message = 'Unable to connect to server.\n\nCurrent API: ' + API_BASE_URL + '\n\nPlease verify the backend is running.';
      }
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response.status === 401) {
      console.log('🔒 Unauthorized - clearing auth data');
      // Clear stored auth data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      // You can dispatch a logout action here if using Redux
    }

    // Handle other HTTP errors
    const status = error.response.status;
    const data = error.response.data;

    // Extract error message from response
    if (data && data.message) {
      error.message = data.details || data.message;
    } else if (status === 500) {
      error.message = 'Server error. Please try again later.';
    } else if (status === 503) {
      error.message = 'Service unavailable. Please try again later.';
    } else if (status >= 400 && status < 500) {
      error.message = data?.details || data?.message || 'Invalid request. Please check your input.';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Rides API
export const ridesAPI = {
  getAll: (params) => api.get('/rides', { params }),
  getById: (id) => api.get(`/rides/${id}`),
  create: (data) => api.post('/rides', data),
  update: (id, data) => api.put(`/rides/${id}`, data),
  cancel: (id) => api.delete(`/rides/${id}`),
  complete: (id) => api.put(`/rides/${id}/complete`),
  getMyRides: () => api.get('/rides/driver/my-rides'),
  getRideBookings: (id) => api.get(`/rides/${id}/bookings`),
};

// Bookings API
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  accept: (id) => api.put(`/bookings/${id}/accept`),
  verify: (id, verificationCode) => api.put(`/bookings/${id}/verify`, { verificationCode }),
  complete: (id, data) => api.put(`/bookings/${id}/complete`, data),
  finalize: (id) => api.put(`/bookings/${id}/finalize`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

// Users API
export const usersAPI = {
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Messages API
export const messagesAPI = {
  send: (data) => api.post('/messages', data),
  getConversation: (userId, rideId) =>
    api.get(`/messages/conversation/${userId}`, { params: { rideId } }),
  getConversations: () => api.get('/messages/conversations'),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  markConversationAsRead: (userId, rideId) =>
    api.put(`/messages/conversation/${userId}/read`, { rideId }),
};

export default api;
