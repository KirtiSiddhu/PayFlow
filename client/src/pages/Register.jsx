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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-8">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Create an account</h2>
            <p className="text-center text-gray-500 mb-8">Join PayWave and start managing your money.</p>

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
                    placeholder="Strong password"
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
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={authLoading}
                  />
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
          </div>
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
