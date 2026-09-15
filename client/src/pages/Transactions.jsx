import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import TransactionTable from '../components/TransactionTable';
import { Filter, Search } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  
  // Filters
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    fetchTransactions();
  }, [page, type, status, sort]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchTransactions();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionAPI.getTransactions({
        page, limit: 15, type, status, search, sort
      });
      setTransactions(res.data.data.transactions);
      setPagination(res.data.data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="page-title">Transaction History</h1>

      <div className="card space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search ID or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="input-field" 
            value={type} 
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="TRANSFER">Send</option>
            <option value="RECEIVED">Receive</option>
          </select>

          <select 
            className="input-field" 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {/* Table */}
        <TransactionTable transactions={transactions} loading={loading} />

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-1.5 px-3 text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary py-1.5 px-3 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
