import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, FileText, AlertOctagon,
  UserSearch, BarChart3, LogOut, UserPlus, Bell, ChevronRight, X, Shield
} from 'lucide-react';
import { karnatakaData } from '../utils/karnatakaData';

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const navItems = [
  { id: 'dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'users',        label: 'Users',           icon: Users },
  { id: 'complaints',   label: 'Complaints',      icon: FileText },
  { id: 'escalations',  label: 'Escalations',     icon: AlertOctagon },
  { id: 'missing',      label: 'Missing Persons', icon: UserSearch },
  { id: 'register',     label: 'Register Officer',icon: UserPlus },
  { id: 'reports',      label: 'Generate Reports',icon: BarChart3 },
  { id: 'security',     label: 'Security Monitor',icon: Shield },
];

const Sidebar = ({ active, setActive, logout }) => (
  <aside className="w-56 fixed inset-y-0 left-0 bg-[#0d1117] border-r border-slate-800 flex flex-col z-20">
    <div className="p-5 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-purple-400" />
        <span className="font-bold text-white text-lg">Admin</span>
      </div>
    </div>
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActive(id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active === id
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Icon className="w-4 h-4" /> {label}
        </button>
      ))}
    </nav>
    <div className="p-3 border-t border-slate-800">
      <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  </aside>
);

// ─── Stats Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className={`rounded-2xl p-6 text-white flex justify-between items-center shadow-lg ${color}`}>
    <div>
      <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
      <p className="text-4xl font-bold">{value}</p>
    </div>
    <Icon className="w-12 h-12 opacity-20" />
  </div>
);

// ─── Dashboard Section ───────────────────────────────────────────────────────
const DashboardView = ({ complaints, users, policeList, setActive }) => {
  const [dismissUrgent, setDismissUrgent] = useState(false);

  const totalUsers     = users.length;
  const totalCases     = complaints.length;
  const resolved       = complaints.filter(c => c.status === 'Resolved').length;
  const solveRatio     = totalCases ? ((resolved / totalCases) * 100).toFixed(1) : '0.0';
  const escalated      = complaints.filter(c => c.isEscalated);
  const urgent         = complaints.filter(c => {
    const days = (Date.now() - new Date(c.dateFiled)) / 86400000;
    return days > 3 && c.status === 'Filed';
  });

  // Group overdue by station
  const overdueByStation = {};
  urgent.forEach(c => {
    const key = c.station || 'Unknown';
    if (!overdueByStation[key]) overdueByStation[key] = { count: 0, oldest: c.dateFiled };
    overdueByStation[key].count++;
    if (new Date(c.dateFiled) < new Date(overdueByStation[key].oldest))
      overdueByStation[key].oldest = c.dateFiled;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Welcome Back, Admin!</h1>

      {/* Urgent Banner */}
      {!dismissUrgent && urgent.length > 0 && (
        <div className="bg-amber-500/15 border border-amber-500/50 rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="font-bold text-amber-400 text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" /> {urgent.length} Urgent Pending
            </p>
            <p className="text-amber-300/70 text-sm">3+ days old complaints — no action taken yet</p>
            <span className="mt-2 inline-block bg-amber-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">3+ days old</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActive('complaints')} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-5 py-2 rounded-xl text-sm flex items-center gap-1">
              View Now <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setDismissUrgent(true)}><X className="w-5 h-5 text-amber-400" /></button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"    value={totalUsers}           color="bg-gradient-to-br from-rose-500 to-pink-700"     icon={Users} />
        <StatCard label="Police Officers" value={policeList.length}   color="bg-gradient-to-br from-blue-500 to-indigo-700"   icon={ShieldCheck} />
        <StatCard label="Total Cases"    value={totalCases}           color="bg-gradient-to-br from-emerald-500 to-green-700" icon={FileText} />
        <StatCard label="Solve Ratio"    value={`${solveRatio}%`}     color="bg-gradient-to-br from-orange-500 to-amber-700"  icon={BarChart3} />
      </div>

      {/* Escalation Banner */}
      {escalated.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="font-bold text-red-400">{escalated.length} Escalated Case{escalated.length > 1 ? 's' : ''}</p>
              <p className="text-red-300/70 text-sm">Citizens escalated these — issue warnings to the assigned stations.</p>
            </div>
          </div>
          <button onClick={() => setActive('escalations')} className="bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2 rounded-xl text-sm flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" /> Review Now
          </button>
        </div>
      )}

      {/* Overdue by Station Table */}
      <div className="glass-effect rounded-2xl border border-slate-800/50 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-400" /> Overdue Pending Cases by Station
            </h3>
            <p className="text-slate-500 text-sm">Cases pending 3+ days. Issue reminders to take action.</p>
          </div>
          {urgent.length > 0 && <span className="text-xs font-bold bg-red-500 text-white px-3 py-1 rounded-full">{urgent.length} total overdue</span>}
        </div>
        {Object.keys(overdueByStation).length === 0 ? (
          <div className="p-8 text-center text-slate-500">✅ No overdue cases right now.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="p-4 text-left">Station</th>
                <th className="p-4 text-left">Pending Cases</th>
                <th className="p-4 text-left">Oldest Case</th>
                <th className="p-4 text-left">Days Overdue</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {Object.entries(overdueByStation).map(([station, data]) => {
                const days = Math.floor((Date.now() - new Date(data.oldest)) / 86400000);
                return (
                  <tr key={station} className="hover:bg-slate-800/30">
                    <td className="p-4 text-white font-medium">{station}</td>
                    <td className="p-4"><span className="bg-amber-500 text-white font-bold text-xs px-2 py-0.5 rounded-full">{data.count}</span></td>
                    <td className="p-4 text-slate-400">{new Date(data.oldest).toLocaleDateString()}</td>
                    <td className="p-4"><span className="bg-red-600 text-white font-bold text-xs px-2 py-0.5 rounded-full">{days} days</span></td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => alert(`Reminder sent to ${station}`)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Bell className="w-3 h-3" /> Send Reminder
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export { DashboardView, Sidebar, StatCard };
