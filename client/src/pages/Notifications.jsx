import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const typeIcons = {
  MONEY_RECEIVED: '💰', MONEY_SENT: '📤',
  DEPOSIT_SUCCESS: '✅', DEPOSIT_FAILED: '❌',
  WITHDRAWAL_SUCCESS: '🏦', WITHDRAWAL_FAILED: '❌',
  MONEY_REQUEST_RECEIVED: '📨', MONEY_REQUEST_ACCEPTED: '🎉', MONEY_REQUEST_REJECTED: '❌',
  ACCOUNT_BLOCKED: '🚫', PASSWORD_CHANGED: '🔐', SUSPICIOUS_ACTIVITY: '⚠️', GENERAL: '📢',
};

const Notifications = () => {
  const { refreshNotifications } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getNotifications({ page, limit: 20 });
      const newNotifs = res.data.data.notifications;
      if (page === 1) setNotifications(newNotifs);
      else setNotifications(prev => [...prev, ...newNotifs]);
      
      setHasMore(res.data.data.pagination.page < res.data.data.pagination.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      await refreshNotifications();
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      await refreshNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Notifications</h1>
        <button 
          onClick={handleMarkAllRead}
          className="btn-secondary py-2 text-sm flex items-center gap-2"
        >
          <CheckCheck size={16} /> Mark all read
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading && page === 1 ? (
          <div className="p-8 text-center animate-pulse text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(n => (
              <div 
                key={n._id} 
                onClick={() => !n.isRead && handleMarkRead(n._id)}
                className={`p-4 sm:p-6 flex gap-4 transition-colors cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-primary-50/30' : ''}`}
              >
                <div className="text-2xl pt-1">{typeIcons[n.type] || '📢'}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-semibold text-gray-900">{n.title}</h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1 text-sm">{n.message}</p>
                </div>
                {!n.isRead && (
                  <div className="flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-600"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {hasMore && (
          <div className="p-4 border-t border-gray-100 text-center">
            <button 
              onClick={() => setPage(p => p + 1)}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
