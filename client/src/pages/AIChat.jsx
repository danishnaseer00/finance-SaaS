import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { aiService } from '../services/finance';
import toast from 'react-hot-toast';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI financial assistant. I can help you understand your spending habits, create budgets, and provide personalized financial advice. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [budgetPlan, setBudgetPlan] = useState(null);
  const [loadingBudget, setLoadingBudget] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await aiService.chat(userMessage);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.message },
      ]);
    } catch (error) {
      toast.error('Failed to get response');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleGenerateBudget = async () => {
    setLoadingBudget(true);
    try {
      const response = await aiService.getBudgetPlan();
      setBudgetPlan(response.data.budgetPlan);
      toast.success('Budget plan generated!');
    } catch (error) {
      toast.error('Failed to generate budget plan');
    } finally {
      setLoadingBudget(false);
    }
  };

  const suggestedQuestions = [
    "How am I doing financially this month?",
    "Where can I cut my expenses?",
    "How can I save more money?",
    "What's my biggest spending category?",
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Financial Assistant</h3>
              <p className="text-sm text-white/80">Powered by Google Gemini</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-primary-100' : 'bg-gray-100'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-primary-600" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-500 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finances..."
              className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Budget Plan Sidebar */}
      <div className="w-80 flex-shrink-0 hidden lg:block">
        <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-800">AI Budget Plan</h3>
          </div>

          {!budgetPlan ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Get a personalized budget plan based on your spending habits
              </p>
              <button
                onClick={handleGenerateBudget}
                disabled={loadingBudget}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loadingBudget ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Budget
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-gray-600">Target Savings</p>
                <p className="text-2xl font-bold text-primary-600">
                  {budgetPlan.targetSavings}%
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Category Limits</h4>
                <div className="space-y-2">
                  {budgetPlan.categories?.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{cat.category}</span>
                      <span className="font-medium text-gray-800">${cat.limit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {budgetPlan.tips?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tips</h4>
                  <ul className="space-y-2">
                    {budgetPlan.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-600 flex gap-2">
                        <span className="text-primary-500">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleGenerateBudget}
                disabled={loadingBudget}
                className="w-full py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition"
              >
                Regenerate Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChat;
