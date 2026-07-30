import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, FileText } from 'lucide-react';

const RecentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/complaints/user');
        setComplaints(response.data);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div className="glass-effect rounded-2xl border border-slate-800/50 overflow-hidden">
      <div className="p-6 border-b border-slate-800/50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Recent Complaints</h3>
        <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 text-sm">
              <th className="px-6 py-4 font-medium">Complaint ID</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date Filed</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-800 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-800 rounded-full"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-800 rounded-lg"></div></td>
                </tr>
              ))
            ) : (
              complaints.slice(0, 5).map((item) => (
                <tr key={item._id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    {item.complaintId}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{item.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${item.statusColor ? item.statusColor.replace('text-', 'border-').split(' ')[0] : ''} ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{new Date(item.dateFiled).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentComplaints;
