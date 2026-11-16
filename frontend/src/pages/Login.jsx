import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck, Heart } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick fill helper for review presentation
  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login({ email, password });
      
      // Redirect based on role
      const userRole = data.user.role;
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'donor') {
        navigate('/donor');
      } else {
        navigate('/requester');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to log in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-lg">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white mx-auto shadow-md shadow-red-500/20 mb-3">
            <Droplet className="w-7 h-7 fill-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome Back to LifeLink
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Sign in to access your donor dashboard, emergency requests, or admin panel.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Demo Fast Login Buttons */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 text-center">
            ⚡ Quick Demo Accounts (1-Click Fill)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@lifelink.com', 'Admin@123')}
              className="cursor-pointer py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-purple-700 flex flex-col items-center gap-0.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('john.carter@donor.com', 'Password@123')}
              className="cursor-pointer py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-red-700 flex flex-col items-center gap-0.5 transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-red-600" />
              <span>Donor (O-)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('robert@requester.com', 'Password@123')}
              className="cursor-pointer py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-blue-700 flex flex-col items-center gap-0.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Requester</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-2 hover:scale-101 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In to LifeLink</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-red-600 hover:text-red-700 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
