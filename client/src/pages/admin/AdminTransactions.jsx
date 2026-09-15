import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import TransactionTable from '../../components/TransactionTable';
import { Search } from 'lucide-react';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  useEffect(() => { fetchTransactions(); }, [page, type]);
  useEffect(() => { const t = setTimeout(() => { setPage(1); fetchTransactions(); }, 500); return () => clearTimeout(t); }, [search]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllTransactions({ page, limit: 15, search, type });
      setTransactions(res.data.data.transactions);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="page-title">All System Transactions</h1>
      <div className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <input type="text" className="input-field pl-10" placeholder="Search ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All Types</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>
        <TransactionTable transactions={transactions} loading={loading} />
        {pagination.pages > 1 && (
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1 px-3">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages} className="btn-secondary py-1 px-3">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminTransactions;
