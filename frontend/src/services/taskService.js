import api from './api.js';

// Get today's tasks
const getTodaysTasks = async () => {
  const response = await api.get('/tasks/today');
  return response.data;
};

// Create a new task
const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

// Toggle a task's done state
const toggleTask = async (id) => {
  const response = await api.patch(`/tasks/${id}/toggle`);
  return response.data;
};

// Delete a task
const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

const taskService = {
  getTodaysTasks,
  createTask,
  toggleTask,
  deleteTask,
};

export default taskService;
