import { Link } from 'react-router-dom';

const statusConfig = {
  COMPLETED: 'badge-success',
  PENDING: 'badge-warning',
  FAILED: 'badge-error',
  CANCELLED: 'badge-pending',
};

const TransactionTable = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-medium">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="table-header py-3 px-4">Transaction ID</th>
            <th className="table-header py-3 px-4">Type</th>
            <th className="table-header py-3 px-4">Details</th>
            <th className="table-header py-3 px-4">Date</th>
            <th className="table-header py-3 px-4">Status</th>
            <th className="table-header py-3 px-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map((txn) => {
            const isPositive = ['DEPOSIT', 'RECEIVED', 'REFUND'].includes(txn.type);
            
            return (
              <tr key={txn._id} className="hover:bg-gray-50 transition-colors group">
                <td className="table-cell font-mono text-xs text-gray-500">
                  <Link to={`/transactions/${txn._id}`} className="hover:text-primary-600 hover:underline">
                    {txn.transactionId}
                  </Link>
                </td>
                <td className="table-cell">
                  <span className="font-medium text-gray-900">{txn.type}</span>
                </td>
                <td className="table-cell">
                  <p className="text-gray-900 line-clamp-1">{txn.description}</p>
                </td>
                <td className="table-cell text-gray-500">
                  {new Date(txn.createdAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td className="table-cell">
                  <span className={statusConfig[txn.status] || 'badge-pending'}>
                    {txn.status}
                  </span>
                </td>
                <td className={`table-cell text-right font-bold ${isPositive ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {isPositive ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
