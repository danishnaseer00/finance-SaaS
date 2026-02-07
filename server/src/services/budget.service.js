const prisma = require('../config/database');

const EXPENSE_CATEGORIES = [
  'Food', 'Rent', 'Utilities', 'Transportation', 'Entertainment', 
  'Shopping', 'Healthcare', 'Education', 'Other'
];

const getAllBudgets = async (userId) => {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    orderBy: { category: 'asc' },
  });

  // Get current month's spending per category
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  // Calculate spending per category
  const categorySpending = {};
  transactions.forEach((t) => {
    const amount = parseFloat(t.amount);
    categorySpending[t.category] = (categorySpending[t.category] || 0) + amount;
  });

  // Enrich budgets with spent amount and percentage
  return budgets.map((budget) => {
    const spent = categorySpending[budget.category] || 0;
    const budgetAmount = parseFloat(budget.amount);
    const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
    const remaining = budgetAmount - spent;

    let status = 'on-track'; // green
    if (percentage >= 100) status = 'exceeded';
    else if (percentage >= 75) status = 'warning';

    return {
      ...budget,
      amount: budgetAmount,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      percentage,
      status,
    };
  });
};

const getBudgetById = async (id, userId) => {
  return prisma.budget.findFirst({
    where: { id, userId },
  });
};

const createBudget = async (userId, data) => {
  // Check if budget for this category already exists
  const existing = await prisma.budget.findFirst({
    where: { userId, category: data.category },
  });

  if (existing) {
    throw new Error('Budget for this category already exists');
  }

  return prisma.budget.create({
    data: {
      userId,
      category: data.category,
      amount: data.amount,
      period: data.period || 'monthly',
      isActive: true,
    },
  });
};

const updateBudget = async (id, userId, data) => {
  const budget = await prisma.budget.findFirst({
    where: { id, userId },
  });

  if (!budget) {
    throw new Error('Budget not found');
  }

  // If changing category, check for duplicate
  if (data.category && data.category !== budget.category) {
    const existing = await prisma.budget.findFirst({
      where: { userId, category: data.category },
    });
    if (existing) {
      throw new Error('Budget for this category already exists');
    }
  }

  return prisma.budget.update({
    where: { id },
    data: {
      category: data.category,
      amount: data.amount,
      period: data.period,
      isActive: data.isActive,
    },
  });
};

const deleteBudget = async (id, userId) => {
  const budget = await prisma.budget.findFirst({
    where: { id, userId },
  });

  if (!budget) {
    throw new Error('Budget not found');
  }

  return prisma.budget.delete({
    where: { id },
  });
};

const getBudgetOverview = async (userId) => {
  const budgets = await getAllBudgets(userId);
  
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  
  const exceededCount = budgets.filter(b => b.status === 'exceeded').length;
  const warningCount = budgets.filter(b => b.status === 'warning').length;
  const onTrackCount = budgets.filter(b => b.status === 'on-track').length;

  return {
    totalBudget: Math.round(totalBudget * 100) / 100,
    totalSpent: Math.round(totalSpent * 100) / 100,
    remaining: Math.round((totalBudget - totalSpent) * 100) / 100,
    overallPercentage,
    exceededCount,
    warningCount,
    onTrackCount,
    budgetCount: budgets.length,
  };
};

const getAvailableCategories = async (userId) => {
  // Get categories that don't have budgets yet
  const existingBudgets = await prisma.budget.findMany({
    where: { userId },
    select: { category: true },
  });

  const usedCategories = existingBudgets.map(b => b.category);
  return EXPENSE_CATEGORIES.filter(cat => !usedCategories.includes(cat));
};

module.exports = {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetOverview,
  getAvailableCategories,
  EXPENSE_CATEGORIES,
};
