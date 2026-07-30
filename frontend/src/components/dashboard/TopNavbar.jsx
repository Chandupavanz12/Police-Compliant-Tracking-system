import React, { useContext } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const TopNavbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className="h-20 glass-effect border-b border-slate-800/50 flex items-center justify-between px-8 sticky top-0 z-10 lg:pl-72">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name || user?.email?.split('@')[0]}</h1>
        <p className="text-sm text-slate-400">Here's what's happening with your cases today.</p>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative hidden md:block">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search complaints..." 
            className="w-64 bg-slate-900/50 border border-slate-700/50 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>

        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-[#020617]"></span>
        </button>

        <div className="flex items-center space-x-3 pl-6 border-l border-slate-800/50 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center p-[2px]">
            <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center group-hover:bg-transparent transition-colors">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
