import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Shield, ShieldAlert, ShieldCheck, ShieldX, AlertTriangle,
  Lock, Eye, RefreshCw, CheckCircle2, Activity, Cpu,
  Fingerprint, Key, Ban, Loader2, ChevronDown
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TOKEN = () => localStorage.getItem('token');

const THREAT_COLOR = {
  LOW:      { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  MEDIUM:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  HIGH:     { bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  text: 'text-orange-400',  dot: 'bg-orange-400' },
  CRITICAL: { bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-400',     dot: 'bg-red-400' },
};

const ACTIVITY_LABELS = {
  FAILED_LOGIN:         { label: 'Failed Login',         icon: '🔑' },
  FACE_MISMATCH:        { label: 'Face Mismatch',         icon: '🚨' },
  FACE_VERIFIED:        { label: 'Face Verified',         icon: '✅' },
  UNAUTHORIZED_ACCESS:  { label: 'Unauthorized Access',   icon: '🚫' },
  BRUTE_FORCE_DETECTED: { label: 'Brute Force Detected',  icon: '⚡' },
  USER_BLOCKED:         { label: 'User Blocked',          icon: '🛑' },
  SUCCESSFUL_LOGIN:     { label: 'Successful Login',      icon: '✔' },
  SUSPICIOUS_REQUEST:   { label: 'Suspicious Request',    icon: '⚠' },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const SecStatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className={`rounded-2xl p-5 border ${color.border} ${color.bg} flex justify-between items-center`}>
    <div>
      <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color.text}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
    <div className={`w-12 h-12 rounded-xl ${color.bg} border ${color.border} flex items-center justify-center`}>
      <Icon className={`w-6 h-6 ${color.text}`} />
    </div>
  </div>
);

// ─── Status Indicator ────────────────────────────────────────────────────────
const StatusIndicator = ({ label, active }) => (
  <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-slate-900 border border-slate-800">
    <span className="text-sm text-slate-300 font-medium">{label}</span>
    <span className={`flex items-center gap-1.5 text-xs font-bold ${active ? 'text-emerald-400' : 'text-red-400'}`}>
      <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
      {active ? 'ACTIVE' : 'INACTIVE'}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const SecurityMonitoringPanel = () => {
  const [stats, setStats]       = useState(null);
  const [logs, setLogs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [page, setPage]         = useState(1);
  const LIMIT = 20;

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const headers = { Authorization: `Bearer ${TOKEN()}` };
      const params  = { page, limit: LIMIT };
      if (filterType)  params.activityType  = filterType;
      if (filterLevel) params.threatLevel    = filterLevel;

      const [sRes, lRes] = await Promise.all([
        axios.get('http://localhost:5000/api/security/stats', { headers }),
        axios.get('http://localhost:5000/api/security/logs',  { headers, params }),
      ]);
      setStats(sRes.data);
      setLogs(lRes.data.logs);
      setTotal(lRes.data.total);
    } catch (err) {
      console.error('[Security Panel]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, filterType, filterLevel]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResolve = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/security/logs/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${TOKEN()}` }
      });
      setLogs(prev => prev.map(l => l._id === id ? { ...l, status: 'RESOLVED' } : l));
    } catch (err) {
      alert('Failed to resolve log.');
    }
  };

  const pages = Math.ceil(total / LIMIT);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      <p className="text-slate-400 text-sm">Loading security data…</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Security Monitoring</h3>
            <p className="text-slate-500 text-xs">Real-time intrusion detection & threat intelligence</p>
          </div>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SecStatCard
          label="Failed Logins"
          value={stats?.failedLogins}
          icon={Ban}
          color={THREAT_COLOR.HIGH}
          sub="Total attempts"
        />
        <SecStatCard
          label="Face Mismatches"
          value={stats?.faceMismatches}
          icon={Fingerprint}
          color={THREAT_COLOR.CRITICAL}
          sub="Biometric alerts"
        />
        <SecStatCard
          label="Blocked Users"
          value={stats?.blockedUsers}
          icon={ShieldX}
          color={THREAT_COLOR.MEDIUM}
          sub="Temporarily blocked"
        />
        <SecStatCard
          label="Intrusion Alerts"
          value={stats?.intrusionAlerts}
          icon={ShieldAlert}
          color={THREAT_COLOR.CRITICAL}
          sub="High-threat events"
        />
      </div>

      {/* ── Security Status Indicators ──────────────────────────────────────── */}
      <div className="glass-effect rounded-2xl border border-slate-800/50 p-5 space-y-3">
        <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-emerald-400" /> System Security Status
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatusIndicator label="🛡 IDS: Intrusion Detection" active={true} />
          <StatusIndicator label="🔬 Face Authentication"      active={true} />
          <StatusIndicator label="🔐 JWT Token Security"       active={true} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <StatusIndicator label="🔒 bcrypt Password Hashing"  active={true} />
          <StatusIndicator label="⚡ Rate Limiting (IDS)"      active={true} />
          <StatusIndicator label="📋 Security Audit Logging"   active={true} />
        </div>
      </div>

      {/* ── Threat Logs ────────────────────────────────────────────────────── */}
      <div className="glass-effect rounded-2xl border border-slate-800/50 overflow-hidden">
        {/* Table header + filters */}
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-purple-400" />
            <h4 className="font-bold text-white">Threat Log</h4>
            <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">{total} total</span>
          </div>
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            {/* Activity type filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setPage(1); }}
                className="appearance-none bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-8 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="">All Events</option>
                {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            {/* Threat level filter */}
            <div className="relative">
              <select
                value={filterLevel}
                onChange={e => { setFilterLevel(e.target.value); setPage(1); }}
                className="appearance-none bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-8 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="">All Levels</option>
                {['LOW','MEDIUM','HIGH','CRITICAL'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs">
                <th className="p-4 text-left">Threat Type</th>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">IP Address</th>
                <th className="p-4 text-left">Level</th>
                <th className="p-4 text-left">Time</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500/40" />
                    No security events found.
                  </td>
                </tr>
              ) : logs.map(log => {
                const act  = ACTIVITY_LABELS[log.activityType] || { label: log.activityType, icon: '?' };
                const thr  = THREAT_COLOR[log.threatLevel] || THREAT_COLOR.LOW;
                const time = new Date(log.createdAt);
                return (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <span className="flex items-center gap-2">
                        <span className="text-base">{act.icon}</span>
                        <span className="text-slate-200 font-medium text-xs">{act.label}</span>
                      </span>
                      {log.details && <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[180px]">{log.details}</p>}
                    </td>
                    <td className="p-4">
                      <div className="text-slate-300 text-xs font-mono">{log.username}</div>
                      <div className="text-slate-500 text-xs capitalize">{log.role}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-400 text-xs">{log.ipAddress}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${thr.border} ${thr.bg} ${thr.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${thr.dot}`} />
                        {log.threatLevel}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-xs whitespace-nowrap">
                      <div>{time.toLocaleDateString()}</div>
                      <div className="text-slate-500">{time.toLocaleTimeString()}</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        log.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        log.status === 'BLOCKED'  ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {log.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleResolve(log._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold rounded-lg transition-colors ml-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800">
            <span className="text-xs text-slate-500">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs rounded-lg border border-slate-700 transition-colors"
              >
                ← Prev
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs rounded-lg border border-slate-700 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Security Legend ─────────────────────────────────────────────────── */}
      <div className="glass-effect rounded-2xl border border-slate-800/50 p-5">
        <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
          <Key className="w-3.5 h-3.5" /> Threat Level Legend
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { level: 'LOW',      desc: 'Routine events — no immediate action needed.' },
            { level: 'MEDIUM',   desc: 'Possible misuse — monitor activity.' },
            { level: 'HIGH',     desc: 'Active threat — investigate promptly.' },
            { level: 'CRITICAL', desc: 'Imminent breach — take action immediately.' },
          ].map(({ level, desc }) => {
            const c = THREAT_COLOR[level];
            return (
              <div key={level} className={`rounded-xl p-3 border ${c.border} ${c.bg}`}>
                <p className={`text-xs font-bold ${c.text} mb-1`}>{level}</p>
                <p className="text-slate-500 text-xs">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SecurityMonitoringPanel;
