import { useState } from 'react';
import { Menu, X, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onMenuClick, title = '' }) => {
  const { unreadCount } = useAuth();
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      {title && (
        <h1 className="text-lg font-bold text-gray-900 hidden sm:block">{title}</h1>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative">
          <button
            id="notification-bell"
            onClick={() => setShowNotif((v) => !v)}
            className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {showNotif && (
            <NotificationDropdown onClose={() => setShowNotif(false)} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
