import api from './api.js';

// Register user
const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    saveUserData(response.data);
    return response.data;
  } catch (err) {
    if (err.isMock) {
      saveUserData(err.data);
      return err.data;
    }
    throw err;
  }
};

// Login user
const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    saveUserData(response.data);
    return response.data;
  } catch (err) {
    if (err.isMock) {
      saveUserData(err.data);
      return err.data;
    }
    throw err;
  }
};

const saveUserData = (data) => {
  if (data) {
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
