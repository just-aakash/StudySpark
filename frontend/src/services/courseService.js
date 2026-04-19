import api from './api.js';

// Get all courses
const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

const courseService = {
  getCourses,
};

export default courseService;
