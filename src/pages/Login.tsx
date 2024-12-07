import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, error, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Login failed:', err);
    }
  };

  if (loading) {
    return <div>{t('auth.login.loading')}</div>;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDFFFC] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <Link to="/" className="flex items-center text-[#011627] hover:text-[#2EC4B6] mb-8">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('auth.backToHome')}
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-[#011627]">{t('auth.login.title')}</h2>
            <p className="mt-2 text-sm text-[#011627]/70">
              {t('auth.login.noAccount')}{' '}
              <Link to="/signup" className="text-[#2EC4B6] hover:text-[#E71D36]">
              {t('auth.login.signUpLink')}
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#011627]">
                {t('auth.email')}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[#011627]/40" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#011627]">
                {t('auth.password')}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#011627]/40" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#2EC4B6] focus:ring-[#2EC4B6] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#011627]">
                {t('auth.login.rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="text-[#2EC4B6] hover:text-[#E71D36]">
                {t('auth.login.forgotPassword')}
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#E71D36] hover:bg-[#c91126] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2EC4B6]"
            >
              {t('auth.login.submit')}
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/shop-keeper.jpg"
          alt={t('auth.login.imageAlt')}
        />
      </div>
    </div>
  );
}