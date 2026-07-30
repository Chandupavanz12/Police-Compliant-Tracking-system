import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LabelList,
} from 'recharts';

// ── Colour palette mapped to each status ──────────────────────────────────────
const STATUS_META = [
  { key: 'Filed',            label: 'Filed',             color: '#3b82f6' },  // blue
  { key: 'In Progress',      label: 'In Progress',       color: '#f59e0b' },  // amber
  { key: 'Under Review',     label: 'Under Review',      color: '#a855f7' },  // purple
  { key: 'Arrested Suspect', label: 'Arrested',          color: '#ef4444' },  // red
  { key: 'Case Closed',      label: 'Case Closed',       color: '#64748b' },  // slate
  { key: 'Resolved',         label: 'Resolved',          color: '#10b981' },  // emerald
];

// ── Custom tooltip for Bar chart ──────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-3 shadow-2xl text-sm">
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.fill }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.fill }} />
          {p.name}: <span className="font-bold ml-1">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── Custom tooltip for Pie chart ─────────────────────────────────────────────
const PieTooltipContent = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-3 shadow-2xl text-sm">
      <p className="font-bold text-white">{d.name}</p>
      <p style={{ color: d.payload.color }}>
        Count: <span className="font-bold">{d.value}</span>
      </p>
      <p className="text-slate-400">
        Share: <span className="font-bold text-white">{d.payload.pct}%</span>
      </p>
    </div>
  );
};

// ── Custom label renderer for Pie slices ──────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, pct }) => {
  if (pct < 5) return null;          // skip tiny slices
  const r  = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x  = cx + r * Math.cos(-midAngle * RADIAN);
  const y  = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight="bold">
      {pct}%
    </text>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * ComplaintsCharts
 *
 * Props
 *   complaints  – array of complaint objects
 *   title       – optional heading override
 *   accentColor – optional CSS colour for headings (default: '#a855f7' purple)
 */
const ComplaintsCharts = ({ complaints = [], title = 'Complaint Analytics', accentColor = '#a855f7' }) => {

  // ── Derive per-status counts ──────────────────────────────────────────────
  const statusData = useMemo(() => {
    const total = complaints.length || 1;
    return STATUS_META.map(({ key, label, color }) => {
      const count = complaints.filter(c => c.status === key).length;
      return { name: label, count, color, pct: +((count / total) * 100).toFixed(1) };
    }).filter(d => d.count > 0);
  }, [complaints]);

  // ── Derive per-category counts ────────────────────────────────────────────
  const categoryData = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      const k = c.category || 'Uncategorized';
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }, [complaints]);

  const CATEGORY_COLORS = [
    '#3b82f6','#a855f7','#10b981','#f59e0b','#ef4444',
    '#06b6d4','#ec4899','#84cc16','#f97316','#6366f1',
  ];

  if (complaints.length === 0) {
    return (
      <div className="glass-effect rounded-2xl border border-slate-800/50 p-8 text-center text-slate-400">
        No complaint data available to render charts.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <span className="w-1 h-6 rounded-full inline-block" style={{ background: accentColor }} />
        {title}
      </h2>

      {/* ── Row 1: Status Bar + Status Pie ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Status Bar Chart */}
        <div className="glass-effect rounded-2xl border border-slate-800/50 p-6">
          <h3 className="text-base font-bold text-white mb-1">Status Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Number of complaints per status</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="count" name="Complaints" radius={[6, 6, 0, 0]}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
                <LabelList dataKey="count" position="top"
                  style={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie Chart */}
        <div className="glass-effect rounded-2xl border border-slate-800/50 p-6">
          <h3 className="text-base font-bold text-white mb-1">Status Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Proportional share of each status</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={240}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={100}
                  innerRadius={45}
                  paddingAngle={3}
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex-1 space-y-2">
              {statusData.map(d => (
                <div key={d.name} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-slate-300 truncate">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-white">{d.count}</span>
                    <span className="text-slate-500 w-10 text-right">{d.pct}%</span>
                  </div>
                </div>
              ))}
              <div className="border-t border-slate-800 mt-2 pt-2 flex justify-between text-xs">
                <span className="text-slate-400">Total</span>
                <span className="font-bold text-white">{complaints.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Category Bar Chart ────────────────────────────────────── */}
      <div className="glass-effect rounded-2xl border border-slate-800/50 p-6">
        <h3 className="text-base font-bold text-white mb-1">Complaints by Category</h3>
        <p className="text-xs text-slate-500 mb-4">Top 10 crime categories (bar chart)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryData} layout="vertical"
            margin={{ top: 0, right: 40, left: 10, bottom: 0 }} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
            <YAxis dataKey="name" type="category" stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }} width={120} />
            <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="count" name="Complaints" radius={[0, 6, 6, 0]}>
              {categoryData.map((_, i) => (
                <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
              ))}
              <LabelList dataKey="count" position="right"
                style={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Row 3: Resolved vs Pending summary cards ─────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',      value: complaints.length,                                          color: 'from-blue-500 to-indigo-600',    emoji: '📂' },
          { label: 'Pending',    value: complaints.filter(c => c.status === 'Filed').length,        color: 'from-amber-500 to-orange-600',   emoji: '⏳' },
          { label: 'In Progress',value: complaints.filter(c => c.status === 'In Progress' || c.status === 'Under Review').length, color: 'from-purple-500 to-violet-700', emoji: '🔄' },
          { label: 'Resolved',   value: complaints.filter(c => c.status === 'Resolved').length,     color: 'from-emerald-500 to-green-700',  emoji: '✅' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 bg-gradient-to-br ${s.color} text-white shadow-lg`}>
            <p className="text-2xl mb-1">{s.emoji}</p>
            <p className="text-3xl font-extrabold leading-none">{s.value}</p>
            <p className="text-sm font-medium opacity-80 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      {/* ── Row 4: Station-wise Bar Chart ─────────────────────────────────── */}
      <div className="glass-effect rounded-2xl border border-slate-800/50 p-6">
        <h3 className="text-base font-bold text-white mb-1">Station-wise Complaint Progress</h3>
        <p className="text-xs text-slate-500 mb-4">Total complaints assigned per police station (top 15)</p>
        {(() => {
          const stationMap = {};
          complaints.forEach(c => {
            const k = c.station || 'Unassigned';
            stationMap[k] = (stationMap[k] || 0) + 1;
          });
          const stationData = Object.entries(stationMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([name, count]) => ({ name, count }));
          const STATION_COLORS = [
            '#6366f1','#3b82f6','#06b6d4','#10b981','#84cc16',
            '#f59e0b','#f97316','#ef4444','#ec4899','#a855f7',
            '#8b5cf6','#14b8a6','#22d3ee','#fb923c','#f43f5e',
          ];
          return (
            <ResponsiveContainer width="100%" height={Math.max(240, stationData.length * 36)}>
              <BarChart data={stationData} layout="vertical"
                margin={{ top: 0, right: 60, left: 10, bottom: 0 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b"
                  tick={{ fontSize: 10, fill: '#94a3b8' }} width={160} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="count" name="Complaints" radius={[0, 6, 6, 0]}>
                  {stationData.map((_, i) => (
                    <Cell key={i} fill={STATION_COLORS[i % STATION_COLORS.length]} />
                  ))}
                  <LabelList dataKey="count" position="right"
                    style={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          );
        })()}
      </div>
    </div>
  );
};

export default ComplaintsCharts;
