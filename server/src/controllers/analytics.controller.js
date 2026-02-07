const analyticsService = require('../services/analytics.service');

const getDashboard = async (req, res, next) => {
  try {
    const [snapshot, trends] = await Promise.all([
      analyticsService.getFinancialSnapshot(req.user.id),
      analyticsService.getMonthlyTrends(req.user.id, 6),
    ]);

    res.json({
      snapshot,
      trends,
    });
  } catch (error) {
    next(error);
  }
};

const getSnapshot = async (req, res, next) => {
  try {
    const snapshot = await analyticsService.getFinancialSnapshot(req.user.id);
    res.json({ snapshot });
  } catch (error) {
    next(error);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const trends = await analyticsService.getMonthlyTrends(req.user.id, months);
    res.json({ trends });
  } catch (error) {
    next(error);
  }
};

const getCategoryBreakdown = async (req, res, next) => {
  try {
    const now = new Date();
    const startDate = req.query.startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endDate = req.query.endDate || now.toISOString();

    const breakdown = await analyticsService.getCategoryBreakdown(
      req.user.id,
      startDate,
      endDate
    );

    res.json({ breakdown });
  } catch (error) {
    next(error);
  }
};

const getDailyTrends = async (req, res, next) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

    const dailyTrends = await analyticsService.getDailyTrends(req.user.id, year, month);
    res.json(dailyTrends);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getSnapshot,
  getTrends,
  getCategoryBreakdown,
  getDailyTrends,
};
