const express = require('express');
const budgetController = require('../controllers/budget.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/budgets - Get all budgets with spending info
router.get('/', budgetController.getAllBudgets);

// GET /api/budgets/overview - Get budget overview/summary
router.get('/overview', budgetController.getBudgetOverview);

// GET /api/budgets/categories - Get available categories for new budgets
router.get('/categories', budgetController.getAvailableCategories);

// GET /api/budgets/:id - Get a single budget
router.get('/:id', budgetController.getBudgetById);

// POST /api/budgets - Create a new budget
router.post('/', budgetController.createBudget);

// PUT /api/budgets/:id - Update a budget
router.put('/:id', budgetController.updateBudget);

// DELETE /api/budgets/:id - Delete a budget
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
