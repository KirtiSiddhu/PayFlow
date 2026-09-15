import { ArrowUpRight, ArrowDownLeft, Wallet, RefreshCcw, HandCoins } from 'lucide-react';
import { Link } from 'react-router-dom';

const typeConfig = {
  DEPOSIT: { icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-100', sign: '+' },
  TRANSFER: { icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-100', sign: '-' },
  RECEIVED: { icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-100', sign: '+' },
  WITHDRAWAL: { icon: Wallet, color: 'text-gray-600', bg: 'bg-gray-100', sign: '-' },
  REFUND: { icon: RefreshCcw, color: 'text-blue-600', bg: 'bg-blue-100', sign: '+' },
  REQUEST: { icon: HandCoins, color: 'text-amber-600', bg: 'bg-amber-100', sign: '' },
};

const statusConfig = {
  COMPLETED: 'badge-success',
  PENDING: 'badge-warning',
  FAILED: 'badge-error',
  CANCELLED: 'badge-pending',
};

const TransactionCard = ({ transaction, showDate = false }) => {
  if (!transaction) return null;

  const config = typeConfig[transaction.type] || typeConfig.TRANSFER;
  const Icon = config.icon;
  const statusBadge = statusConfig[transaction.status] || 'badge-pending';

  return (
    <Link to={`/transactions/${transaction._id}`} className="block hover:bg-gray-50 rounded-xl transition-colors p-3 -mx-3">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}>
          <Icon className={config.color} size={24} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {transaction.description || transaction.type}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${statusBadge}`}>
              {transaction.status}
            </span>
            {showDate && (
              <span className="text-xs text-gray-500">
                {new Date(transaction.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className={`font-bold ${config.color}`}>
            {config.sign}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default TransactionCard;
