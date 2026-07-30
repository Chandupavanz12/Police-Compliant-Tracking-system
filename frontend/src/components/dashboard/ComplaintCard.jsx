import React from 'react';
import { User, MapPin, Calendar, Phone, Building2, Mail, Hash, ShieldCheck } from 'lucide-react';

const STATUS_COLORS = {
  'Filed':            'bg-amber-500 text-white',
  'In Progress':      'bg-blue-500 text-white',
  'Under Review':     'bg-purple-500 text-white',
  'Arrested Suspect': 'bg-rose-600 text-white',
  'Case Closed':      'bg-slate-500 text-white',
  'Resolved':         'bg-emerald-600 text-white',
};

const BOTTOM_BAR = {
  'Filed':            'bg-amber-500',
  'In Progress':      'bg-blue-500',
  'Under Review':     'bg-purple-500',
  'Arrested Suspect': 'bg-rose-600',
  'Case Closed':      'bg-slate-600',
  'Resolved':         'bg-emerald-600',
};

const ROW = ({ icon: Icon, label, value, color = 'text-slate-400' }) => (
  <div className="flex items-start gap-1.5 text-xs">
    <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${color}`} />
    <span className="text-slate-500">{label}:&nbsp;</span>
    <span className="text-slate-200 font-medium truncate max-w-[140px]">{value || 'N/A'}</span>
  </div>
);

const ComplaintCard = ({ complaint: c, onOpen }) => {
  const statusCls = STATUS_COLORS[c.status] || STATUS_COLORS['Filed'];
  const barCls    = BOTTOM_BAR[c.status]    || BOTTOM_BAR['Filed'];
  const bottomLabel = {
    'Filed':            'Assigned – Awaiting Action',
    'In Progress':      'Under Investigation',
    'Under Review':     'Under Judicial Review',
    'Arrested Suspect': 'Suspect Arrested',
    'Case Closed':      'Case Closed',
    'Resolved':         'Case Resolved',
  }[c.status] || c.status;

  return (
    <div
      className="bg-[#0f172a] border border-slate-800 rounded-2xl flex flex-col overflow-hidden hover:border-slate-600 transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer group"
      onClick={() => onOpen && onOpen(c)}
    >
      {/* Card Header */}
      <div className="p-5 pb-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-white font-bold text-lg leading-tight group-hover:text-blue-300 transition-colors">{c.category}</h3>
          <span className={`px-3 py-0.5 rounded-full text-xs font-bold shrink-0 ml-2 ${statusCls}`}>{c.status}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Calendar className="w-3 h-3" />
          {new Date(c.dateFiled).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
        </div>
        <p className="text-slate-400 text-xs font-mono truncate mb-3">{c.complaintId}</p>
        <p className="text-slate-400 text-sm line-clamp-2 min-h-[2.5rem]">{c.description || c.title}</p>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800/80 mx-5" />

      {/* Details Grid */}
      <div className="p-5 pt-4 grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
        <ROW icon={User}     label="User"     value={c.citizenId?.name}  color="text-blue-400" />
        <ROW icon={Building2} label="District" value={c.district}         color="text-purple-400" />
        <ROW icon={MapPin}   label="Location" value={c.taluk || c.district} color="text-rose-400" />
        <ROW icon={Hash}     label="Station"  value={c.station}           color="text-amber-400" />
        <ROW icon={Calendar} label="Incident" value={new Date(c.dateFiled).toLocaleDateString()} color="text-teal-400" />
        <ROW icon={Mail}     label="Email"    value={c.citizenId?.email}  color="text-blue-300" />
        <ROW icon={Phone}    label="Contact"  value="Not provided"         color="text-emerald-400" />
        <ROW icon={ShieldCheck} label="Court" value={c.courtStatus && c.courtStatus !== 'Not applicable' ? c.courtStatus : '—'} color="text-violet-400" />
      </div>

      {/* Verification row */}
      <div className="px-5 pb-3 flex gap-4 text-xs">
        <span className="text-slate-500">Verified: <span className={c.isVerified ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{c.isVerified ? 'Yes' : 'No'}</span></span>
        <span className="text-slate-500">Verified By: <span className="text-slate-300">{c.isVerified ? c.station : '—'}</span></span>
        {c.isEscalated && <span className="text-red-400 font-bold">⚠ Escalated</span>}
        {c.isFirFiled && <span className="text-blue-400 font-bold">📄 FIR FILED</span>}
      </div>

      {/* Bottom Status Bar */}
      <div className={`${barCls} px-5 py-2.5 text-white text-xs font-semibold text-center tracking-wide`}>
        {bottomLabel}
      </div>
    </div>
  );
};

export default ComplaintCard;
