import { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { budgetService } from '../services/finance';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  Food: '🍔',
  Rent: '🏠',
  Utilities: '💡',
  Transportation: '🚗',
  Entertainment: '🎬',
  Shopping: '🛒',
  Healthcare: '🏥',
  Education: '📚',
  Other: '📦',
};

const Budgets = () => {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [overview, setOverview] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
  });
  const { isDark } = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, overviewRes, categoriesRes] = await Promise.all([
        budgetService.getAll(),
        budgetService.getOverview(),
        budgetService.getAvailableCategories(),
      ]);
      setBudgets(budgetsRes.data.budgets);
      setOverview(overviewRes.data.overview);
      setAvailableCategories(categoriesRes.data.categories);
    } catch (error) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        category: budget.category,
        amount: budget.amount.toString(),
      });
    } else {
      setEditingBudget(null);
      setFormData({ category: '', amount: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        category: formData.category,
        amount: parseFloat(formData.amount),
      };

      if (editingBudget) {
        await budgetService.update(editingBudget.id, data);
        toast.success('Budget updated successfully');
      } else {
        await budgetService.create(data);
        toast.success('Budget created successfully');
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    try {
      await budgetService.delete(id);
      toast.success('Budget deleted successfully');
      setDeleteConfirmId(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'exceeded':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'exceeded':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Budgets</h2>
          <p className="text-gray-500 dark:text-gray-400">Set and track your monthly spending limits</p>
        </div>
        {availableCategories.length > 0 && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Budget
          </button>
        )}
      </div>

      {/* Overview Cards */}
      {overview && budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Budget</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">${overview.totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">${overview.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                overview.remaining >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                <TrendingUp className={`w-5 h-5 ${overview.remaining >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                <p className={`text-lg font-bold ${overview.remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {overview.remaining >= 0 ? '' : '-'}${Math.abs(overview.remaining).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <PieChart className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Overall Usage</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{overview.overallPercentage}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Summary */}
      {overview && budgets.length > 0 && (
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            {overview.onTrackCount} On Track
          </div>
          {overview.warningCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {overview.warningCount} Warning
            </div>
          )}
          {overview.exceededCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {overview.exceededCount} Exceeded
            </div>
          )}
        </div>
      )}

      {/* Budgets List */}
      {budgets.length === 0 ? (
        <div className={`p-12 rounded-2xl border text-center ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-500/10 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No budgets yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create your first budget to start tracking your spending limits
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${
                isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_ICONS[budget.category] || '📦'}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{budget.category}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Budget</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(budget)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(budget.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    ${budget.spent.toLocaleString()} spent
                  </span>
                  <span className={`font-medium ${getStatusColor(budget.status)}`}>
                    {budget.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(budget.status)} transition-all duration-500`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Budget: ${budget.amount.toLocaleString()}
                </span>
                <span className={budget.remaining >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {budget.remaining >= 0 ? `$${budget.remaining.toLocaleString()} left` : `$${Math.abs(budget.remaining).toLocaleString()} over`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-md rounded-2xl ${isDark ? 'bg-dark-800' : 'bg-white'} p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingBudget ? 'Edit Budget' : 'Create Budget'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                {editingBudget ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-dark-700 rounded-xl">
                    <span className="text-xl">{CATEGORY_ICONS[formData.category] || '📦'}</span>
                    <span className="text-gray-800 dark:text-white font-medium">{formData.category}</span>
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select category</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_ICONS[cat] || '📦'} {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Limit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="500.00"
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition"
              >
                {editingBudget ? 'Update Budget' : 'Create Budget'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirmId(null)} />
          <div className={`relative w-full max-w-sm rounded-2xl ${isDark ? 'bg-dark-800' : 'bg-white'} p-6`}>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                Delete Budget?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This will remove the budget and stop tracking for this category.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-dark-600 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
