import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, Loader2, User, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const { login, user, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'user') {
      setEmail('arjun@example.com');
      setPassword('User@1234');
    } else {
      setEmail('superadmin@paywave.com');
      setPassword('SuperAdmin@123');
    }
  }, [role]);

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Image / Branding */}
        <div 
          className="md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden"
          style={{
            backgroundImage: "linear-gradient(to bottom, rgba(13, 148, 136, 0.8), rgba(4, 47, 46, 0.9)), url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight shadow-sm">PayWave</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-md">
              The future of digital payments.
            </h1>
            <p className="text-teal-50 text-lg max-w-sm drop-shadow">
              Send, receive, and manage your money globally with zero hassle.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Choose your role to log in with demo credentials.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${
                role === 'user' 
                  ? 'border-primary-600 bg-primary-50 text-primary-700' 
                  : 'border-gray-100 hover:border-gray-200 text-gray-500'
              }`}
            >
              <User className="mb-2" size={24} />
              <span className="font-semibold text-sm">User Login</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${
                role === 'admin' 
                  ? 'border-primary-600 bg-primary-50 text-primary-700' 
                  : 'border-gray-100 hover:border-gray-200 text-gray-500'
              }`}
            >
              <ShieldCheck className="mb-2" size={24} />
              <span className="font-semibold text-sm">Admin Login</span>
            </button>
          </div>

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

            <button
              type="submit"
              disabled={authLoading}
              className="btn-primary w-full justify-center mt-6"
            >
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Log In as ${role === 'user' ? 'User' : 'Admin'}`}
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
