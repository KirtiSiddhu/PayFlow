import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Clock } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getAuditLogs({ page, limit: 20 });
        setLogs(res.data.data.logs);
        setPagination(res.data.data.pagination);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <h1 className="page-title">System Audit Logs</h1>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header py-3 px-4">Time</th>
                <th className="table-header py-3 px-4">Action</th>
                <th className="table-header py-3 px-4">Description</th>
                <th className="table-header py-3 px-4">User/Admin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map(log => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{log.description}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 font-mono">{log.ipAddress || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1 px-3">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages} className="btn-secondary py-1 px-3">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AuditLogs;
