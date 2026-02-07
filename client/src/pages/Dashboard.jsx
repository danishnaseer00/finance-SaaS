import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Target,
  Calendar,
  Plus,
  Lightbulb,
  ShoppingBag,
  Coffee,
  Zap,
  MoreHorizontal,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { analyticsService, aiService, transactionService, accountService, budgetService } from '../services/finance';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#64748b'];

const categoryIcons = {
  Food: Coffee,
  Entertainment: Sparkles,
  Shopping: ShoppingBag,
  Utilities: Zap,
  default: Wallet,
};

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Bonus', 'Other Income'],
  expense: ['Food', 'Rent', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other'],
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  
  // Month picker state for daily trends
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [dailyTrends, setDailyTrends] = useState(null);
  const [dailyTrendsLoading, setDailyTrendsLoading] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, transactionsRes, accountsRes, budgetsRes] = await Promise.all([
        analyticsService.getDashboard(),
        transactionService.getAll({ limit: 5 }),
        accountService.getAll(),
        budgetService.getAll(),
      ]);
      setSnapshot(dashboardRes.data.snapshot);
      setTrends(dashboardRes.data.trends);
      setRecentTransactions(transactionsRes.data.transactions);
      setAccounts(accountsRes.data.accounts || []);
      setBudgets(budgetsRes.data.budgets || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      setInsightsLoading(true);
      const response = await aiService.getInsights();
      setInsights(response.data.insights || []);
    } catch (error) {
      console.error('Failed to load insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await transactionService.create({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast.success('Transaction added successfully!');
      setShowAddModal(false);
      setFormData({
        amount: '',
        type: 'EXPENSE',
        category: '',
        accountId: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      // Refresh both dashboard data and daily trends
      fetchDashboardData();
      fetchDailyTrends(selectedMonth.year, selectedMonth.month);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add transaction');
    }
  };

  const fetchDailyTrends = async (year, month) => {
    try {
      setDailyTrendsLoading(true);
      const response = await analyticsService.getDailyTrends(year, month);
      setDailyTrends(response.data);
    } catch (error) {
      console.error('Failed to load daily trends');
    } finally {
      setDailyTrendsLoading(false);
    }
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth({ year: pickerYear, month });
    setShowMonthPicker(false);
    fetchDailyTrends(pickerYear, month);
  };

  // Fetch daily trends on component mount
  useEffect(() => {
    fetchDailyTrends(selectedMonth.year, selectedMonth.month);
  }, []);

  useEffect(() => {
    if (snapshot) {
      fetchInsights();
    }
  }, [snapshot]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Prepare chart data for daily spending trend
  const chartData = trends.map((t) => ({
    name: t.monthName.split(' ')[0],
    spending: t.expense,
    income: t.income,
  }));

  // Prepare pie chart data
  const pieData = snapshot?.topCategories?.slice(0, 4).map((cat, index) => ({
    name: cat.category,
    value: cat.amount,
    percentage: cat.percentage,
  })) || [];

  const totalSpent = pieData.reduce((acc, curr) => acc + curr.value, 0);

  const StatCard = ({ icon: Icon, label, value, subtext, color, valueColor, tooltip }) => (
    <div className="glass-card rounded-2xl p-5 sm:p-6 relative group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        {tooltip && (
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-dark-600 flex items-center justify-center cursor-help text-xs text-gray-500 dark:text-gray-400 font-medium">?</div>
            <div className="absolute right-0 top-6 w-48 p-2 bg-gray-900 dark:bg-dark-600 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold ${valueColor || 'text-gray-900 dark:text-white'}`}>{value}</p>
      {subtext && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Financial Overview
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
            Your intelligent expense tracking is up to date for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl text-sm font-medium text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Wallet}
          label="Account Balance"
          value={`$${snapshot?.accountBalance?.toLocaleString() || '0'}`}
          subtext={`ACROSS ${snapshot?.accountCount || 0} ACCOUNTS`}
          color="bg-primary-500"
        />
        <StatCard
          icon={TrendingDown}
          label="Monthly Expenses"
          value={`$${snapshot?.expenses?.toLocaleString() || '0'}`}
          subtext={`${snapshot?.transactionCount || 0} TRANSACTIONS THIS MONTH`}
          color="bg-indigo-500"
        />
        <StatCard
          icon={Target}
          label="Remaining Budget"
          value={`${(snapshot?.budgetRemaining ?? 0) < 0 ? '-' : ''}$${Math.abs(snapshot?.budgetRemaining ?? 0).toLocaleString()}`}
          subtext={`${snapshot?.daysRemaining || 0} DAYS LEFT IN MONTH`}
          color="bg-slate-400"
          valueColor={(snapshot?.budgetRemaining ?? 0) < 0 ? 'text-red-500' : undefined}
          tooltip="Total budget limits minus spending in budgeted categories. Set budgets in the Budgets page. Negative means you've overspent."
        />
        <StatCard
          icon={PiggyBank}
          label="Savings Rate"
          value={`${snapshot?.savingsRate || 0}%`}
          subtext={`GOAL: 30%`}
          color="bg-green-500"
          valueColor={(snapshot?.savingsRate || 0) < 0 ? 'text-red-500' : undefined}
          tooltip="Savings Rate = (Income - Expenses) / Income. Add income transactions to see your savings percentage. Negative means you spent more than you earned."
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Trends */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Trends</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Daily spending for {dailyTrends?.monthName || 'this month'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Month Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-dark-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{MONTHS[selectedMonth.month - 1]} {selectedMonth.year}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showMonthPicker && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl shadow-lg z-20 p-4">
                    {/* Year Navigation */}
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setPickerYear(pickerYear - 1)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <span className="font-semibold text-gray-900 dark:text-white">{pickerYear}</span>
                      <button
                        onClick={() => setPickerYear(pickerYear + 1)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    
                    {/* Month Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      {MONTHS.map((month, index) => {
                        const isSelected = selectedMonth.month === index + 1 && selectedMonth.year === pickerYear;
                        const now = new Date();
                        const isFuture = pickerYear > now.getFullYear() || 
                          (pickerYear === now.getFullYear() && index + 1 > now.getMonth() + 1);
                        
                        return (
                          <button
                            key={month}
                            onClick={() => !isFuture && handleMonthSelect(index + 1)}
                            disabled={isFuture}
                            className={`py-2 px-3 text-sm rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-primary-500 text-white'
                                : isFuture
                                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                            }`}
                          >
                            {month}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Legend */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-primary-500 rounded-full"></span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Expenses</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Income</span>
                </div>
              </div>
            </div>
          </div>
          
          {dailyTrendsLoading ? (
            <div className="h-[280px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyTrends?.days || []}>
                <defs>
                  <linearGradient id="colorDailyExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDailyIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e2642' : '#f1f5f9'} vertical={false} />
                <XAxis 
                  dataKey="dayLabel" 
                  stroke={isDark ? '#64748b' : '#94a3b8'} 
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis 
                  stroke={isDark ? '#64748b' : '#94a3b8'} 
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#151d33' : '#fff',
                    border: `1px solid ${isDark ? '#1e2642' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: isDark ? '#fff' : '#1f2937' }}
                  formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'expense' ? 'Expenses' : 'Income']}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDailyIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDailyExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          
          {/* Month Totals */}
          {dailyTrends && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Income</p>
                <p className="text-lg font-semibold text-green-500">${dailyTrends.totals.income.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Expenses</p>
                <p className="text-lg font-semibold text-primary-500">${dailyTrends.totals.expense.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net</p>
                <p className={`text-lg font-semibold ${dailyTrends.totals.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {dailyTrends.totals.net >= 0 ? '+' : ''}${dailyTrends.totals.net.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Spending by Category */}
        <div className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spending by Category</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Top distribution of expenses</p>
          </div>
          
          {pieData.length > 0 ? (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${totalSpent.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">TOTAL SPENT</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                {pieData.map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{cat.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {cat.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              No spending data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Recently completed transactions, updated live.</p>
          </div>
          <a href="/transactions" className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors">
            View All
          </a>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="pb-4">Date</th>
                <th className="pb-4">Merchant</th>
                <th className="pb-4">Category</th>
                <th className="pb-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
              {recentTransactions.map((transaction) => {
                const Icon = categoryIcons[transaction.category] || categoryIcons.default;
                return (
                  <tr key={transaction.id} className="group">
                    <td className="py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          transaction.type === 'INCOME' 
                            ? 'bg-green-100 dark:bg-green-500/20' 
                            : 'bg-gray-100 dark:bg-dark-600'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            transaction.type === 'INCOME' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.notes || transaction.category}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {transaction.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                        transaction.type === 'INCOME'
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                          : 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400'
                      }`}>
                        {transaction.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`text-sm font-semibold ${
                        transaction.type === 'INCOME' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}${parseFloat(transaction.amount).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-3">
          {recentTransactions.map((transaction) => {
            const Icon = categoryIcons[transaction.category] || categoryIcons.default;
            return (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-600 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    transaction.type === 'INCOME' 
                      ? 'bg-green-100 dark:bg-green-500/20' 
                      : 'bg-white dark:bg-dark-700'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      transaction.type === 'INCOME' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.category}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${
                  transaction.type === 'INCOME' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}${parseFloat(transaction.amount).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <div className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Overview</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track your spending limits</p>
            </div>
            <a href="/budgets" className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors">
              Manage
            </a>
          </div>
          <div className="space-y-4">
            {budgets.slice(0, 4).map((budget) => {
              const progressColor = budget.status === 'exceeded' 
                ? 'bg-red-500' 
                : budget.status === 'warning' 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500';
              const statusColor = budget.status === 'exceeded'
                ? 'text-red-500'
                : budget.status === 'warning'
                  ? 'text-yellow-500'
                  : 'text-green-500';
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {budget.category}
                    </span>
                    <span className={`text-sm font-medium ${statusColor}`}>
                      ${budget.spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${progressColor} transition-all duration-500`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {budgets.length > 4 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
              +{budgets.length - 4} more budgets
            </p>
          )}
        </div>
      )}

      {/* AI Smart Insight */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-dark-700 to-dark-800 dark:from-dark-700 dark:to-dark-600 rounded-2xl p-5 sm:p-6 border border-dark-600">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1">AI Smart Insight</h4>
                <p className="text-sm text-gray-300">
                  {insights[0]?.message || "Your spending patterns look healthy! Keep up the good work."}
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/ai-chat')}
              className="px-4 py-2 bg-white dark:bg-dark-500 text-gray-900 dark:text-white text-sm font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-dark-400 transition-colors whitespace-nowrap"
            >
              Take Action
            </button>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md p-6 border border-gray-200 dark:border-dark-700 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Add Transaction
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="type"
                      value="INCOME"
                      checked={formData.type === 'INCOME'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                      className="sr-only"
                    />
                    <div
                      className={`p-3 rounded-xl border-2 text-center cursor-pointer transition ${
                        formData.type === 'INCOME'
                          ? 'border-green-500 bg-green-500/10 text-green-500'
                          : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <ArrowUpCircle className="w-5 h-5 mx-auto mb-1" />
                      Income
                    </div>
                  </label>
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="type"
                      value="EXPENSE"
                      checked={formData.type === 'EXPENSE'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                      className="sr-only"
                    />
                    <div
                      className={`p-3 rounded-xl border-2 text-center cursor-pointer transition ${
                        formData.type === 'EXPENSE'
                          ? 'border-red-500 bg-red-500/10 text-red-500'
                          : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <ArrowDownCircle className="w-5 h-5 mx-auto mb-1" />
                      Expense
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account</label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.type.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES[formData.type.toLowerCase()].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add a note..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-dark-600 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition font-medium"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
