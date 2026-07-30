import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Scale, RefreshCw, Clock } from 'lucide-react';

const HearingCalendar = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/complaints/user');
        setComplaints(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();

  const caseTimeline = complaints.map(c => ({
    ...c,
    filed: new Date(c.dateFiled),
  })).sort((a, b) => b.filed - a.filed);

  return (
    <div className="glass-effect rounded-2xl p-8 border border-slate-800/50">
      <div className="mb-8 border-b border-slate-800/50 pb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Hearing Calendar</h2>
          <p className="text-slate-400">Timeline of your cases and upcoming judicial hearing dates.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" /></div>
      ) : (
        <div className="space-y-6">

          {/* Current Month Indicator */}
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-medium">Today: {today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {/* Case Timeline */}
          <h3 className="text-lg font-bold text-white mb-4">Case Activity Timeline</h3>
          {caseTimeline.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800/50">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No cases filed yet. Submit a complaint to see your timeline.</p>
            </div>
          ) : (
            <div className="relative pl-6 border-l border-slate-700 space-y-8">
              {caseTimeline.map((c, i) => (
                <div key={c._id} className="relative">
                  <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 border-slate-700 bg-[#020617] flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${c.status === 'Resolved' ? 'bg-emerald-400' : c.status === 'In Progress' ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
                  </div>
                  
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{c.complaintId}</span>
                        <h4 className="text-white font-bold mt-1">{c.category}</h4>
                        <p className="text-sm text-slate-400">{c.title}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold shrink-0 ${c.statusColor}`}>{c.status}</span>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-slate-500">
                      <span>📅 Filed: {c.filed.toLocaleDateString()}</span>
                      <span>📍 {c.station || 'Unassigned'}</span>
                    </div>
                    {c.courtStatus && c.courtStatus !== 'Not applicable' && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-amber-300 bg-amber-900/10 border border-amber-500/20 rounded-lg px-3 py-2">
                        <Scale className="w-3 h-3" /> {c.courtStatus}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HearingCalendar;
