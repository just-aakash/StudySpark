import api from './api.js';

// Register user
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  saveUserData(response.data);
  return response.data;
};

// Login user
const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  saveUserData(response.data);
  return response.data;
};

// Get the logged-in user's full profile
const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Update profile fields
const updateProfile = async (data) => {
  const response = await api.patch('/users/profile', data);
  return response.data;
};

// Get aggregated analytics for the dashboard
const getAnalytics = async () => {
  const response = await api.get('/users/analytics');
  return response.data;
};

const saveUserData = (data) => {
  if (data) {
    localStorage.setItem('user', JSON.stringify(data));
    if (data.token) localStorage.setItem('token', data.token);
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};
// Sync focus data
const syncFocus = async (score, switches) => {
  const response = await api.post('/users/sync-focus', { score, switches });
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  getAnalytics,
  syncFocus,
};

export default authService;
