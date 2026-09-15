import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Search, Shield, Ban, CheckCircle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Details Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, status]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchUsers(); }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ page, limit: 10, search, status });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (id) => {
    setDetailsLoading(true);
    try {
      const res = await adminAPI.getUserDetails(id);
      setUserDetails(res.data.data);
    } catch (error) {
      toast.error('Failed to load user details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAction = async (action, id) => {
    try {
      if (action === 'block') await adminAPI.blockUser(id);
      if (action === 'unblock') await adminAPI.unblockUser(id);
      if (action === 'freeze') await adminAPI.freezeWallet(id);
      if (action === 'unfreeze') await adminAPI.unfreezeWallet(id);
      
      toast.success('Action completed successfully');
      fetchUsers();
      if (userDetails) loadUserDetails(userDetails.user._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="page-title">User Management</h1>

      <div className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <input type="text" className="input-field pl-10" placeholder="Search name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header py-3 px-4">User</th>
                <th className="table-header py-3 px-4">Contact</th>
                <th className="table-header py-3 px-4">Status</th>
                <th className="table-header py-3 px-4">Joined</th>
                <th className="table-header py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900">{u.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-900">{u.email}</p>
                    <p className="text-xs text-gray-500">{u.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={u.isBlocked ? 'badge-error' : 'badge-success'}>{u.isBlocked ? 'Blocked' : 'Active'}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => { setSelectedUser(u); loadUserDetails(u._id); }}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selectedUser} onClose={() => { setSelectedUser(null); setUserDetails(null); }} title="User Details" maxWidth="max-w-2xl">
        {detailsLoading || !userDetails ? (
          <div className="py-12 text-center text-gray-500">Loading details...</div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{userDetails.user.name}</h3>
                <p className="text-gray-500">{userDetails.user.email} | {userDetails.user.phone}</p>
              </div>
              <span className={userDetails.user.isBlocked ? 'badge-error' : 'badge-success'}>
                {userDetails.user.isBlocked ? 'Blocked' : 'Active'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">₹{userDetails.wallet.balance.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">ID: {userDetails.wallet.walletId}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center gap-2">
                <button 
                  onClick={() => handleAction(userDetails.user.isBlocked ? 'unblock' : 'block', userDetails.user._id)}
                  className={`w-full py-2 rounded-lg font-semibold text-sm ${userDetails.user.isBlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                >
                  {userDetails.user.isBlocked ? 'Unblock Account' : 'Block Account'}
                </button>
                <button 
                  onClick={() => handleAction(userDetails.wallet.status === 'active' ? 'freeze' : 'unfreeze', userDetails.wallet._id)}
                  className={`w-full py-2 rounded-lg font-semibold text-sm ${userDetails.wallet.status !== 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                >
                  {userDetails.wallet.status === 'active' ? 'Freeze Wallet' : 'Unfreeze Wallet'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
