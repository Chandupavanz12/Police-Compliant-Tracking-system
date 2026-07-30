import React from 'react';
import { PlusCircle, Upload, Mic, MessageSquare } from 'lucide-react';

const ActionButton = ({ icon: Icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-2xl glass-effect border border-slate-800 hover:bg-slate-800/50 transition-all duration-300 group`}
  >
    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <span className="text-sm font-medium text-slate-300 group-hover:text-white text-center">{label}</span>
  </button>
);

const QuickActions = ({ setActiveTab }) => {
  return (
    <div className="glass-effect rounded-2xl p-6 border border-slate-800/50">
      <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        <ActionButton icon={PlusCircle} label="File Complaint" color="bg-blue-500/10 text-blue-400" onClick={() => setActiveTab('new_complaint')} />
        <ActionButton icon={Upload} label="Upload Evidence" color="bg-emerald-500/10 text-emerald-400" onClick={() => setActiveTab('evidence_upload')} />
        <ActionButton icon={Mic} label="Voice Report" color="bg-purple-500/10 text-purple-400" onClick={() => setActiveTab('voice_complaint')} />
        <ActionButton icon={MessageSquare} label="AI Assistant" color="bg-amber-500/10 text-amber-400" onClick={() => setActiveTab('chatbot')} />
      </div>
    </div>
  );
};

export default QuickActions;
