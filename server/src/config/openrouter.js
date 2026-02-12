const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const FREE_MODELS = [
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'arcee-ai/trinity-large-preview:free',
  'stepfun/step-3.5-flash:free',
  'meta-llama/llama-3.3-70b-instruct:free',
];

const getOpenRouterClient = () => {
  return axios.create({
    baseURL: OPENROUTER_API_URL,
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
      'X-Title': 'FinSense AI',
      'Content-Type': 'application/json',
    },
  });
};

const generateCompletion = async (messages, options = {}) => {
  const client = getOpenRouterClient();
  
  for (let i = 0; i < FREE_MODELS.length; i++) {
    const model = i === 0 ? (options.model || process.env.OPENROUTER_MODEL || FREE_MODELS[0]) : FREE_MODELS[i];
    
    try {
      console.log(`Trying model: ${model}`);
      
      const response = await client.post('', {
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1024,
        top_p: options.topP || 0.95,
      });

      const content = response.data.choices?.[0]?.message?.content;
      if (content) {
        console.log(`Success with model: ${model}`);
        return content;
      }
    } catch (error) {
      console.error(`Model ${model} failed:`, error.response?.data?.error?.message || error.message);
      

      if (i === FREE_MODELS.length - 1) {
        throw new Error(`All AI models failed. Last error: ${error.response?.data?.error?.message || error.message}`);
      }
      
      console.log(`Trying next model...`);
    }
  }
  
  throw new Error('Failed to generate AI response - all models exhausted');
};

module.exports = { 
  generateCompletion, 
  FREE_MODELS,
};
