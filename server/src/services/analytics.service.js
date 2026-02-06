const prisma = require('../config/database');

const getFinancialSnapshot = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Get current month transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  // Calculate totals
  let totalIncome = 0;
  let totalExpense = 0;
  const categorySpending = {};

  transactions.forEach((t) => {
    const amount = parseFloat(t.amount);
    if (t.type === 'INCOME') {
      totalIncome += amount;
    } else {
      totalExpense += amount;
      categorySpending[t.category] = (categorySpending[t.category] || 0) + amount;
    }
  });

  // Get top categories
  const topCategories = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }));

  // Calculate savings rate
  const savingsRate = totalIncome > 0 
    ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) 
    : 0;

  // Calculate health score (0-100)
  let healthScore = 50; // Base score
  if (savingsRate >= 20) healthScore += 30;
  else if (savingsRate >= 10) healthScore += 15;
  else if (savingsRate < 0) healthScore -= 20;
  
  if (totalExpense <= totalIncome * 0.7) healthScore += 20;
  else if (totalExpense > totalIncome) healthScore -= 20;

  healthScore = Math.max(0, Math.min(100, healthScore));

  return {
    income: Math.round(totalIncome * 100) / 100,
    expenses: Math.round(totalExpense * 100) / 100,
    balance: Math.round((totalIncome - totalExpense) * 100) / 100,
    savingsRate,
    healthScore,
    topCategories,
    transactionCount: transactions.length,
    month: startOfMonth.toISOString().slice(0, 7),
  };
};

const getMonthlyTrends = async (userId, months = 6) => {
  const trends = [];
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      const amount = parseFloat(t.amount);
      if (t.type === 'INCOME') income += amount;
      else expense += amount;
    });

    trends.unshift({
      month: startOfMonth.toISOString().slice(0, 7),
      monthName: startOfMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      savings: Math.round((income - expense) * 100) / 100,
    });
  }

  return trends;
};

const getCategoryBreakdown = async (userId, startDate, endDate) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
  });

  const categoryTotals = {};
  let total = 0;

  transactions.forEach((t) => {
    const amount = parseFloat(t.amount);
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
    total += amount;
  });

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
};

module.exports = {
  getFinancialSnapshot,
  getMonthlyTrends,
  getCategoryBreakdown,
};
