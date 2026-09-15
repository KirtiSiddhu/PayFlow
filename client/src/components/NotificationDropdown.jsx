import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { Bell, Check, CheckCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const typeIcons = {
  MONEY_RECEIVED: '💰',
  MONEY_SENT: '📤',
  DEPOSIT_SUCCESS: '✅',
  DEPOSIT_FAILED: '❌',
  WITHDRAWAL_SUCCESS: '🏦',
  WITHDRAWAL_FAILED: '❌',
  MONEY_REQUEST_RECEIVED: '📨',
  MONEY_REQUEST_ACCEPTED: '🎉',
  MONEY_REQUEST_REJECTED: '❌',
  ACCOUNT_BLOCKED: '🚫',
  PASSWORD_CHANGED: '🔐',
  SUSPICIOUS_ACTIVITY: '⚠️',
  GENERAL: '📢',
};

const NotificationDropdown = ({ onClose }) => {
  const { notifications, unreadCount, refreshNotifications } = useAuth();
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest('#notification-bell')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      await refreshNotifications();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      await refreshNotifications();
    } catch {}
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-fade-in overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary-600" />
          <span className="font-semibold text-gray-900 text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-primary-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-primary-50/30' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{typeIcons[n.type] || '📢'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <button
          onClick={() => { navigate('/notifications'); onClose(); }}
          className="w-full text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center justify-center gap-1 transition-colors"
        >
          View all notifications
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
