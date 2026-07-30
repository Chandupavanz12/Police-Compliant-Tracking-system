import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lightbulb, Calendar, ShieldAlert } from 'lucide-react';

const AiInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map icon strings to actual components
  const getIcon = (iconName) => {
    switch(iconName) {
      case 'ShieldAlert': return ShieldAlert;
      case 'Calendar': return Calendar;
      case 'Lightbulb': return Lightbulb;
      default: return Lightbulb;
    }
  };

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ai/insights');
        
        // Transform the response to map string icon names to actual Lucide components
        const transformedInsights = response.data.map(insight => ({
          ...insight,
          icon: getIcon(insight.icon)
        }));
        
        setInsights(transformedInsights);
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return (
    <div className="glass-effect rounded-2xl p-6 border border-slate-800/50">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-bold text-white">AI Insights & Alerts</h3>
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-800/30 animate-pulse border border-slate-700/50">
              <div className="w-10 h-10 rounded-full bg-slate-700 shrink-0"></div>
              <div className="w-full space-y-2">
                <div className="h-4 w-1/3 bg-slate-700 rounded"></div>
                <div className="h-3 w-3/4 bg-slate-700 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          insights.map((insight) => (
            <div key={insight.id} className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${insight.color}`}>
                <insight.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">{insight.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{insight.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AiInsights;
