import api from './api';

export const transactionService = {
  getAll: (params = {}) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getCategories: () => api.get('/transactions/categories'),
};

export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getSnapshot: () => api.get('/analytics/snapshot'),
  getTrends: (months = 6) => api.get('/analytics/trends', { params: { months } }),
  getCategoryBreakdown: (startDate, endDate) => 
    api.get('/analytics/categories', { params: { startDate, endDate } }),
};

export const aiService = {
  chat: (message) => api.post('/ai/chat', { message }),
  getInsights: () => api.get('/ai/insights'),
  getBudgetPlan: () => api.get('/ai/budget-plan'),
  getChatHistory: (limit = 20) => api.get('/ai/chat-history', { params: { limit } }),
};
