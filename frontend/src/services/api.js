import axios from 'axios';

// Set this to true to work without a backend
const USE_MOCK = true;

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock Interceptor
if (USE_MOCK) {
  api.interceptors.request.use(async (config) => {
    console.warn(`[MOCK API] Intercepting ${config.method.toUpperCase()} ${config.url}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (config.url.includes('/auth/login') || config.url.includes('/auth/register')) {
      throw {
        isMock: true,
        data: {
          id: "mock_123",
          name: "Mock User",
          email: "dhruv@gmail.com",
          token: "mock_jwt_token_12345"
        }
      };
    }
    
    // Default mock response for other endpoints
    throw { isMock: true, data: { status: "success", message: "Mock response" } };
  });
}

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
