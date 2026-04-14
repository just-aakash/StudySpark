import api from './api.js';

// Get personalized daily study advice
const getStudyAdvice = async () => {
  const response = await api.get('/ai/advice');
  return response.data;
};

// Explain a topic using AI
const explainTopic = async (topic, subject) => {
  const response = await api.post('/ai/explain', { topic, subject });
  return response.data;
};

// Get AI-generated 7-day study plan
const getStudyPlan = async () => {
  const response = await api.get('/ai/study-plan');
  return response.data;
};

// Get leaderboard
const getLeaderboard = async () => {
  const response = await api.get('/users/leaderboard');
  return response.data;
};

const aiService = {
  getStudyAdvice,
  explainTopic,
  getStudyPlan,
  getLeaderboard,
};

export default aiService;
