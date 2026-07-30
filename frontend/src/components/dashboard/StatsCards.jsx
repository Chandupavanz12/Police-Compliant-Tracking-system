import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, loading }) => {
  const colors = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    yellow: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  };

  const theme = colors[color] || colors.blue;

  return (
    <div className={`glass-effect rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${theme.split(' ')[2]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${theme.split(' ')[1]}`}>
          <Icon className={`w-5 h-5 ${theme.split(' ')[0]}`} />
        </div>
      </div>
      
      {loading ? (
        <div className="h-10 w-24 bg-slate-800 rounded animate-pulse"></div>
      ) : (
        <div className="text-4xl font-bold text-white">{value}</div>
      )}
    </div>
  );
};

const StatsCards = () => {
  const [stats, setStats] = useState({ total: 0, inProgress: 0, resolved: 0, underReview: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard/stats');
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard title="Total Complaints" value={stats.total} icon={FileText} color="blue" loading={loading} />
      <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="yellow" loading={loading} />
      <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="green" loading={loading} />
      <StatCard title="Under Review" value={stats.underReview} icon={AlertTriangle} color="purple" loading={loading} />
    </div>
  );
};

export default StatsCards;
