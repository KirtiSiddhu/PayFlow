import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionAPI, userAPI } from '../services/api';
import { Search, Send, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SendMoney = () => {
  const { wallet, refreshWallet } = useAuth();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.length >= 3) {
        setIsSearching(true);
        try {
          const res = await userAPI.searchUsers(search);
          setSearchResults(res.data.data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser || !amount) return;

    if (Number(amount) > wallet.balance) {
      return toast.error('Insufficient wallet balance');
    }

    setLoading(true);
    try {
      const res = await transactionAPI.sendMoney({
        recipientId: selectedUser._id,
        amount: Number(amount),
        note
      });
      toast.success(res.data.message);
      await refreshWallet();
      navigate('/transactions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send money');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="page-title">Send Money</h1>

      <div className="card">
        {!selectedUser ? (
          <div>
            <label className="input-label mb-3">Who do you want to send money to?</label>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input-field pl-11"
                placeholder="Search by name, email, phone or Wallet ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                {searchResults.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => setSelectedUser(u)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 text-left transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email} • {u.phone}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {search.length >= 3 && searchResults.length === 0 && !isSearching && (
              <p className="text-center text-gray-500 py-4 border border-gray-100 rounded-xl">No users found</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sending to</p>
                  <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                Change
              </button>
            </div>

            <div>
              <label className="input-label">Amount (₹)</label>
              <input
                type="number"
                min="1"
                required
                className="input-field text-3xl font-bold text-center py-6"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
              <p className="text-center text-sm text-gray-500 mt-2">
                Available balance: ₹{wallet?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div>
              <label className="input-label">Note (Optional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="What's this for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !amount}
              className="btn-primary w-full justify-center py-4 text-lg"
            >
              {loading ? (
                <><Loader2 className="animate-spin" /> Processing...</>
              ) : (
                <><Send size={20} /> Send ₹{amount || '0'}</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SendMoney;
