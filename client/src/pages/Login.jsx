import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, authLoading } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      navigate(res.role === 'user' ? '/dashboard' : '/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-8">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Welcome back</h2>
            <p className="text-center text-gray-500 mb-8">Enter your details to access your wallet.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="input-label" htmlFor="email">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="input-field pl-11"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={authLoading}
                  />
                </div>
              </div>

              <div>
                <label className="input-label" htmlFor="password">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    className="input-field pl-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={authLoading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a href="#" className="font-semibold text-primary-600 hover:text-primary-700">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn-primary w-full justify-center mt-6"
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
              </button>
            </form>
          </div>
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials Alert */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-base">ℹ️</span> Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">User</p>
              <p className="opacity-80">arjun@example.com</p>
              <p className="opacity-80">User@1234</p>
            </div>
            <div>
              <p className="font-medium">Admin</p>
              <p className="opacity-80">superadmin@paywave.com</p>
              <p className="opacity-80">SuperAdmin@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
