import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { walletAPI } from '../services/api';
import BalanceCard from '../components/BalanceCard';
import { CreditCard, Smartphone, Building, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const amounts = [100, 500, 1000, 2000, 5000];
const methods = [
  { id: 'DEMO_CARD', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'DEMO_UPI', name: 'UPI', icon: Smartphone },
  { id: 'DEMO_BANK', name: 'Net Banking', icon: Building },
];

const Wallet = () => {
  const { wallet, refreshWallet } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('DEMO_UPI');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) < 10) return toast.error('Minimum amount is ₹10');
    
    setLoading(true);
    
    // Simulate payment gateway delay
    toast.loading('Processing payment...', { id: 'payment' });
    await new Promise(r => setTimeout(r, 2000));
    
    try {
      const res = await walletAPI.deposit({ amount: Number(amount), paymentMethod: method });
      toast.success(res.data.message, { id: 'payment' });
      setAmount('');
      await refreshWallet();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed', { id: 'payment' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="page-title">My Wallet</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <BalanceCard wallet={wallet} />
          
          <div className="card mt-6">
            <h3 className="font-bold text-gray-900 mb-4">Wallet Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Status</span>
                <span className={`font-semibold capitalize ${wallet?.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {wallet?.status}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Currency</span>
                <span className="font-semibold">{wallet?.currency}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Opened On</span>
                <span className="font-semibold">
                  {wallet?.createdAt && new Date(wallet.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Add Money</h2>
          <p className="text-sm text-gray-500 mb-6">Top up your PayWave wallet instantly.</p>

          <form onSubmit={handleDeposit} className="space-y-6">
            <div>
              <label className="input-label">Amount (₹)</label>
              <input
                type="number"
                min="10"
                step="1"
                required
                className="input-field text-2xl font-bold text-center py-4"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
              
              <div className="flex flex-wrap gap-2 mt-3">
                {amounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className="flex-1 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-colors text-sm font-semibold text-gray-700"
                    disabled={loading}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label mb-3">Payment Method (Demo)</label>
              <div className="space-y-2">
                {methods.map(({ id, name, icon: Icon }) => (
                  <label
                    key={id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      method === id ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={id}
                      checked={method === id}
                      onChange={(e) => setMethod(e.target.value)}
                      className="hidden"
                      disabled={loading}
                    />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      method === id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <span className={`font-semibold ${method === id ? 'text-primary-900' : 'text-gray-700'}`}>
                      {name}
                    </span>
                    <div className="ml-auto">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        method === id ? 'border-primary-600' : 'border-gray-300'
                      }`}>
                        {method === id && <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !amount || Number(amount) < 10}
              className="btn-primary w-full justify-center py-4 text-lg"
            >
              {loading ? (
                <><Loader2 className="animate-spin" /> Processing...</>
              ) : (
                `Pay ₹${amount || '0'}`
              )}
            </button>
            <p className="text-xs text-center text-gray-400">
              This is a demo payment gateway. No real money will be deducted.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
