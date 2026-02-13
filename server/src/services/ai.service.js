const { generateCompletion } = require('../config/openrouter');
const prisma = require('../config/database');

const SYSTEM_PROMPT = `You are FinSense Bot, a friendly and knowledgeable personal finance assistant for the FinSense app.

Your role is to help users with ALL aspects of personal finance including:
- Budget management and planning
- Expense tracking and analysis  
- Savings strategies and goals
- Understanding spending patterns
- Income and expense insights
- Financial health tips
- Debt management advice
- Emergency fund planning

CONVERSATION GUIDELINES:
1. For greetings (hi, hello, hey): Respond warmly and BRIEFLY mention their financial status in 1-2 sentences. Ask how you can help with their finances today.
2. For specific finance questions: Provide detailed, personalized advice using their actual data.
3. For non-finance topics (coding, recipes, weather, etc.): Politely redirect: "I specialize in personal finance! I can help you with budgeting, tracking expenses, savings goals, and financial insights. What would you like to know about your finances?"
4. Always be encouraging, practical, and use the user's real financial data.
5. Keep responses concise - users want quick, actionable advice.
6. Never recommend specific stocks, investments, or financial products.

Remember: Be conversational and helpful, not robotic. Treat users like a friendly financial advisor would.`;

const generateChatResponse = async (userMessage, financialSnapshot) => {
  const hasData = financialSnapshot.income > 0 || financialSnapshot.expenses > 0;
  
  const contextPrompt = hasData ? `
User's Current Financial Snapshot:
- Monthly Income: $${financialSnapshot.income.toLocaleString()}
- Monthly Expenses: $${financialSnapshot.expenses.toLocaleString()}
- Net Balance This Month: $${(financialSnapshot.income - financialSnapshot.expenses).toLocaleString()}
- Savings Rate: ${financialSnapshot.savingsRate}%
- Financial Health Score: ${financialSnapshot.healthScore}/100
${financialSnapshot.topCategories.length > 0 ? `- Top Spending: ${financialSnapshot.topCategories.slice(0, 3).map(c => `${c.category} ($${c.amount})`).join(', ')}` : '- No spending recorded yet this month'}

User Message: ${userMessage}

Respond naturally based on their message. If it's a greeting, be brief and friendly. If they ask about finances, give specific advice using their data.` 
  : `
User has no financial data recorded yet.

User Message: ${userMessage}

Respond helpfully. If they're new, encourage them to start adding transactions to get personalized insights.`;

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: contextPrompt },
    ];

    const response = await generateCompletion(messages);
    return response;
  } catch (error) {
    console.error('OpenRouter API error:', error);
    throw new Error('Failed to generate AI response');
  }
};

const generateAutoInsights = async (financialSnapshot) => {
  const userPrompt = `Analyze this financial data and provide 3-5 brief, actionable insights:

Financial Data:
- Monthly Income: $${financialSnapshot.income}
- Monthly Expenses: $${financialSnapshot.expenses}
- Savings Rate: ${financialSnapshot.savingsRate}%
- Health Score: ${financialSnapshot.healthScore}/100
- Top Categories: ${financialSnapshot.topCategories.map(c => `${c.category}: $${c.amount} (${c.percentage}%)`).join(', ')}

Provide insights in JSON format:
{
  "insights": [
    { "type": "warning|success|tip", "title": "Brief title", "message": "Actionable insight" }
  ]
}

Return ONLY valid JSON, no other text.`;

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    const text = await generateCompletion(messages);
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { insights: [] };
  } catch (error) {
    console.error('OpenRouter API error:', error);
    return { insights: [] };
  }
};

const generateBudgetPlan = async (financialSnapshot) => {
  const userPrompt = `Create a monthly budget plan based on this financial data:

Financial Data:
- Monthly Income: $${financialSnapshot.income}
- Current Expenses: $${financialSnapshot.expenses}
- Top Spending Categories: ${financialSnapshot.topCategories.map(c => `${c.category}: $${c.amount}`).join(', ')}

Create a realistic budget plan in JSON format:
{
  "targetSavings": 20,
  "categories": [
    { "category": "Category Name", "limit": 500, "priority": "essential|important|discretionary" }
  ],
  "tips": ["Budget tip 1", "Budget tip 2"]
}

Return ONLY valid JSON, no other text.`;

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    const text = await generateCompletion(messages);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('OpenRouter API error:', error);
    throw new Error('Failed to generate budget plan');
  }
};

const saveChatInsight = async (userId, content) => {
  return prisma.aIInsight.create({
    data: {
      userId,
      type: 'CHAT',
      content,
    },
  });
};

const saveAutoInsight = async (userId, content) => {
  return prisma.aIInsight.create({
    data: {
      userId,
      type: 'AUTO',
      content,
    },
  });
};

const getChatHistory = async (userId, limit = 20) => {
  return prisma.aIInsight.findMany({
    where: {
      userId,
      type: 'CHAT',
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

module.exports = {
  generateChatResponse,
  generateAutoInsights,
  generateBudgetPlan,
  saveChatInsight,
  saveAutoInsight,
  getChatHistory,
};
