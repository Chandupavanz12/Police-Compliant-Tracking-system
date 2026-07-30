import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Scale, AlertOctagon, CheckCircle2 } from 'lucide-react';

const CitizenNotifications = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/complaints/user');
        setComplaints(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Generate notification objects based on complaint states
  const generateNotifications = () => {
    const notifs = [];
    complaints.forEach(c => {
      // Court update notification
      if (c.courtStatus && c.courtStatus !== 'Not applicable') {
        notifs.push({
          id: `${c._id}-court`,
          title: `Court Update: ${c.category}`,
          message: c.courtStatus,
          time: new Date(c.updatedAt || c.dateFiled).toLocaleString(),
          icon: <Scale className="w-5 h-5 text-purple-400" />,
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30'
        });
      }
      // Status update notification
      if (c.status !== 'Filed') {
        notifs.push({
          id: `${c._id}-status`,
          title: `Status Changed: ${c.category}`,
          message: `Your complaint is now marked as "${c.status}" by the ${c.station}.`,
          time: new Date(c.updatedAt || c.dateFiled).toLocaleString(),
          icon: <CheckCircle2 className="w-5 h-5 text-blue-400" />,
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30'
        });
      }
      // Escalation notification
      if (c.isEscalated) {
        notifs.push({
          id: `${c._id}-escalate`,
          title: `Escalation Active: ${c.category}`,
          message: `Admin has been notified. Current admin response: ${c.escalationWarning}`,
          time: new Date(c.updatedAt || c.dateFiled).toLocaleString(),
          icon: <AlertOctagon className="w-5 h-5 text-red-400" />,
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30'
        });
      }
    });

    // Sort by most recent (this is an approximation since we use updatedAt)
    return notifs.reverse(); 
  };

  const notifications = generateNotifications();

  return (
    <div className="glass-effect rounded-2xl p-8 border border-slate-800/50">
      <div className="mb-8 border-b border-slate-800/50 pb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
          <Bell className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Action Center</h2>
          <p className="text-slate-400">System notifications and judicial updates for your complaints.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-center py-8">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800/50">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No New Notifications</h3>
          <p className="text-slate-500 mt-2">You will be alerted here when police or courts update your cases.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n, i) => (
            <div key={n.id + i} className={`p-4 rounded-xl border ${n.bgColor} ${n.borderColor} flex items-start gap-4 transition-all hover:bg-opacity-50`}>
              <div className="shrink-0 mt-1">{n.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-white font-bold text-sm">{n.title}</h4>
                  <span className="text-xs text-slate-500">{n.time}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitizenNotifications;
