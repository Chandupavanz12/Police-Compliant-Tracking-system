import React from 'react';
import { Shield, Lock, Activity, CheckCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/5 py-12 mt-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Left: Project Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-6 h-6 text-blue-500" />
              <span className="font-bold text-lg text-slate-200">IPCMS</span>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Intelligent Police Complaint Management System.<br/>
              All rights reserved.
            </p>
          </div>

          {/* Center: Badges */}
          <div className="flex justify-center gap-6">
            <div className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-blue-500/50 transition-colors">
                <Lock className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
              </div>
              <span className="text-xs text-slate-400 group-hover:text-slate-300">Secure</span>
            </div>
            
            <div className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-emerald-500/50 transition-colors">
                <CheckCircle className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" />
              </div>
              <span className="text-xs text-slate-400 group-hover:text-slate-300">Reliable</span>
            </div>

            <div className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-purple-500/50 transition-colors">
                <Activity className="w-5 h-5 text-slate-400 group-hover:text-purple-400" />
              </div>
              <span className="text-xs text-slate-400 group-hover:text-slate-300">Transparent</span>
            </div>
          </div>

          {/* Right: Version */}
          <div className="flex justify-center md:justify-end">
            <div className="px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
              Version 1.0.0
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
