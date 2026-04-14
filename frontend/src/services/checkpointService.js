import api from './api.js';

// Get 5 questions for a subject checkpoint
const getQuestions = async (subject) => {
  const response = await api.get(`/checkpoints/${subject}`);
  return response.data;
};

// Submit answers for a checkpoint
const submitCheckpoint = async (subject, answers, questions) => {
  const response = await api.post(`/checkpoints/${subject}/submit`, { answers, questions });
  return response.data;
};

// Get full checkpoint history for the user
const getHistory = async () => {
  const response = await api.get('/checkpoints/history');
  return response.data;
};

const checkpointService = {
  getQuestions,
  submitCheckpoint,
  getHistory,
};

export default checkpointService;
