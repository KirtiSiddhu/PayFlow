import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import BalanceCard from '../components/BalanceCard';
import TransactionCard from '../components/TransactionCard';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user, wallet } = useAuth();
  const [recentTxns, setRecentTxns] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await transactionAPI.getTransactions({ limit: 5 });
        setRecentTxns(res.data.data.transactions);
        
        // Generate mock chart data for demo based on wallet stats
        const data = [];
        let currentBalance = wallet?.balance || 0;
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          data.push({
            name: date.toLocaleDateString('en-IN', { weekday: 'short' }),
            balance: currentBalance - (Math.random() * 1000) * i,
          });
        }
        setChartData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (wallet) fetchDashboardData();
  }, [wallet]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">Here's your financial overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <BalanceCard wallet={wallet} />
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="card p-4 bg-emerald-50 border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <TrendingUp size={16} />
                <span className="text-sm font-semibold">Total In</span>
              </div>
              <p className="text-xl font-bold text-emerald-700">
                ₹{wallet?.totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="card p-4 bg-red-50 border-red-100">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <TrendingDown size={16} />
                <span className="text-sm font-semibold">Total Out</span>
              </div>
              <p className="text-xl font-bold text-red-700">
                ₹{wallet?.totalSent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <div className="card h-72 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-primary-600" size={20} />
              <h2 className="font-bold text-gray-900 text-lg">Activity (Last 7 Days)</h2>
            </div>
            <div className="flex-1 w-full h-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Balance']}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Recent Transactions</h2>
              <Link to="/transactions" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
              </div>
            ) : recentTxns.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {recentTxns.map((txn) => (
                  <TransactionCard key={txn._id} transaction={txn} showDate={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions yet.</p>
                <Link to="/wallet" className="btn-primary inline-flex mt-4">Add Money</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
