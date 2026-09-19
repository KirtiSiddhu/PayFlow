import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, refreshWallet, refreshNotifications, setUnreadCount, unreadCount } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      newSocket.emit('setup', user._id);
    });

    newSocket.on('connected', () => {
      setIsConnected(true);
    });

    // Real-time Event Listeners
    newSocket.on('WALLET_UPDATE', async (data) => {
      if (data.message) {
        toast.success(data.message, { id: 'socket-wallet' });
      }
      await refreshWallet();
    });

    newSocket.on('NEW_NOTIFICATION', async (data) => {
      if (data.title && data.message) {
        toast(
          (t) => (
            <div>
              <p className="font-bold">{data.title}</p>
              <p className="text-sm">{data.message}</p>
            </div>
          ),
          { icon: '🔔', id: 'socket-notif' }
        );
      }
      await refreshNotifications();
      // Optimistically update count if fetch is slow
      setUnreadCount(prev => prev + 1);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (ctx === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return ctx;
};
