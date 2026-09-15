import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Wallet, Send, HandCoins, ArrowDownToLine,
  Receipt, User, Bell, LogOut, Shield, Users, FileText, ClipboardList,
  Zap, ChevronRight
} from 'lucide-react';

const userLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/wallet', icon: Wallet, label: 'My Wallet' },
  { to: '/send', icon: Send, label: 'Send Money' },
  { to: '/request', icon: HandCoins, label: 'Request Money' },
  { to: '/withdraw', icon: ArrowDownToLine, label: 'Withdraw' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/transactions', icon: FileText, label: 'Transactions' },
  { to: '/admin/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
];

const Sidebar = ({ admin = false, onClose }) => {
  const { user, wallet, logout, unreadCount } = useAuth();
  const navigate = useNavigate();

  const links = admin ? adminLinks : userLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white h-full flex flex-col border-r border-gray-100 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">PayWave</h1>
            <p className="text-xs text-gray-400">{admin ? 'Admin Panel' : 'Digital Wallet'}</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.profileImage ? (
              <img src={`http://localhost:5000${user.profileImage}`} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-700 font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
            {!admin && wallet && (
              <p className="text-xs text-gray-500 font-medium">
                ₹{wallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            )}
            {admin && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600">
                <Shield className="w-3 h-3" />
                {user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
            <span className="flex-1">{label}</span>
            {label === 'Notifications' && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Switch panel link */}
      {user && (
        <div className="px-4 pb-2">
          {admin ? (
            <NavLink to="/dashboard" className="sidebar-link text-xs">
              <LayoutDashboard size={16} />
              User Dashboard
              <ChevronRight size={14} className="ml-auto opacity-50" />
            </NavLink>
          ) : (
            ['admin', 'superadmin'].includes(user.role) && (
              <NavLink to="/admin/dashboard" className="sidebar-link text-xs">
                <Shield size={16} />
                Admin Panel
                <ChevronRight size={14} className="ml-auto opacity-50" />
              </NavLink>
            )
          )}
        </div>
      )}

      {/* Logout */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="w-full sidebar-link text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
