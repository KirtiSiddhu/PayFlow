import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, walletAPI, notificationAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem('paywave_token');
    const storedUser = localStorage.getItem('paywave_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        loadUserData();
      } catch {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      const [meRes, notifRes] = await Promise.allSettled([
        authAPI.getMe(),
        notificationAPI.getNotifications({ limit: 10 }),
      ]);

      if (meRes.status === 'fulfilled') {
        const { user: u, wallet: w } = meRes.value.data.data;
        setUser(u);
        setWallet(w);
        localStorage.setItem('paywave_user', JSON.stringify(u));
      }

      if (notifRes.status === 'fulfilled') {
        const { notifications: n, unreadCount: uc } = notifRes.value.data.data;
        setNotifications(n);
        setUnreadCount(uc);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    try {
      const res = await walletAPI.getWallet();
      setWallet(res.data.data);
    } catch (err) {
      console.error('Failed to refresh wallet:', err);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const res = await notificationAPI.getNotifications({ limit: 10 });
      const { notifications: n, unreadCount: uc } = res.data.data;
      setNotifications(n);
      setUnreadCount(uc);
    } catch (err) {
      console.error('Failed to refresh notifications:', err);
    }
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token, user: u } = res.data.data;
      localStorage.setItem('paywave_token', token);
      localStorage.setItem('paywave_user', JSON.stringify(u));
      setUser(u);
      await loadUserData();
      toast.success(`Welcome back, ${u.name.split(' ')[0]}! 👋`);
      return { success: true, role: u.role };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (formData) => {
    setAuthLoading(true);
    try {
      const res = await authAPI.register(formData);
      const { token, user: u } = res.data.data;
      localStorage.setItem('paywave_token', token);
      localStorage.setItem('paywave_user', JSON.stringify(u));
      setUser(u);
      await loadUserData();
      toast.success('Account created successfully! 🎉');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (_) {}
    localStorage.removeItem('paywave_token');
    localStorage.removeItem('paywave_user');
    setUser(null);
    setWallet(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{
      user,
      wallet,
      notifications,
      unreadCount,
      loading,
      authLoading,
      isAdmin,
      isSuperAdmin,
      login,
      register,
      logout,
      refreshWallet,
      refreshNotifications,
      loadUserData,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
