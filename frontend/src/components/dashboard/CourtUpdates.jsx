import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Scale, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';

const CourtUpdates = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/complaints/user');
        setComplaints(res.data.filter(c => c.courtStatus && c.courtStatus !== 'Not applicable'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="glass-effect rounded-2xl p-8 border border-slate-800/50">
      <div className="mb-8 border-b border-slate-800/50 pb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
          <Scale className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Court & Judicial Updates</h2>
          <p className="text-slate-400">Track judicial proceedings and court hearings for your cases.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-amber-400 animate-spin" /></div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800/50">
          <Scale className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No Court Updates Yet</h3>
          <p className="text-slate-500 mt-2">Court updates will appear here once a police officer adds judicial status to your case.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map(c => (
            <div key={c._id} className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{c.complaintId}</span>
                    <h4 className="text-white font-bold mt-1">{c.category} — {c.title}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.statusColor}`}>{c.status}</span>
                </div>
                <div className="flex items-start gap-2 mt-2 bg-amber-900/10 border border-amber-500/20 p-3 rounded-lg">
                  <Calendar className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-200">{c.courtStatus}</p>
                </div>
                <p className="text-xs text-slate-500 mt-2">Jurisdiction: {c.station}, {c.district}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourtUpdates;
