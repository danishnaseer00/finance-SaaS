import api from './api';

export const transactionService = {
  getAll: (params = {}) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getCategories: () => api.get('/transactions/categories'),
};

export const accountService = {
  getAll: (params = {}) => api.get('/accounts', { params }),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  toggleArchive: (id) => api.patch(`/accounts/${id}/toggle-archive`),
  delete: (id) => api.delete(`/accounts/${id}`),
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

export const budgetService = {
  getAll: () => api.get('/budgets'),
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  getOverview: () => api.get('/budgets/overview'),
  getAvailableCategories: () => api.get('/budgets/categories'),
};
