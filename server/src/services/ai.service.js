const { generateCompletion } = require('../config/openrouter');
const prisma = require('../config/database');

const SYSTEM_PROMPT = `You are FinSense AI, a helpful and friendly personal finance assistant. 
Your role is to help users understand their spending habits, provide budgeting advice, and offer actionable financial insights.

Guidelines:
- Be concise and practical in your responses
- Focus on actionable advice
- Use the user's actual financial data when provided
- Be encouraging but honest about areas for improvement
- Never give specific investment advice or recommend specific financial products
- If asked about topics outside personal finance, politely redirect to financial topics`;

const generateChatResponse = async (userMessage, financialSnapshot) => {
  const contextPrompt = `
Current Financial Snapshot:
- Monthly Income: $${financialSnapshot.income}
- Monthly Expenses: $${financialSnapshot.expenses}
- Current Balance: $${financialSnapshot.balance}
- Savings Rate: ${financialSnapshot.savingsRate}%
- Financial Health Score: ${financialSnapshot.healthScore}/100
- Top Spending Categories: ${financialSnapshot.topCategories.map(c => `${c.category} ($${c.amount})`).join(', ')}

User Question: ${userMessage}

Please provide a helpful, personalized response based on their financial situation.`;

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
