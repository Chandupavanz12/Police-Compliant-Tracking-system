import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, UserSearch, CheckCircle, AlertOctagon, Clock } from 'lucide-react';

const MissingPersonTrack = ({ setActiveTab }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/missing/user');
      setReports(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const statusConfig = {
    'Searching': { color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', icon: <Clock className="w-4 h-4" /> },
    'Found': { color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', icon: <CheckCircle className="w-4 h-4" /> },
    'Closed': { color: 'text-slate-400 border-slate-500/30 bg-slate-500/10', icon: <AlertOctagon className="w-4 h-4" /> },
  };

  if (loading) return (
    <div className="flex justify-center items-center h-60"><RefreshCw className="w-8 h-8 text-amber-400 animate-spin" /></div>
  );

  return (
    <div className="glass-effect rounded-2xl p-8 border border-slate-800/50">
      <div className="flex justify-between items-end mb-8 border-b border-slate-800/50 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">My Missing Person Reports</h2>
          <p className="text-slate-400">Real-time status updates from police stations across the network.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetch} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={()=>setActiveTab('missing_report')} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors">
            + New Report
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800/50">
          <UserSearch className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No Reports Filed</h3>
          <p className="text-slate-500 mt-2 mb-6">File a missing person report to alert all police stations instantly.</p>
          <button onClick={()=>setActiveTab('missing_report')} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors">
            Report Missing Person
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map(r => {
            const cfg = statusConfig[r.status] || statusConfig['Searching'];
            return (
              <div key={r._id} className={`rounded-2xl border overflow-hidden ${r.status === 'Found' ? 'border-emerald-500/30 bg-emerald-900/5' : 'border-slate-700/50 bg-slate-900/30'}`}>
                <div className="p-6 flex gap-6">
                  {r.photoUrl && (
                    <img
                      src={`http://localhost:5000/${r.photoUrl.replace(/\\/g,'/')}`}
                      alt={r.name}
                      className="w-28 h-28 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{r.reportId}</span>
                        <h3 className="text-xl font-bold text-white mt-1">{r.name}</h3>
                        <p className="text-slate-400 text-sm">{r.age} yrs · {r.gender} · Contact: {r.contactNumber}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.color}`}>
                        {cfg.icon} {r.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                      <div className="bg-black/20 rounded-lg p-3">
                        <span className="text-xs text-slate-500 block mb-1">Last Seen Location</span>
                        <span className="text-slate-200">{r.lastSeenLocation}</span>
                        <span className="text-slate-400 text-xs block mt-0.5">{new Date(r.lastSeenDate).toLocaleString()}</span>
                      </div>
                      <div className="bg-black/20 rounded-lg p-3">
                        <span className="text-xs text-slate-500 block mb-1">Filed At Jurisdiction</span>
                        <span className="text-slate-200">{r.station || '—'}</span>
                        <span className="text-slate-400 text-xs block mt-0.5">{r.taluk}, {r.district}</span>
                      </div>
                    </div>

                    {r.status === 'Found' && (
                      <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl">
                        <p className="text-emerald-400 font-bold mb-1">✅ Person Located!</p>
                        <p className="text-emerald-200 text-sm">Found by: <strong>{r.foundBy}</strong></p>
                        {r.foundDetails && <p className="text-emerald-200/80 text-sm mt-1">{r.foundDetails}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MissingPersonTrack;
