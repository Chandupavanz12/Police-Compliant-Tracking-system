import React from 'react';
import { Shield } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="w-full bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Project Name */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/30">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                Intelligent Police Complaint
              </h1>
              <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">
                Management System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <a 
              href="#" 
              className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)]"
            >
              Home
            </a>
            <a 
              href="#" 
              className="px-5 py-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/5 font-medium text-sm transition-all duration-300"
            >
              About
            </a>
            <a 
              href="#" 
              className="px-5 py-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/5 font-medium text-sm transition-all duration-300"
            >
              Features
            </a>
            <a 
              href="#" 
              className="px-5 py-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/5 font-medium text-sm transition-all duration-300"
            >
              Contact
            </a>
          </div>

          {/* Mobile menu button (optional visual only) */}
          <div className="md:hidden flex items-center">
            <button className="text-slate-300 hover:text-white p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
