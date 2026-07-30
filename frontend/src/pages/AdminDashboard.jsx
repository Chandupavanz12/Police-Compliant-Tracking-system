import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { karnatakaData } from '../utils/karnatakaData';
import { DashboardView, Sidebar } from './AdminDashboardParts';
import {
  Users, FileText, AlertOctagon, UserSearch,
  BarChart3, UserPlus, RefreshCw, Bell, ShieldCheck, Search, X, Trash2
} from 'lucide-react';
import ComplaintCard from '../components/dashboard/ComplaintCard';
import ComplaintsCharts from '../components/dashboard/ComplaintsCharts';
import SecurityMonitoringPanel from '../components/security/SecurityMonitoringPanel';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [policeList, setPoliceList] = useState([]);
  const [missing, setMissing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [policeForm, setPoliceForm] = useState({ name:'', username:'', password:'', district:'', taluk:'', station:'', faceDescriptor: null });
  const [faceUploadStatus, setFaceUploadStatus] = useState('');
  const [faceFile, setFaceFile] = useState(null);
  const [formMsg, setFormMsg] = useState('');

  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintStatus, setComplaintStatus] = useState('All Status');
  const [complaintCategory, setComplaintCategory] = useState('All Categories');
  const [complaintStation, setComplaintStation] = useState('All Stations');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, p, m, u] = await Promise.all([
        axios.get('http://localhost:5000/api/complaints'),
        axios.get('http://localhost:5000/api/auth/police'),
        axios.get('http://localhost:5000/api/missing'),
        axios.get('http://localhost:5000/api/auth/users'),
      ]);
      setComplaints(c.data);
      setPoliceList(p.data);
      setMissing(m.data);
      setUsers(u.data);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchAll(); },[]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleWarn = async (id) => {
    await axios.put(`http://localhost:5000/api/complaints/${id}/warn`);
    fetchAll();
    alert('Warning issued to police station.');
  };

  const handleResetPwd = async (id, username) => {
    const p = prompt(`New password for ${username} (min 6 chars):`);
    if (!p || p.length < 6) return alert('Min 6 characters required.');
    await axios.put(`http://localhost:5000/api/auth/police/${id}/reset-password`, { newPassword: p });
    alert('Password reset successfully!');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormMsg('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register-police', policeForm);
      setFormMsg('✅ Officer registered successfully!');

      // If a face image was selected, extract descriptor and register it
      if (faceFile && res.status === 201) {
        setFaceUploadStatus('Processing face image…');
        try {
          // Dynamically import face-api only when needed
          const faceapi = await import('face-api.js');
          const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          ]);

          const img = new Image();
          img.src = URL.createObjectURL(faceFile);
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (!detection) {
            setFaceUploadStatus('⚠️ No face detected in uploaded image. Register officer without face.');
          } else {
            // Get the newly created user ID
            const policeList = await axios.get('http://localhost:5000/api/auth/police', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const newOfficer = policeList.data.find(p => p.username === policeForm.username);
            if (newOfficer) {
              const descriptor = Array.from(detection.descriptor);
              await axios.post(
                `http://localhost:5000/api/security/face/register/${newOfficer._id}`,
                { faceDescriptor: descriptor },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
              );
              setFaceUploadStatus('✅ Face registered successfully!');
            }
          }
        } catch (faceErr) {
          console.error('Face registration error:', faceErr);
          setFaceUploadStatus('⚠️ Face registration failed (officer account created).');
        }
      }

      setPoliceForm({ name:'', username:'', password:'', district:'', taluk:'', station:'', faceDescriptor: null });
      setFaceFile(null);
      fetchAll();
    } catch(err){ setFormMsg('❌ '+(err.response?.data?.message||'Error')); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint permanently?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/complaints/${id}`);
      fetchAll();
    } catch (err) { alert('Failed to delete complaint'); }
  };

  const districts = Object.keys(karnatakaData);
  const taluks = policeForm.district ? Object.keys(karnatakaData[policeForm.district]) : [];
  const stations = policeForm.taluk ? karnatakaData[policeForm.district][policeForm.taluk] : [];
  const escalated = complaints.filter(c=>c.isEscalated);

  const filteredComplaints = complaints.filter(c => {
    const matchSearch = (c.title || '').toLowerCase().includes(complaintSearch.toLowerCase()) || 
                        (c.complaintId || '').toLowerCase().includes(complaintSearch.toLowerCase()) ||
                        (c.description || '').toLowerCase().includes(complaintSearch.toLowerCase());
    const matchStatus = complaintStatus === 'All Status' || c.status === complaintStatus;
    const matchCategory = complaintCategory === 'All Categories' || c.category === complaintCategory;
    const matchStation = complaintStation === 'All Stations' || c.station === complaintStation;
    return matchSearch && matchStatus && matchCategory && matchStation;
  });

  const categories = ['All Categories', ...new Set(complaints.map(c => c.category).filter(Boolean))];
  const stationList = ['All Stations', ...new Set(complaints.map(c => c.station).filter(Boolean))];
  const STATUS_OPTIONS = [
    { value: 'Filed', label: 'Filed' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Arrested Suspect', label: 'Arrested Suspect' },
    { value: 'Case Closed', label: 'Case Closed' },
    { value: 'Resolved', label: 'Resolved' },
  ];

  const inp = 'w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500';
  const sel = inp + ' disabled:opacity-40';

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 font-sans">
      <Sidebar active={active} setActive={setActive} logout={handleLogout} />

      <div className="ml-56 min-h-screen">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-[#0a0f1a]/90 backdrop-blur border-b border-slate-800 px-8 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white capitalize">{active.replace('_',' ')}</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Admin: <span className="text-purple-400">{user?.username}</span></span>
            <button onClick={fetchAll} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700">
              <RefreshCw className={`w-4 h-4 text-slate-400 ${loading?'animate-spin':''}`} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* ── DASHBOARD ── */}
          {active==='dashboard' && (
            <DashboardView complaints={complaints} users={users} policeList={policeList} setActive={setActive} />
          )}

          {/* ── USERS ── */}
          {active==='users' && (
            <div className="glass-effect rounded-2xl border border-slate-800/50 overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400"/>
                <h3 className="font-bold text-white">Police Officers</h3>
                <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">{policeList.length} total</span>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-800 text-slate-400">
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Username</th>
                  <th className="p-4 text-left">Jurisdiction</th>
                  <th className="p-4 text-right">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {policeList.map(p=>(
                    <tr key={p._id} className="hover:bg-slate-800/30">
                      <td className="p-4 text-white font-medium">{p.name}</td>
                      <td className="p-4 text-slate-300">{p.username}</td>
                      <td className="p-4 text-slate-400 text-xs">{p.station}, {p.taluk}, {p.district}</td>
                      <td className="p-4 text-right">
                        <button onClick={()=>handleResetPwd(p._id,p.username)} className="text-xs px-3 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors">
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── COMPLAINTS ── */}
          {active==='complaints' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-400"/>
                <h3 className="font-bold text-white text-xl">All Complaints</h3>
                <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{complaints.length} total</span>
              </div>

              {/* Filter Bar */}
              <div className="glass-effect rounded-2xl border border-slate-800/50 p-4 flex flex-col md:flex-row gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={complaintSearch}
                    onChange={e => setComplaintSearch(e.target.value)}
                    placeholder="Search complaints..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <select
                  value={complaintCategory}
                  onChange={e => setComplaintCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 md:w-40"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={complaintStatus}
                  onChange={e => setComplaintStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 md:w-40"
                >
                  <option value="All Status">All Status</option>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select
                  value={complaintStation}
                  onChange={e => setComplaintStation(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 md:w-48"
                >
                  {stationList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                  onClick={() => { setComplaintSearch(''); setComplaintStatus('All Status'); setComplaintCategory('All Categories'); setComplaintStation('All Stations'); }}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-6 py-2.5 transition-colors border border-slate-700 font-medium text-sm"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
              </div>

              {filteredComplaints.length === 0 ? (
                <div className="p-12 text-center text-slate-400 glass-effect rounded-2xl border border-slate-800/50">No complaints found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredComplaints.map(c => (
                    <div key={c._id} className="relative group">
                      <ComplaintCard complaint={c} />
                      <button onClick={()=>handleDelete(c._id)} className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg backdrop-blur-sm z-10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ESCALATIONS ── */}
          {active==='escalations' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertOctagon className="w-6 h-6 text-red-400"/>
                <h3 className="text-xl font-bold text-white">Escalated Cases</h3>
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">{escalated.length}</span>
              </div>
              {escalated.length===0 ? (
                <div className="glass-effect rounded-2xl border border-slate-800/50 p-12 text-center text-slate-400">✅ No escalated complaints.</div>
              ) : escalated.map(c=>(
                <div key={c._id} className={`glass-effect rounded-2xl border p-6 space-y-3 ${c.escalationWarning==='Warning Issued to Station by Admin'?'border-amber-500/30 bg-amber-900/5':'border-red-500/30 bg-red-900/5'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs text-blue-400">{c.complaintId}</span>
                      <h4 className="text-white font-bold text-lg">{c.category} — {c.title}</h4>
                      <p className="text-slate-400 text-sm">Citizen: {c.citizenId?.name} · Station: {c.station}</p>
                      <p className="text-slate-500 text-xs">Filed: {new Date(c.dateFiled).toLocaleDateString()} · Status: {c.status}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${c.statusColor}`}>{c.status}</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                    {c.escalationWarning==='Warning Issued to Station by Admin' ? (
                      <span className="text-amber-400 text-sm font-bold flex items-center gap-2"><Bell className="w-4 h-4"/> Warning already issued to station</span>
                    ) : (
                      <button onClick={()=>handleWarn(c._id)} className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors">
                        <AlertOctagon className="w-4 h-4"/> Issue Warning to Station
                      </button>
                    )}
                    <span className="text-slate-500 text-xs">{c.escalationWarning}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── MISSING PERSONS ── */}
          {active==='missing' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <UserSearch className="w-6 h-6 text-amber-400"/>
                <h3 className="text-xl font-bold text-white">Missing Person Reports</h3>
                <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full">{missing.length}</span>
              </div>
              {missing.length===0 ? (
                <div className="glass-effect rounded-2xl border border-slate-800/50 p-12 text-center text-slate-400">No reports filed yet.</div>
              ) : missing.map(r=>(
                <div key={r._id} className={`glass-effect rounded-2xl border p-5 flex gap-5 ${r.status==='Found'?'border-emerald-500/30':'border-amber-500/20'}`}>
                  {r.photoUrl && <img src={`http://localhost:5000/${r.photoUrl.replace(/\\/g,'/')}`} alt={r.name} className="w-20 h-20 rounded-xl object-cover border border-slate-700 shrink-0"/>}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <span className="text-xs font-mono text-amber-400">{r.reportId}</span>
                        <h4 className="text-white font-bold">{r.name}</h4>
                        <p className="text-slate-400 text-sm">{r.age}y · {r.gender} · {r.lastSeenLocation}</p>
                        <p className="text-slate-500 text-xs">Filed at: {r.station}, {r.district}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start ${r.status==='Found'?'text-emerald-400 border-emerald-500/30 bg-emerald-500/10':'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>{r.status}</span>
                    </div>
                    {r.status==='Found' && <p className="mt-2 text-emerald-300 text-sm bg-emerald-900/20 p-2 rounded-lg">✅ Found by {r.foundBy}: {r.foundDetails}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── REGISTER OFFICER ── */}
          {active==='register' && (
            <div className="max-w-xl glass-effect rounded-2xl border border-slate-800/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <UserPlus className="w-6 h-6 text-purple-400"/>
                <h3 className="text-xl font-bold text-white">Register Police Officer</h3>
              </div>
              {formMsg && <div className={`p-3 rounded-xl mb-4 text-sm ${formMsg.startsWith('✅')?'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30':'bg-red-500/10 text-red-400 border border-red-500/30'}`}>{formMsg}</div>}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required className={inp} placeholder="Full Name" value={policeForm.name} onChange={e=>setPoliceForm({...policeForm,name:e.target.value})}/>
                  <input required className={inp} placeholder="Username" value={policeForm.username} onChange={e=>setPoliceForm({...policeForm,username:e.target.value})}/>
                </div>
                <input required type="password" className={inp} placeholder="Password" value={policeForm.password} onChange={e=>setPoliceForm({...policeForm,password:e.target.value})}/>

                {/* Face Image Upload — optional biometric registration */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    👤 Upload Police Face Image <span className="text-slate-600">(optional — for biometric login)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFaceFile(e.target.files[0] || null)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-300 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:text-xs file:font-semibold hover:file:bg-purple-500 focus:outline-none focus:border-purple-500"
                  />
                  {faceUploadStatus && (
                    <p className={`text-xs mt-1.5 ${faceUploadStatus.startsWith('✅') ? 'text-emerald-400' : 'text-amber-400'}`}>{faceUploadStatus}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <select required className={sel} value={policeForm.district} onChange={e=>setPoliceForm({...policeForm,district:e.target.value,taluk:'',station:''})}>
                    <option value="" disabled>District</option>
                    {districts.map(d=><option key={d}>{d}</option>)}
                  </select>
                  <select required disabled={!policeForm.district} className={sel} value={policeForm.taluk} onChange={e=>setPoliceForm({...policeForm,taluk:e.target.value,station:''})}>
                    <option value="" disabled>Taluk</option>
                    {taluks.map(t=><option key={t}>{t}</option>)}
                  </select>
                  <select required disabled={!policeForm.taluk} className={sel} value={policeForm.station} onChange={e=>setPoliceForm({...policeForm,station:e.target.value})}>
                    <option value="" disabled>Station</option>
                    {stations.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors">Create Account</button>
              </form>
            </div>
          )}

          {/* ── REPORTS ── */}
          {active==='reports' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-400"/>
                <h3 className="text-xl font-bold text-white">Generate Reports</h3>
              </div>

              {/* ── Charts Section ── */}
              <ComplaintsCharts
                complaints={complaints}
                title="Complaint Analytics Overview"
                accentColor="#a855f7"
              />

              {/* ── Station-wise Distribution ── */}
              <div className="glass-effect rounded-2xl border border-slate-800/50 p-6">
                <h4 className="font-bold text-white mb-4">Station-wise Case Distribution</h4>
                {Object.entries(complaints.reduce((acc,c)=>{
                  const k=c.station||'Unassigned'; acc[k]=(acc[k]||0)+1; return acc;
                },{})).sort((a,b)=>b[1]-a[1]).map(([s,n])=>(
                  <div key={s} className="flex items-center gap-4 py-2 border-b border-slate-800/50 last:border-0">
                    <span className="text-slate-300 text-sm flex-1 truncate">{s}</span>
                    <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{width:`${(n/complaints.length)*100}%`}}/>
                    </div>
                    <span className="text-slate-400 text-xs w-6 text-right">{n}</span>
                  </div>
                ))}
              </div>

              {/* Misc stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label:'Escalated',      value: escalated.length,                                                    color:'bg-red-600' },
                  { label:'Arrested',        value: complaints.filter(c=>c.status==='Arrested Suspect').length,          color:'bg-rose-600' },
                  { label:'Missing Reports', value: missing.length,                                                      color:'bg-purple-600' },
                ].map(s=>(
                  <div key={s.label} className={`${s.color} rounded-2xl p-6 text-white`}>
                    <p className="text-sm opacity-80">{s.label}</p>
                    <p className="text-4xl font-bold">{s.value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={()=>{
                  const rows=[['ID','Category','Status','Station','Date'],...complaints.map(c=>[c.complaintId,c.category,c.status,c.station,new Date(c.dateFiled).toLocaleDateString()])];
                  const csv=rows.map(r=>r.join(',')).join('\n');
                  const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURI(csv); a.download='complaints_report.csv'; a.click();
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-5 h-5"/> Export CSV Report
              </button>
            </div>
          )}

          {/* ── SECURITY MONITORING ── */}
          {active==='security' && (
            <SecurityMonitoringPanel />
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
