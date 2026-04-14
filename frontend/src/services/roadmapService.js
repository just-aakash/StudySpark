import api from './api.js';

// Generate a roadmap for the given subjects
const generateRoadmap = async (subjects) => {
  const response = await api.post('/roadmaps/generate', { subjects });
  return response.data;
};

// Fetch the active roadmap for the logged-in user
const getActiveRoadmap = async () => {
  const response = await api.get('/roadmaps/active');
  return response.data;
};

// Mark a roadmap node as done/current/pending
const updateNodeStatus = async (nodeIndex, status) => {
  const response = await api.patch(`/roadmaps/node/${nodeIndex}`, { status });
  return response.data;
};

const roadmapService = {
  generateRoadmap,
  getActiveRoadmap,
  updateNodeStatus,
};

export default roadmapService;
