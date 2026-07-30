import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck } from 'lucide-react';

const SafetyTips = () => {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ai/tips');
        setTip(response.data);
      } catch (error) {
        console.error("Error fetching safety tip:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTip();
  }, []);

  return (
    <div className="glass-effect rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-transparent">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">AI Safety Tip</h3>
      </div>
      
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
          <div className="h-3 w-full bg-slate-800 rounded"></div>
          <div className="h-3 w-4/5 bg-slate-800 rounded"></div>
        </div>
      ) : (
        <div>
          <h4 className="text-white font-semibold mb-2">{tip.title}</h4>
          <p className="text-slate-400 text-sm leading-relaxed">{tip.content}</p>
        </div>
      )}
    </div>
  );
};

export default SafetyTips;
