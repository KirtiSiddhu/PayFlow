import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Download } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTxn = async () => {
      try {
        const res = await transactionAPI.getTransaction(id);
        setTxn(res.data.data);
      } catch (error) {
        navigate('/transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTxn();
  }, [id, navigate]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!txn) return null;

  const isPositive = ['DEPOSIT', 'RECEIVED', 'REFUND'].includes(txn.type);
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="card relative overflow-hidden">
        {/* Receipt Header */}
        <div className="text-center pb-8 border-b border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-gray-50">
            {txn.status === 'COMPLETED' ? <CheckCircle2 className="text-emerald-500 w-8 h-8" /> : 
             txn.status === 'FAILED' ? <XCircle className="text-red-500 w-8 h-8" /> : 
             <Clock className="text-amber-500 w-8 h-8" />}
          </div>
          <h1 className={`text-4xl font-bold mb-2 ${isPositive ? 'text-emerald-600' : 'text-gray-900'}`}>
            {isPositive ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h1>
          <p className="text-gray-500 font-medium">
            {txn.status === 'COMPLETED' ? 'Successful' : txn.status === 'FAILED' ? 'Failed' : 'Pending'} {txn.type.toLowerCase()}
          </p>
        </div>

        {/* Receipt Body */}
        <div className="py-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Transaction Details</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-mono font-medium text-gray-900">{txn.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date & Time</span>
                <span className="font-medium text-gray-900">
                  {new Date(txn.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Description</span>
                <span className="font-medium text-gray-900">{txn.description}</span>
              </div>
            </div>
          </div>

          {(txn.sender || txn.receiver) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {txn.type === 'RECEIVED' ? 'From' : 'To'}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                  {(txn.type === 'RECEIVED' ? txn.sender : txn.receiver)?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{(txn.type === 'RECEIVED' ? txn.sender : txn.receiver)?.name}</p>
                  <p className="text-sm text-gray-500">{(txn.type === 'RECEIVED' ? txn.sender : txn.receiver)?.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cutout shapes for receipt effect */}
        <div className="absolute top-[180px] -left-4 w-8 h-8 bg-gray-50 rounded-full" />
        <div className="absolute top-[180px] -right-4 w-8 h-8 bg-gray-50 rounded-full" />

        <div className="pt-6 border-t border-dashed border-gray-300">
          <button 
            onClick={() => window.print()}
            className="btn-secondary w-full justify-center"
          >
            <Download size={18} /> Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
