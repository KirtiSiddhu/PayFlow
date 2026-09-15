import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestAPI, userAPI } from '../services/api';
import { Search, HandCoins, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const RequestMoney = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('new'); // new, pending, history
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  // New Request State
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== 'new') {
      fetchRequests();
    }
  }, [activeTab]);

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

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await requestAPI.getRequests({
        status: activeTab === 'pending' ? 'PENDING' : ''
      });
      setRequests(res.data.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!selectedUser || !amount) return;

    setLoading(true);
    try {
      const res = await requestAPI.createRequest({
        recipientId: selectedUser._id,
        amount: Number(amount),
        note
      });
      toast.success(res.data.message);
      setSelectedUser(null);
      setAmount('');
      setNote('');
      setSearch('');
      setActiveTab('pending');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'accept') await requestAPI.acceptRequest(id);
      else if (action === 'reject') await requestAPI.rejectRequest(id);
      else if (action === 'cancel') await requestAPI.cancelRequest(id);
      
      toast.success(`Request ${action}ed`);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="page-title">Request Money</h1>

      <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'new' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          New Request
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'pending' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'history' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          History
        </button>
      </div>

      <div className="card">
        {activeTab === 'new' && (
          <div className="animate-fade-in max-w-xl mx-auto">
            {!selectedUser ? (
              <div>
                <label className="input-label mb-3">Who do you want to request money from?</label>
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="input-field pl-11"
                    placeholder="Search by name, email or phone"
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
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleRequest} className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Requesting from</p>
                      <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedUser(null)} className="text-sm font-semibold text-primary-600">Change</button>
                </div>

                <div>
                  <label className="input-label">Amount (₹)</label>
                  <input
                    type="number" min="1" required
                    className="input-field text-3xl font-bold text-center py-6"
                    placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Note (Optional)</label>
                  <input
                    type="text" className="input-field"
                    placeholder="What's this for?" value={note} onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading || !amount} className="btn-primary w-full justify-center py-4">
                  {loading ? <Loader2 className="animate-spin" /> : <><HandCoins size={20} /> Request ₹{amount || '0'}</>}
                </button>
              </form>
            )}
          </div>
        )}

        {(activeTab === 'pending' || activeTab === 'history') && (
          <div className="animate-fade-in">
            {loadingRequests ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
            ) : requests.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No requests found</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {requests.map(req => {
                  const isReceived = req.recipient._id === user._id;
                  const otherUser = isReceived ? req.requester : req.recipient;
                  
                  return (
                    <div key={req._id} className="py-4 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isReceived ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                          <HandCoins size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {isReceived ? `${otherUser.name} requested` : `You requested from ${otherUser.name}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{req.note || 'No note'}</p>
                          <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                            req.status === 'PENDING' ? 'badge-warning' : 
                            req.status === 'ACCEPTED' ? 'badge-success' : 
                            req.status === 'REJECTED' ? 'badge-error' : 'badge-pending'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right ml-auto pl-16 sm:pl-0">
                        <p className="font-bold text-gray-900 text-lg mb-2">₹{req.amount.toLocaleString()}</p>
                        
                        {req.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            {isReceived ? (
                              <>
                                <button onClick={() => handleAction(req._id, 'accept')} className="btn-success py-1.5 px-3 text-xs">
                                  <CheckCircle2 size={14}/> Pay
                                </button>
                                <button onClick={() => handleAction(req._id, 'reject')} className="btn-secondary py-1.5 px-3 text-xs text-red-600 hover:text-red-700">
                                  <XCircle size={14}/> Reject
                                </button>
                              </>
                            ) : (
                              <button onClick={() => handleAction(req._id, 'cancel')} className="btn-secondary py-1.5 px-3 text-xs">
                                Cancel
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestMoney;
