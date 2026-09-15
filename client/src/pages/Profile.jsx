import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI } from '../services/api';
import { User as UserIcon, Camera, Loader2, Shield, Mail, Phone, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, loadUserData } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      if (fileInputRef.current.files[0]) {
        data.append('profileImage', fileInputRef.current.files[0]);
      }
      
      const res = await userAPI.updateProfile(data);
      toast.success(res.data.message);
      setIsEditing(false);
      await loadUserData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setPassLoading(true);
    try {
      const res = await authAPI.changePassword(passData);
      toast.success(res.data.message);
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="page-title">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Info & Edit */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                    {user?.profileImage ? (
                      <img src={`http://localhost:5000${user.profileImage}`} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={40} className="text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 shadow-md transition-colors"
                    >
                      <Camera size={14} />
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{user?.name}</h3>
                  <p className="text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="input-label">Full Name</label>
                  {isEditing ? (
                    <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <UserIcon size={18} className="text-gray-400" />
                      <span className="font-medium text-gray-900">{user?.name}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="input-label">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-70">
                    <Mail size={18} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{user?.email}</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Phone Number</label>
                  {isEditing ? (
                    <input type="text" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <Phone size={18} className="text-gray-400" />
                      <span className="font-medium text-gray-900">{user?.phone}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="input-label">Joined</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-70">
                    <Calendar size={18} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{new Date(user?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Col: Security */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="text-primary-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Security</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="input-label">Current Password</label>
                <input type="password" required className="input-field" value={passData.currentPassword} onChange={e => setPassData({...passData, currentPassword: e.target.value})} />
              </div>
              <div>
                <label className="input-label">New Password</label>
                <input type="password" required className="input-field" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Confirm New Password</label>
                <input type="password" required className="input-field" value={passData.confirmPassword} onChange={e => setPassData({...passData, confirmPassword: e.target.value})} />
              </div>
              <button type="submit" disabled={passLoading} className="btn-primary w-full justify-center">
                {passLoading ? <Loader2 className="animate-spin" /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
