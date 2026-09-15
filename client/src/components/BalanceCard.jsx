import { useState } from 'react';
import { Eye, EyeOff, Wallet, ArrowUpRight, ArrowDownLeft, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';

const BalanceCard = ({ wallet }) => {
  const [showBalance, setShowBalance] = useState(true);

  if (!wallet) return null;

  return (
    <div className="card bg-gradient-to-br from-primary-900 to-primary-800 text-white border-0 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-500/20 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-primary-100">
            <Wallet size={20} />
            <span className="font-medium">Total Balance</span>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors"
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            {showBalance ? `₹${wallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '••••••••'}
          </h2>
          <p className="text-primary-200 mt-2 text-sm font-medium">Wallet ID: {wallet.walletId}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/wallet" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5">
            <Banknote size={16} />
            Add
          </Link>
          <Link to="/send" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5">
            <ArrowUpRight size={16} />
            Send
          </Link>
          <Link to="/request" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5">
            <ArrowDownLeft size={16} />
            Request
          </Link>
          <Link to="/withdraw" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5">
            <Wallet size={16} />
            Withdraw
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
