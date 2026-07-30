import React, { useContext } from 'react';
import { 
  LayoutDashboard, FileText, List, Search, Upload, 
  Brain, Mic, Image as ImageIcon, MessageSquare, Lightbulb,
  Bell, Scale, Calendar, Settings, LogOut, UserSearch, FileCheck
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const NavItem = ({ icon: Icon, label, id, activeTab, setActiveTab }) => {
  const active = activeTab === id;
  return (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.15)]' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useContext(AuthContext);

  return (
    <aside className="w-64 fixed inset-y-0 left-0 bg-[#020617] border-r border-slate-800/50 hidden lg:flex flex-col z-20">
      <div className="p-6">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          IPCMS Portal
        </h2>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Citizen Dashboard</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main</p>
          <NavItem icon={LayoutDashboard} label="Dashboard" id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem icon={FileText} label="New Complaint" id="new_complaint" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem icon={List} label="My Complaints" id="my_complaints" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem icon={Search} label="Track Complaint" id="track_complaint" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem icon={Upload} label="Evidence Upload" id="evidence_upload" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Services */}
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Services</p>
          <NavItem icon={FileCheck} label="Police Verification" id="apply_verification" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem icon={List} label="Verification Status" id="verification_status" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* AI Features */}
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
            <Brain className="w-3 h-3 mr-2" /> AI Features
          </p>
          <NavItem icon={Brain} label="Category Prediction" id="category_prediction" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem icon={Mic} label="Voice Complaint" id="voice_complaint" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem icon={ImageIcon} label="Image Analysis" id="image_analysis" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem icon={MessageSquare} label="Chatbot Assistant" id="chatbot" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem icon={Lightbulb} label="Smart Suggestions" id="smart_suggestions" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Missing Persons */}
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Missing Persons</p>
          <NavItem icon={UserSearch} label="Report Missing" id="missing_report" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem icon={List} label="My Reports" id="missing_track" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Other */}
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System</p>
          <NavItem icon={Bell} label="Notifications" id="notifications" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem icon={Scale} label="Court Updates" id="court_updates" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem icon={Calendar} label="Hearing Calendar" id="hearing_calendar" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem icon={Settings} label="Profile Settings" id="settings" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

      <div className="p-4 border-t border-slate-800/50">
        <button 
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
