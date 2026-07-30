import React, { useState } from 'react';
import { Brain, Lightbulb, Shield, FileText, AlertOctagon, Clock } from 'lucide-react';

const suggestions = [
  {
    icon: <Shield className="w-5 h-5 text-blue-400" />,
    title: "Add CCTV Footage as Evidence",
    description: "Cases with video evidence are resolved 3x faster. Check nearby shops or ATMs for available footage.",
    tag: "Evidence Tip",
    tagColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: <FileText className="w-5 h-5 text-emerald-400" />,
    title: "Include Witness Contact Information",
    description: "Complaints with verified witness statements have a 78% higher resolution rate.",
    tag: "Case Strength",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: <AlertOctagon className="w-5 h-5 text-amber-400" />,
    title: "Document All Physical Evidence",
    description: "Photograph any physical items (damaged property, injuries) immediately as they may change over time.",
    tag: "Urgent Action",
    tagColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: <Clock className="w-5 h-5 text-purple-400" />,
    title: "Follow Up After 48 Hours",
    description: "If no update is received within 48 hours, visit the station directly with your complaint ID.",
    tag: "Follow-Up",
    tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: <Lightbulb className="w-5 h-5 text-rose-400" />,
    title: "Preserve Digital Evidence",
    description: "Take screenshots of any threatening messages, fraudulent emails or suspicious social media profiles before they are deleted.",
    tag: "Digital Safety",
    tagColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
  {
    icon: <Brain className="w-5 h-5 text-cyan-400" />,
    title: "Use Specific Dates & Times",
    description: "Complaints with precise incident timestamps help police officers cross-reference patrol records effectively.",
    tag: "AI Tip",
    tagColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
];

const SmartSuggestions = () => {
  const [dismissed, setDismissed] = useState([]);

  const visible = suggestions.filter((_, i) => !dismissed.includes(i));

  return (
    <div className="glass-effect rounded-2xl p-8 border border-slate-800/50">
      <div className="mb-8 border-b border-slate-800/50 pb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Smart Suggestions</h2>
          <p className="text-slate-400">AI-powered tips to strengthen your complaint and improve resolution odds.</p>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800/50">
          <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-300">All Caught Up!</h3>
          <p className="text-slate-500 mt-2">You have reviewed all current suggestions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((s, i) => (
            <div
              key={i}
              className="group bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all hover:bg-slate-800/30 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    {s.icon}
                  </div>
                  <h3 className="text-white font-bold text-sm leading-tight">{s.title}</h3>
                </div>
                <button
                  onClick={() => setDismissed(prev => [...prev, suggestions.indexOf(s)])}
                  className="text-slate-600 hover:text-slate-400 text-lg leading-none shrink-0"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{s.description}</p>
              <span className={`self-start text-xs font-semibold px-2 py-1 rounded border ${s.tagColor}`}>
                {s.tag}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;
