const budgetService = require('../services/budget.service');
const { z } = require('zod');

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  period: z.enum(['monthly', 'weekly']).optional(),
});

const updateBudgetSchema = z.object({
  category: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  period: z.enum(['monthly', 'weekly']).optional(),
  isActive: z.boolean().optional(),
});

const getAllBudgets = async (req, res) => {
  try {
    const budgets = await budgetService.getAllBudgets(req.user.id);
    res.json({ budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

const getBudgetById = async (req, res) => {
  try {
    const budget = await budgetService.getBudgetById(req.params.id, req.user.id);
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json({ budget });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
};

const createBudget = async (req, res) => {
  try {
    const validated = budgetSchema.parse(req.body);
    const budget = await budgetService.createBudget(req.user.id, validated);
    res.status(201).json({ budget, message: 'Budget created successfully' });
  } catch (error) {
    console.error('Create budget error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (error.message === 'Budget for this category already exists') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create budget' });
  }
};

const updateBudget = async (req, res) => {
  try {
    const validated = updateBudgetSchema.parse(req.body);
    const budget = await budgetService.updateBudget(req.params.id, req.user.id, validated);
    res.json({ budget, message: 'Budget updated successfully' });
  } catch (error) {
    console.error('Update budget error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (error.message === 'Budget not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Budget for this category already exists') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update budget' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    await budgetService.deleteBudget(req.params.id, req.user.id);
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    if (error.message === 'Budget not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};

const getBudgetOverview = async (req, res) => {
  try {
    const overview = await budgetService.getBudgetOverview(req.user.id);
    res.json({ overview });
  } catch (error) {
    console.error('Get budget overview error:', error);
    res.status(500).json({ error: 'Failed to fetch budget overview' });
  }
};

const getAvailableCategories = async (req, res) => {
  try {
    const categories = await budgetService.getAvailableCategories(req.user.id);
    res.json({ categories });
  } catch (error) {
    console.error('Get available categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

module.exports = {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetOverview,
  getAvailableCategories,
};
