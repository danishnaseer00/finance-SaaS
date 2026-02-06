const aiService = require('../services/ai.service');
const analyticsService = require('../services/analytics.service');

const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    // Get financial snapshot for context
    const snapshot = await analyticsService.getFinancialSnapshot(userId);

    // Generate AI response
    const response = await aiService.generateChatResponse(message, snapshot);

    // Save chat interaction
    await aiService.saveChatInsight(userId, JSON.stringify({
      userMessage: message,
      aiResponse: response,
    }));

    res.json({
      message: response,
      snapshot,
    });
  } catch (error) {
    next(error);
  }
};

const getInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get financial snapshot
    const snapshot = await analyticsService.getFinancialSnapshot(userId);

    // Generate auto insights
    const insights = await aiService.generateAutoInsights(snapshot);

    // Save insights
    if (insights.insights?.length > 0) {
      await aiService.saveAutoInsight(userId, JSON.stringify(insights));
    }

    res.json({
      insights: insights.insights || [],
      snapshot,
    });
  } catch (error) {
    next(error);
  }
};

const getBudgetPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get financial snapshot
    const snapshot = await analyticsService.getFinancialSnapshot(userId);

    // Generate budget plan
    const budgetPlan = await aiService.generateBudgetPlan(snapshot);

    res.json({
      budgetPlan,
      snapshot,
    });
  } catch (error) {
    next(error);
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const history = await aiService.getChatHistory(req.user.id, limit);

    // Parse the stored JSON content
    const parsedHistory = history.map((item) => {
      try {
        const content = JSON.parse(item.content);
        return {
          id: item.id,
          ...content,
          createdAt: item.createdAt,
        };
      } catch {
        return {
          id: item.id,
          content: item.content,
          createdAt: item.createdAt,
        };
      }
    });

    res.json({ history: parsedHistory });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chat,
  getInsights,
  getBudgetPlan,
  getChatHistory,
};
