import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { transactionService } from '../services/finance';
import toast from 'react-hot-toast';

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Bonus', 'Other Income'],
  expense: [
    'Food',
    'Rent',
    'Utilities',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Education',
    'Other',
  ],
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    category: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getAll({
        page: pagination.page,
        ...filters,
      });
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, data);
        toast.success('Transaction updated');
      } else {
        await transactionService.create(data);
        toast.success('Transaction added');
      }

      setShowModal(false);
      resetForm();
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await transactionService.delete(id);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: parseFloat(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      date: new Date(transaction.date).toISOString().split('T')[0],
      notes: transaction.notes || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingTransaction(null);
    setFormData({
      amount: '',
      type: 'EXPENSE',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: '',
      category: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Transactions</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage your income and expenses</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {(filters.startDate || filters.endDate || filters.type || filters.category) && (
            <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 font-medium">
              Clear all
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
              >
                <option value="">All</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
              >
                <option value="">All</option>
                <optgroup label="Income">
                  {CATEGORIES.income.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </optgroup>
                <optgroup label="Expense">
                  {CATEGORIES.expense.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mb-2" />
            <p>No transactions found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {transaction.type === 'INCOME' ? (
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                              <ArrowUpCircle className="w-4 h-4 text-green-500" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                              <ArrowDownCircle className="w-4 h-4 text-red-500" />
                            </div>
                          )}
                          <span className={`font-medium ${transaction.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary-500/10 text-primary-500 dark:bg-primary-500/20">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">
                        ${parseFloat(transaction.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {transaction.notes || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(transaction)}
                            className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-dark-700">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {transaction.type === 'INCOME' ? (
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <ArrowUpCircle className="w-4 h-4 text-green-500" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                          <ArrowDownCircle className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/10 text-primary-500">
                        {transaction.category}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(transaction)}
                        className="p-2 text-gray-400 hover:text-primary-500 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${transaction.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}${parseFloat(transaction.amount).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                  </div>
                  {transaction.notes && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 truncate">{transaction.notes}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-dark-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm border border-gray-200 dark:border-dark-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-sm border border-gray-200 dark:border-dark-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md p-6 border border-gray-200 dark:border-dark-700 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-dark-600 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition font-medium"
                >
                  {editingTransaction ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
