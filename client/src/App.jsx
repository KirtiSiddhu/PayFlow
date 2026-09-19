import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';

// User pages
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import SendMoney from './pages/SendMoney';
import RequestMoney from './pages/RequestMoney';
import Withdraw from './pages/Withdraw';
import Transactions from './pages/Transactions';
import TransactionDetails from './pages/TransactionDetails';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import AdminTransactions from './pages/admin/AdminTransactions';
import AuditLogs from './pages/admin/AuditLogs';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/send" element={<SendMoney />} />
                <Route path="/request" element={<RequestMoney />} />
                <Route path="/withdraw" element={<Withdraw />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/transactions/:id" element={<TransactionDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route element={<Layout admin />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<Users />} />
                <Route path="/admin/transactions" element={<AdminTransactions />} />
                <Route path="/admin/audit-logs" element={<AuditLogs />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
