import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Users, Wallet, Activity, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TransactionTable from '../../components/TransactionTable';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTxns, setRecentTxns] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, txnRes] = await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getAllTransactions({ limit: 5 })
        ]);
        setData(dashRes.data.data);
        setRecentTxns(txnRes.data.data.transactions);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-4 gap-6"><div className="h-32 bg-gray-200 rounded-xl" /><div className="h-32 bg-gray-200 rounded-xl" /><div className="h-32 bg-gray-200 rounded-xl" /><div className="h-32 bg-gray-200 rounded-xl" /></div>
    <div className="h-80 bg-gray-200 rounded-xl" />
  </div>;

  return (
    <div className="space-y-6">
      <h1 className="page-title">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users (Active)" 
          value={`${data.users.total} (${data.users.active})`}
          icon={Users} bgClass="bg-blue-50" colorClass="text-blue-600" 
        />
        <StatCard 
          title="System Wallet Balance" 
          value={`₹${data.wallet.totalBalance.toLocaleString()}`}
          icon={Wallet} bgClass="bg-emerald-50" colorClass="text-emerald-600" 
        />
        <StatCard 
          title="Transaction Volume" 
          value={`₹${data.transactions.volume.toLocaleString()}`}
          icon={TrendingUp} bgClass="bg-primary-50" colorClass="text-primary-600" 
        />
        <StatCard 
          title="Failed Transactions" 
          value={data.transactions.failed}
          icon={AlertTriangle} bgClass="bg-red-50" colorClass="text-red-600" 
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Daily Transactions (30 Days)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.dailyTransactions} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="_id" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="volume" stroke="#4f46e5" fill="url(#colorVol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Transaction Breakdown</h2>
          <div className="space-y-4">
            {data.transactions.byType.map(t => (
              <div key={t._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700">{t._id}</span>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{t.count}</p>
                  <p className="text-xs text-gray-500">₹{t.total.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Txns */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <Link to="/admin/transactions" className="text-sm font-semibold text-primary-600 flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <TransactionTable transactions={recentTxns} />
      </div>
    </div>
  );
};

export default AdminDashboard;
