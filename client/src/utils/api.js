import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me')
};

// Profile API
export const profileAPI = {
  getMyProfile: () => api.get('/profile/me'),
  createProfile: (data) => api.post('/profile', data),
  updateProfile: (data) => api.put('/profile', data),
  getProfileById: (id) => api.get(`/profile/${id}`),
  deleteProfile: () => api.delete('/profile')
};

// Discover API
export const discoverAPI = {
  getProfiles: (params) => api.get('/discover', { params }),
  searchProfiles: (query) => api.get('/discover/search', { params: { query } })
};

// Upload API
export const uploadAPI = {
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.post('/upload/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  uploadPhotos: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });
    return api.post('/upload/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deletePhoto: (index) => api.delete(`/upload/photos/${index}`),
  removeProfilePicture: () => api.delete('/upload/profile-picture')
};

// Messages API
export const messagesAPI = {
  getInbox: () => api.get('/messages/inbox'),
  getSent: () => api.get('/messages/sent'),
  getMessage: (id) => api.get(`/messages/${id}`),
  sendMessage: (data) => api.post('/messages/send', data),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  markAsRead: (id) => api.patch(`/messages/${id}/read`),
  getUnreadCount: () => api.get('/messages/unread/count')
};

export default api;
