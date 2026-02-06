import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
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
import { analyticsService, aiService } from '../services/finance';
import toast from 'react-hot-toast';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState(null);
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getDashboard();
      setSnapshot(response.data.snapshot);
      setTrends(response.data.trends);
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
      toast.error('Failed to load AI insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    if (snapshot) {
      fetchInsights();
    }
  }, [snapshot]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getHealthScoreColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score) => {
    if (score >= 70) return 'bg-green-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-gray-800">
                ${snapshot?.income?.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-green-600">
            <ArrowUpRight className="w-4 h-4" />
            <span>This month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-800">
                ${snapshot?.expenses?.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-red-600">
            <ArrowDownRight className="w-4 h-4" />
            <span>This month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Savings Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {snapshot?.savingsRate || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-gray-500">
            <DollarSign className="w-4 h-4" />
            <span>Balance: ${snapshot?.balance?.toLocaleString() || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Health Score</p>
              <p className={`text-2xl font-bold ${getHealthScoreColor(snapshot?.healthScore)}`}>
                {snapshot?.healthScore || 0}/100
              </p>
            </div>
            <div className={`w-12 h-12 ${getHealthScoreBg(snapshot?.healthScore)} rounded-lg flex items-center justify-center`}>
              <Activity className={`w-6 h-6 ${getHealthScoreColor(snapshot?.healthScore)}`} />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  snapshot?.healthScore >= 70
                    ? 'bg-green-500'
                    : snapshot?.healthScore >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${snapshot?.healthScore || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="monthName" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#22c55e"
                fill="#dcfce7"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stackId="2"
                stroke="#ef4444"
                fill="#fee2e2"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
          {snapshot?.topCategories?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={snapshot.topCategories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category, percentage }) => `${category} ${percentage}%`}
                    labelLine={false}
                  >
                    {snapshot.topCategories.map((entry, index) => (
                      <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {snapshot.topCategories.map((cat, index) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-600">{cat.category}</span>
                    </div>
                    <span className="font-medium text-gray-800">${cat.amount}</span>
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

      {/* AI Insights */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-800">AI Insights</h3>
          </div>
          <button
            onClick={fetchInsights}
            disabled={insightsLoading}
            className="text-sm text-primary-600 hover:underline disabled:opacity-50"
          >
            {insightsLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {insightsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200'
                    : insight.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <h4 className="font-medium text-gray-800 mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Add some transactions to get personalized insights!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
