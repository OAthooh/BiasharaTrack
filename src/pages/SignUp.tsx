import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { register, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ fullName: name, email, password });
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFFFC] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <Link to="/" className="flex items-center text-[#011627] hover:text-[#2EC4B6] mb-8">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-[#011627]">Create your account</h2>
            <p className="mt-2 text-sm text-[#011627]/70">
              Already have an account?{' '}
              <Link to="/login" className="text-[#2EC4B6] hover:text-[#E71D36]">
                Sign in
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
                <label htmlFor="name" className="block text-sm font-medium text-[#011627]">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#011627]/40" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#011627]">
                  Email address
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
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#011627]">
                  Password
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#E71D36] hover:bg-[#c91126] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2EC4B6]"
              >
                Create account
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/mama-mboga.jpg"
          alt="Market scene"
        />
      </div>
    </div>
  );
}