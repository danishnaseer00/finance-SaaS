import { useState, useEffect } from 'react';
import {
  Wallet,
  Building2,
  CreditCard,
  PiggyBank,
  Smartphone,
  Plus,
  MoreVertical,
  Edit2,
  Archive,
  ArchiveRestore,
  Trash2,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  EyeOff,
} from 'lucide-react';
import { accountService } from '../services/finance';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const ACCOUNT_TYPES = [
  { value: 'CASH', label: 'Cash', icon: Wallet, color: '#22c55e' },
  { value: 'BANK', label: 'Bank Account', icon: Building2, color: '#3b82f6' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard, color: '#ef4444' },
  { value: 'SAVINGS', label: 'Savings', icon: PiggyBank, color: '#8b5cf6' },
  { value: 'WALLET', label: 'Digital Wallet', icon: Smartphone, color: '#f59e0b' },
];

const ACCOUNT_COLORS = [
  '#8b5cf6', '#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'
];

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [totals, setTotals] = useState({ totalBalance: 0, activeCount: 0, archivedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'BANK',
    openingBalance: '',
    currency: 'USD',
    color: '#8b5cf6',
  });
  const { isDark } = useTheme();

  useEffect(() => {
    fetchAccounts();
  }, [showArchived]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params = showArchived ? { status: 'ARCHIVED' } : { status: 'ACTIVE' };
      const response = await accountService.getAll(params);
      setAccounts(response.data.accounts);
      setTotals(response.data.totals);
    } catch (error) {
      toast.error('Failed to load accounts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        openingBalance: parseFloat(formData.openingBalance) || 0,
      };
      
      if (editingAccount) {
        await accountService.update(editingAccount.id, payload);
        toast.success('Account updated successfully');
      } else {
        await accountService.create(payload);
        toast.success('Account created successfully');
      }
      
      setShowModal(false);
      setEditingAccount(null);
      resetForm();
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save account');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      openingBalance: account.openingBalance.toString(),
      currency: account.currency,
      color: account.color || '#8b5cf6',
    });
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleToggleArchive = async (account) => {
    try {
      await accountService.toggleArchive(account.id);
      toast.success(account.status === 'ACTIVE' ? 'Account archived' : 'Account restored');
      fetchAccounts();
    } catch (error) {
      toast.error('Failed to update account');
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (id) => {
    try {
      await accountService.delete(id);
      toast.success('Account deleted successfully');
      fetchAccounts();
    } catch (error) {
      toast.error('Failed to delete account');
    }
    setDeleteConfirmId(null);
    setOpenMenuId(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'BANK',
      openingBalance: '',
      currency: 'USD',
      color: '#8b5cf6',
    });
  };

  const openCreateModal = () => {
    setEditingAccount(null);
    resetForm();
    setShowModal(true);
  };

  const getAccountTypeInfo = (type) => {
    return ACCOUNT_TYPES.find(t => t.value === type) || ACCOUNT_TYPES[0];
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Accounts
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage your financial accounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
              showArchived
                ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                : isDark
                  ? 'border-gray-700 text-gray-400 hover:border-gray-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {showArchived ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Account
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} border ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Balance</span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(totals.totalBalance)}
          </p>
        </div>

        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} border ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-green-500/20">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Accounts</span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {totals.activeCount}
          </p>
        </div>

        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} border ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gray-500/20">
              <Archive className="w-5 h-5 text-gray-400" />
            </div>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Archived</span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {totals.archivedCount}
          </p>
        </div>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} border ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
          <Wallet className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {showArchived ? 'No archived accounts' : 'No accounts yet'}
          </h3>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {showArchived ? 'Archived accounts will appear here' : 'Create your first account to start tracking'}
          </p>
          {!showArchived && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Account
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const typeInfo = getAccountTypeInfo(account.type);
            const IconComponent = typeInfo.icon;
            const balanceDiff = account.currentBalance - account.openingBalance;
            
            return (
              <div
                key={account.id}
                className={`relative p-6 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} border ${isDark ? 'border-gray-700/50' : 'border-gray-100'} hover:border-purple-500/50 transition-all group`}
              >
                {/* Account Color Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: account.color || typeInfo.color }}
                />
                
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${account.color || typeInfo.color}20` }}
                    >
                      <IconComponent
                        className="w-6 h-6"
                        style={{ color: account.color || typeInfo.color }}
                      />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {account.name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {typeInfo.label}
                      </p>
                    </div>
                  </div>
                  
                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === account.id ? null : account.id)}
                      className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <MoreVertical className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    
                    {openMenuId === account.id && (
                      <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-10 ${
                        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}>
                        <button
                          onClick={() => handleEdit(account)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                            isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleArchive(account)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                            isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {account.status === 'ACTIVE' ? (
                            <>
                              <Archive className="w-4 h-4" />
                              Archive
                            </>
                          ) : (
                            <>
                              <ArchiveRestore className="w-4 h-4" />
                              Restore
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(account.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Balance */}
                <div className="mb-4">
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(account.currentBalance, account.currency)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {balanceDiff !== 0 && (
                      <span className={`flex items-center text-sm ${
                        balanceDiff >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {balanceDiff >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {formatCurrency(Math.abs(balanceDiff), account.currency)}
                      </span>
                    )}
                    <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      from opening balance
                    </span>
                  </div>
                </div>
                
                {/* Footer */}
                <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Last updated: {formatDate(account.updatedAt)}
                  </p>
                </div>
                
                {/* Status Badge */}
                {account.status === 'ARCHIVED' && (
                  <div className="absolute top-4 right-12">
                    <span className="px-2 py-1 text-xs rounded-lg bg-gray-500/20 text-gray-400">
                      Archived
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-md rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingAccount ? 'Edit Account' : 'Create Account'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., Main Checking Account"
                  required
                />
              </div>
              
              {/* Account Type */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ACCOUNT_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                          formData.type === type.value
                            ? 'border-purple-500 bg-purple-500/10'
                            : isDark
                              ? 'border-gray-700 hover:border-gray-600'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: formData.type === type.value ? '#8b5cf6' : type.color }}
                        />
                        <span className={`text-sm ${
                          formData.type === type.value
                            ? 'text-purple-400'
                            : isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Opening Balance */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Opening Balance (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="0.00"
                />
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
              >
                {editingAccount ? 'Update Account' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirmId(null)} />
          <div className={`relative w-full max-w-sm rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Delete Account?
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                This action cannot be undone. Are you sure you want to delete this account?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className={`flex-1 py-2 px-4 rounded-xl border ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-xl hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  );
};

export default Accounts;
