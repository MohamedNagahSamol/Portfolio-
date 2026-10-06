import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LangSwitch from '../../components/LangSwitch';
import ThemeToggle from '../../components/ThemeToggle';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.message || t('admin_login_failed'));
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-stone-100 to-stone-200 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="absolute top-4 end-4 flex items-center gap-2">
        <LangSwitch />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-stone-200 dark:border-slate-800 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
              <Lock className="text-emerald-600 dark:text-emerald-400" size={28} />
            </div>
            <h1 className="text-2xl font-heading font-bold text-stone-900 dark:text-white">
              {t('admin_login_title')}
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              {t('admin_login_subtitle')}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                {t('admin_login_email')}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={18} />
                <input 
                  id="admin-email" 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  className="w-full ps-10 pe-4 py-2.5 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:text-white transition-all"
                  placeholder={t('admin_login_email_placeholder')} 
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                {t('admin_login_password')}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={18} />
                <input 
                  id="admin-password" 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full ps-10 pe-10 py-2.5 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:text-white transition-all"
                  placeholder={t('admin_login_password_placeholder')} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('admin_hide_password') : t('admin_show_password')}
                  aria-pressed={showPassword}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-all"
            >
              {loading ? t('admin_login_submitting') : t('admin_login_submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
