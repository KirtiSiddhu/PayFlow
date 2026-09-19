import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const { register, user, authLoading } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    const res = await register(formData);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row-reverse">
        
        {/* Right Side: Image / Branding */}
        <div className="md:w-1/2 gradient-success p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">PayWave</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Join the financial revolution.
            </h1>
            <p className="text-emerald-50 text-lg max-w-sm">
              Create an account in minutes and take full control of your wealth.
            </p>
          </div>
          
          {/* Abstract circles design */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -left-24 w-72 h-72 bg-emerald-500/30 rounded-full blur-2xl"></div>
        </div>

        {/* Left Side: Register Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h2>
          <p className="text-gray-500 mb-8">Join PayWave and start managing your money.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  className="input-field pl-11"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={authLoading}
                />
              </div>
            </div>

            <div>
              <label className="input-label">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="input-field pl-11"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={authLoading}
                />
              </div>
            </div>

            <div>
              <label className="input-label">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="input-field pl-11"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={authLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="input-field pl-11"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={authLoading}
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    className="input-field pl-11"
                    placeholder="Confirm"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={authLoading}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="btn-primary w-full justify-center mt-6"
            >
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
