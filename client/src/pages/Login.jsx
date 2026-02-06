import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, AlertCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4 transition-colors">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">FinSense AI</span>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">AI-Powered Financial Tracking</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl dark:shadow-none border border-gray-200 dark:border-dark-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Welcome back</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">
              Sign up
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              <strong>Demo:</strong> demo@finsense.com / demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
