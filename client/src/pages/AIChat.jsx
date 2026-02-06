import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Wand2 } from 'lucide-react';
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
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-12rem)]">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden min-h-[500px] lg:min-h-0">
        {/* Chat Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
                </div>
              </div>
            </div>
            {/* Mobile Budget Button */}
            <button
              onClick={handleGenerateBudget}
              disabled={loadingBudget}
              className="lg:hidden px-3 py-2 bg-primary-500/10 text-primary-500 rounded-xl hover:bg-primary-500/20 transition flex items-center gap-2 text-sm font-medium"
            >
              {loadingBudget ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Budget</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-primary-500/10' 
                    : 'bg-gray-100 dark:bg-dark-700'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" />
                ) : (
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white rounded-tr-sm'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-dark-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="bg-gray-100 dark:bg-dark-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
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
          <div className="px-4 sm:px-6 pb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-full text-gray-700 dark:text-gray-300 transition"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-gray-200 dark:border-dark-700">
          <div className="flex gap-2 sm:gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finances..."
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Budget Plan Sidebar - Hidden on mobile, collapsible */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-6 sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">AI Budget Plan</h3>
          </div>

          {!budgetPlan ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Get a personalized budget plan based on your spending habits
              </p>
              <button
                onClick={handleGenerateBudget}
                disabled={loadingBudget}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 font-medium"
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
              <div className="p-4 bg-primary-500/10 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400">Target Savings</p>
                <p className="text-2xl font-bold text-primary-500">
                  {budgetPlan.targetSavings}%
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Limits</h4>
                <div className="space-y-2">
                  {budgetPlan.categories?.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{cat.category}</span>
                      <span className="font-medium text-gray-800 dark:text-white">${cat.limit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {budgetPlan.tips?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tips</h4>
                  <ul className="space-y-2">
                    {budgetPlan.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
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
                className="w-full py-2 text-sm text-primary-500 hover:bg-primary-500/10 rounded-xl transition font-medium"
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
