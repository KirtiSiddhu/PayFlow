import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { walletAPI } from '../services/api';
import { Building2, ArrowDownToLine, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Withdraw = () => {
  const { wallet, refreshWallet } = useAuth();
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || !bankAccount) return;

    if (Number(amount) > wallet.balance) {
      return toast.error('Insufficient wallet balance');
    }

    setLoading(true);
    try {
      const res = await walletAPI.withdraw({ amount: Number(amount), bankAccount });
      toast.success(res.data.message);
      setAmount('');
      setBankAccount('');
      await refreshWallet();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="page-title">Withdraw Money</h1>

      <div className="card">
        <form onSubmit={handleWithdraw} className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">Available Balance</span>
            <span className="text-lg font-bold text-gray-900">
              ₹{wallet?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <label className="input-label">Amount (₹)</label>
            <input
              type="number"
              min="10"
              required
              className="input-field text-3xl font-bold text-center py-6"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="input-label">Bank Account Number (Demo)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                className="input-field pl-11"
                placeholder="Enter any account number"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              For demo purposes, any string is accepted. No real bank transfer will occur.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !amount || !bankAccount}
            className="btn-primary w-full justify-center py-4 text-lg"
          >
            {loading ? (
              <><Loader2 className="animate-spin" /> Processing...</>
            ) : (
              <><ArrowDownToLine size={20} /> Withdraw ₹{amount || '0'}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Withdraw;
