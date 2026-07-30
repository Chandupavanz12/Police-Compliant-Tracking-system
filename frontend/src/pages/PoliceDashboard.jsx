import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, RefreshCw, LogOut, AlertTriangle, UserSearch, CheckCircle, Clock, Trash2, Edit, X, BarChart2 } from 'lucide-react';
import ComplaintCard from '../components/dashboard/ComplaintCard';
import VerificationRequests from '../components/dashboard/VerificationRequests';
import ComplaintsCharts from '../components/dashboard/ComplaintsCharts';
import { karnatakaData } from '../utils/karnatakaData';

const STATUS_OPTIONS = [
  { value: 'Filed',            label: 'Filed' },
  { value: 'In Progress',      label: 'In Progress' },
  { value: 'Under Review',     label: 'Under Review' },
  { value: 'Arrested Suspect', label: 'Arrested Suspect' },
  { value: 'Case Closed',      label: 'Case Closed' },
  { value: 'Resolved',         label: 'Resolved' },
];

const statusCls = (st) => {
  if (st === 'Resolved') return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';
  if (st === 'Arrested Suspect') return 'text-rose-400 bg-rose-400/10 border-rose-500/20';
  if (st === 'Case Closed') return 'text-slate-400 bg-slate-400/10 border-slate-500/20';
  if (st === 'Under Review') return 'text-purple-400 bg-purple-400/10 border-purple-500/20';
  if (st === 'In Progress') return 'text-amber-400 bg-amber-400/10 border-amber-500/20';
  return 'text-blue-400 bg-blue-400/10 border-blue-500/20';
};

const MPCard = ({ report, onUpdate }) => {
  const [foundDetails, setFoundDetails] = useState('');
  const [updating, setUpdating] = useState(false);
  const { user } = useContext(AuthContext);

  const markFound = async () => {
    if (!foundDetails.trim()) return alert("Please provide details on where and how the person was found.");
    if (!window.confirm("Are you sure you want to mark this person as Found?")) return;
    setUpdating(true);
    try {
      await axios.put(`http://localhost:5000/api/missing/${report._id}/status`, {
        status: 'Found', foundDetails, foundBy: user?.station || 'Police Station'
      });
      onUpdate();
    } catch (err) { alert('Failed to update status'); }
    finally { setUpdating(false); }
  };

  return (
    <div className={`p-4 rounded-xl border transition-colors ${
      report.status === 'Found' ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
    }`}>
      <div className="flex gap-4">
        {report.photoUrl ? (
          <img src={`http://localhost:5000/${report.photoUrl.replace(/\\/g, '/')}`} alt={report.name} className="w-24 h-24 object-cover rounded-lg bg-black/50 border border-slate-700" />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
            <UserSearch className="w-8 h-8 text-slate-500" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{report.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">{report.reportId}</span>
                <span className="text-xs text-slate-400">{report.age} yrs • {report.gender}</span>
              </div>
            </div>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
              report.status === 'Found' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
            }`}>
              {report.status === 'Found' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {report.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
            <div className="bg-black/20 rounded-lg p-2">
              <span className="text-slate-500 block">Last Seen</span>
              <span className="text-slate-200">{report.lastSeenLocation}</span>
              <span className="text-slate-400 block">{new Date(report.lastSeenDate).toLocaleString()}</span>
            </div>
            <div className="bg-black/20 rounded-lg p-2">
              <span className="text-slate-500 block">Filed at</span>
              <span className="text-slate-200">{report.station || '—'}</span>
              <span className="text-slate-400 block">{report.district}</span>
            </div>
          </div>

          <p className="text-slate-400 text-xs mt-2 line-clamp-2">{report.description}</p>

          {report.status === 'Found' && (
            <div className="mt-3 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg text-xs">
              <span className="text-emerald-400 font-bold">✅ Found — </span>
              <span className="text-emerald-300">{report.foundDetails}</span>
            </div>
          )}

          {report.status === 'Searching' && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={foundDetails}
                onChange={e => setFoundDetails(e.target.value)}
                placeholder="Describe where/how person was found..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={markFound}
                disabled={updating}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
              >
                {updating ? 'Saving...' : 'Mark Found'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Police Manual Complaint Filing ─────────────────────────────────────────
const PoliceFileComplaint = ({ officer, onSuccess }) => {
  const [form, setForm] = useState({
    title: '', description: '', category: '', incidentLocation: '',
    district: officer?.district || '', taluk: officer?.taluk || '', station: officer?.station || '',
  });
  const [firMode, setFirMode] = useState(false);
  const [numCriminals, setNumCriminals] = useState(1);
  const [criminals, setCriminals] = useState([{ name: '', fatherName: '', age: '', address: '', crimeDetails: '' }]);
  const [firText, setFirText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inp = 'w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 placeholder-slate-500';

  const handleCriminalChange = (idx, field, value) => {
    const updated = [...criminals];
    updated[idx] = { ...updated[idx], [field]: value };
    setCriminals(updated);
  };

  const handleNumChange = (n) => {
    const count = Math.max(1, parseInt(n) || 1);
    setNumCriminals(count);
    setCriminals(prev => {
      const arr = [...prev];
      while (arr.length < count) arr.push({ name: '', fatherName: '', age: '', address: '', crimeDetails: '' });
      return arr.slice(0, count);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        filedByPolice: true,
        officerName: officer?.name || officer?.username,
        status: 'In Progress',
        ...(firMode && {
          firDetails: firText,
          criminalsInvolved: criminals.map(c => ({ ...c, age: Number(c.age) || 0 })),
          hasCriminalRecord: true,
        }),
      };
      await axios.post('http://localhost:5000/api/complaints', payload);
      alert('Complaint filed successfully!');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file complaint.');
    } finally { setLoading(false); }
  };

  const CATEGORIES = ['Theft','Assault','Cyber Crime','Fraud','Vandalism','Murder','Robbery','Kidnapping','Drug Trafficking','Other'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-emerald-500/20 rounded-xl">
          <Edit className="w-7 h-7 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">File a Complaint</h2>
          <p className="text-slate-400 text-sm">Manually register a complaint on behalf of a citizen • Station: <span className="text-emerald-400 font-semibold">{officer?.station}</span></p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 glass-effect p-8 rounded-2xl border border-slate-800/50">

        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Incident Title *</label>
            <input required className={inp} placeholder="Brief title of the incident"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
            <select required className={inp} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="" disabled>Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">Incident Location *</label>
            <input required className={inp} placeholder="Exact location of the incident"
              value={form.incidentLocation} onChange={e => setForm({ ...form, incidentLocation: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">Detailed Description *</label>
            <textarea required rows={4} className={inp + ' resize-none'} placeholder="Describe the incident in detail..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>

        {/* FIR Toggle */}
        <div className="flex items-center gap-3 p-4 bg-rose-900/10 border border-rose-500/20 rounded-xl cursor-pointer select-none"
          onClick={() => setFirMode(p => !p)}>
          <div className={`w-11 h-6 rounded-full transition-colors relative ${firMode ? 'bg-rose-500' : 'bg-slate-700'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${firMode ? 'left-6' : 'left-1'}`} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">File FIR & Add Criminal Records</p>
            <p className="text-slate-400 text-xs">Enable to register FIR and store criminal information to the database</p>
          </div>
        </div>

        {/* FIR Section */}
        {firMode && (
          <div className="space-y-5 p-5 bg-rose-900/10 border border-rose-500/20 rounded-xl">
            <h3 className="text-rose-400 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> FIR Details & Criminal Records
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">FIR Details / Sections Applied</label>
              <textarea rows={3} className={inp + ' resize-none'} placeholder="IPC sections, brief FIR summary..."
                value={firText} onChange={e => setFirText(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Number of Accused</label>
              <input type="number" min={1} max={20} className={inp + ' w-28'} value={numCriminals}
                onChange={e => handleNumChange(e.target.value)} />
            </div>

            {criminals.slice(0, numCriminals).map((cr, i) => (
              <div key={i} className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl space-y-3">
                <p className="text-sm font-bold text-rose-300">Accused #{i + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                    <input required className={inp} placeholder="Full name"
                      value={cr.name} onChange={e => handleCriminalChange(i, 'name', e.target.value.replace(/[^a-zA-Z\s]/g, ''))} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Father's Name *</label>
                    <input required className={inp} placeholder="Father's name"
                      value={cr.fatherName} onChange={e => handleCriminalChange(i, 'fatherName', e.target.value.replace(/[^a-zA-Z\s]/g, ''))} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Age</label>
                    <input type="number" min={1} max={120} className={inp} placeholder="Age"
                      value={cr.age} onChange={e => handleCriminalChange(i, 'age', e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Address</label>
                    <input className={inp} placeholder="Residential address"
                      value={cr.address} onChange={e => handleCriminalChange(i, 'address', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Crime Details / Role</label>
                    <input className={inp} placeholder="Role in the crime / specific charges"
                      value={cr.crimeDetails} onChange={e => handleCriminalChange(i, 'crimeDetails', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-4 pt-2 border-t border-slate-800/50">
          <button type="button" onClick={() => onSuccess()}
            className="px-6 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-8 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 flex items-center gap-2 text-sm">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Filing...' : firMode ? '🚨 File Complaint + FIR' : '📋 File Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
};

const PoliceDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('complaints');

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintStatus, setComplaintStatus] = useState('All Status');
  const [complaintCategory, setComplaintCategory] = useState('All Categories');

  const [missing, setMissing] = useState([]);
  const [missingLoading, setMissingLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [firDetails, setFirDetails] = useState('');

  const [numCriminals, setNumCriminals] = useState('');
  const [criminalsData, setCriminalsData] = useState([]);
  const [finalJudgementText, setFinalJudgementText] = useState('');

  const [selectedCriminal, setSelectedCriminal] = useState(null);
  const [fullSizeImage, setFullSizeImage] = useState(null);
  const [tempStatus, setTempStatus] = useState('');
  const [resolvedProofBase64, setResolvedProofBase64] = useState('');
  const [isInitiatingFir, setIsInitiatingFir] = useState(false);

  useEffect(() => {
    if (selectedComplaint) {
      setNumCriminals(selectedComplaint.criminalsInvolved?.length || '');
      setCriminalsData(selectedComplaint.criminalsInvolved || []);
      setFinalJudgementText(selectedComplaint.finalJudgement || '');
      setFirDetails(selectedComplaint.firDetails || '');
      setTempStatus(selectedComplaint.status || '');
      setResolvedProofBase64('');
      setIsInitiatingFir(false);
    }
  }, [selectedComplaint]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/complaints');
      setComplaints(res.data);
      if (selectedComplaint) {
        const updated = res.data.find(c => c._id === selectedComplaint._id);
        if (updated) setSelectedComplaint(updated);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchMissing = async () => {
    setMissingLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/missing');
      setMissing(res.data);
    } catch (err) { console.error(err); }
    finally { setMissingLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, []);
  useEffect(() => { if (activeTab === 'missing') fetchMissing(); }, [activeTab]);

  const handleUpdateStatus = async (id) => {
    if (tempStatus === selectedComplaint.status) return;
    if (tempStatus === 'Resolved' && !resolvedProofBase64 && !selectedComplaint.resolvedProofBase64) {
      alert('⚠️ WARNING: You must upload proof of resolution to close this case.');
      return;
    }
    if (!window.confirm(`Are you sure you want to change the status to ${tempStatus}?`)) return;
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}`, { 
        status: tempStatus,
        ...(tempStatus === 'Resolved' && resolvedProofBase64 && { resolvedProofBase64 })
      });
      fetchComplaints();
      alert('Status updated successfully');
    } catch (err) { console.error(err); alert('Failed to update status'); }
  };

  const handleProofUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setResolvedProofBase64(reader.result);
  };

  const handleCourtStatusChange = async (id, courtStatus) => {
    if (!window.confirm('Confirm updating court status?')) return;
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}/court`, { courtStatus });
      fetchComplaints();
      alert('Court status updated successfully');
    } catch (err) { console.error(err); alert('Failed to update court status'); }
  };

  const handleFileFir = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}/fir`);
      alert('FIR filed and number generated successfully!');
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to file FIR');
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm('Are you sure you want to mark this complaint as VERIFIED?')) return;
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}/verify`);
      fetchComplaints();
    } catch (err) { alert('Failed to verify complaint'); }
  };

  const handleNumCriminalsChange = (e) => {
    const numStr = e.target.value;
    setNumCriminals(numStr);
    const num = parseInt(numStr) || 0;
    const newArr = [...criminalsData];
    if (num > newArr.length) {
      for (let i = newArr.length; i < num; i++) {
        newArr.push({ name: '', fatherName: '', age: '', address: '', activity: '', photoBase64: '' });
      }
    } else {
      newArr.splice(num);
    }
    setCriminalsData(newArr);
  };

  const updateCriminalField = (index, field, value) => {
    const newArr = [...criminalsData];
    newArr[index][field] = value;
    setCriminalsData(newArr);
  };

  const handleCriminalPhoto = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      updateCriminalField(index, 'photoBase64', reader.result);
    };
  };

  const handleSaveCriminals = async () => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${selectedComplaint._id}/criminals`, { criminals: criminalsData });
      alert('Criminals data saved successfully!');
      fetchComplaints();
    } catch(err) {
      alert('Failed to save criminals data');
    }
  };

  const handleSaveCriminalsAndFir = async () => {
    if (criminalsData.length === 0) {
      return alert('Please add at least one criminal record to file the FIR.');
    }
    if (!window.confirm('This will save the criminal records and officially file the FIR. Continue?')) return;
    try {
      // 1. Save criminals
      await axios.put(`http://localhost:5000/api/complaints/${selectedComplaint._id}/criminals`, { criminals: criminalsData });
      // 2. File FIR
      await handleFileFir(selectedComplaint._id);
      setIsInitiatingFir(false);
    } catch(err) {
      console.error(err);
      alert('Failed to complete the FIR process');
    }
  };

  const handleSaveJudgement = async () => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${selectedComplaint._id}/judgement`, { finalJudgement: finalJudgementText });
      alert('Final judgement saved successfully!');
      fetchComplaints();
    } catch(err) {
      alert('Failed to save final judgement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint? This cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/complaints/${id}`);
      fetchComplaints();
      if (selectedComplaint && selectedComplaint._id === id) setSelectedComplaint(null);
    } catch (err) { alert('Failed to delete complaint'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const warningComplaints = complaints.filter(c => c.escalationWarning === 'Warning Issued to Station by Admin');

  const filteredComplaints = complaints.filter(c => {
    const matchSearch = (c.title || '').toLowerCase().includes(complaintSearch.toLowerCase()) || 
                        (c.complaintId || '').toLowerCase().includes(complaintSearch.toLowerCase()) ||
                        (c.description || '').toLowerCase().includes(complaintSearch.toLowerCase());
    const matchStatus = complaintStatus === 'All Status' || c.status === complaintStatus;
    const matchCategory = complaintCategory === 'All Categories' || c.category === complaintCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const categories = ['All Categories', ...new Set(complaints.map(c => c.category))];

  const filteredMissing = missing.filter(r =>
    (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.reportId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.lastSeenLocation || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#020617] to-[#020617] -z-20"></div>

      {/* Navbar */}
      <nav className="glass-effect border-b border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-400" />
            <span className="text-xl font-bold text-white tracking-wide">Police Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 font-medium text-sm">Officer: <span className="text-emerald-400">{user?.username}</span></span>
            {user?.station && <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">{user.station}</span>}
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-0 flex gap-1 border-t border-slate-800/50">
          {[
            { id: 'complaints',      label: '📋 Complaints' },
            { id: 'missing',         label: '🔍 Missing Persons' },
            { id: 'criminals',       label: '🚨 Criminal Records' },
            { id: 'file_complaint',  label: '📝 File Complaint' },
            { id: 'verification',    label: '✅ Verifications' },
            { id: 'analytics',       label: '📊 Analytics' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === t.id
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
          {warningComplaints.length > 0 && (
            <span className="ml-auto self-center text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full animate-pulse">
              ⚠️ {warningComplaints.length} Admin Warning{warningComplaints.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">

        {/* ── COMPLAINTS TAB ── */}
        {activeTab === 'complaints' && (
          <>
            {/* Admin Warning Banner */}
            {warningComplaints.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-5 flex items-start gap-4 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                <AlertTriangle className="w-7 h-7 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h3 className="text-lg font-bold text-red-400 mb-1">⚠️ CRITICAL ADMIN WARNING</h3>
                  <p className="text-red-300 text-sm">
                    You have <strong>{warningComplaints.length}</strong> officially warned complaint(s) from the Administrator.
                    Take immediate action to avoid disciplinary proceedings.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {warningComplaints.map(w => (
                      <button key={w._id} onClick={() => setSelectedComplaint(w)} className="text-xs px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors">
                        {w.complaintId} → {w.category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Complaint Management</h1>
                <p className="text-slate-400 text-sm">Jurisdiction: {user?.station || 'All Stations'}</p>
              </div>
              <button onClick={fetchComplaints} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 text-sm">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {/* Filter Bar */}
            <div className="glass-effect rounded-2xl border border-slate-800/50 p-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
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
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 md:w-48"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={complaintStatus}
                onChange={e => setComplaintStatus(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 md:w-48"
              >
                <option value="All Status">All Status</option>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button
                onClick={() => { setComplaintSearch(''); setComplaintStatus('All Status'); setComplaintCategory('All Categories'); }}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-6 py-2.5 transition-colors border border-slate-700 font-medium text-sm"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center"><RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" /></div>
            ) : filteredComplaints.length === 0 ? (
              <div className="p-12 text-center text-slate-400 glass-effect rounded-2xl border border-slate-800/50">No complaints found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredComplaints.map(c => (
                  <div key={c._id} className="relative group cursor-pointer" onClick={() => setSelectedComplaint(c)}>
                    <ComplaintCard complaint={c} />
                    <button 
                      onClick={(e)=>{e.stopPropagation(); handleDelete(c._id);}} 
                      className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg backdrop-blur-sm z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {c.isVerified && (
                      <span className="absolute top-4 left-4 p-1 px-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/30 flex items-center gap-1 z-10 shadow-lg backdrop-blur-sm">
                        <CheckCircle className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── MISSING PERSONS TAB ── */}
        {activeTab === 'missing' && (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Missing Persons Network</h1>
                <p className="text-slate-400 text-sm">All reports from all stations — update status if you have information.</p>
              </div>
              <button onClick={fetchMissing} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 text-sm">
                <RefreshCw className={`w-4 h-4 ${missingLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, report ID, or last seen location..."
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {missingLoading ? (
              <div className="flex justify-center py-16"><RefreshCw className="w-8 h-8 text-amber-400 animate-spin" /></div>
            ) : filteredMissing.length === 0 ? (
              <div className="text-center py-16 glass-effect rounded-2xl border border-slate-800/50">
                <UserSearch className="w-14 h-14 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300">{searchQuery ? 'No results found' : 'No Missing Person Reports'}</h3>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">{filteredMissing.length} report(s) found</p>
                {filteredMissing.map(r => <MPCard key={r._id} report={r} onUpdate={fetchMissing} />)}
              </div>
            )}
          </>
        )}

        {/* ── CRIMINALS DATABASE TAB ── */}
        {activeTab === 'criminals' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Central Criminal Database</h1>
                <p className="text-slate-400 text-sm">Comprehensive list of all criminals linked to filed complaints.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {(() => {
                const allCriminals = complaints.flatMap(c => 
                  (c.criminalsInvolved || []).map(crim => ({ 
                    ...crim, 
                    complaintId: c.complaintId, 
                    firNumber: c.firDetails,
                    caseTitle: c.title, 
                    category: c.category,
                    dateFiled: c.dateFiled
                  }))
                );

                if (allCriminals.length === 0) {
                  return (
                    <div className="col-span-full py-16 text-center glass-effect rounded-2xl border border-slate-800/50">
                      <Shield className="w-14 h-14 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-300">No Criminal Records Found</h3>
                      <p className="text-slate-500 mt-2">Update complaints to add criminals to the database.</p>
                    </div>
                  );
                }

                return allCriminals.map((crim, i) => (
                  <div key={i} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-rose-500/50 transition-colors cursor-pointer group" onClick={() => setSelectedCriminal(crim)}>
                    <div className="flex gap-4 p-5">
                      {crim.photoBase64 ? (
                        <img src={crim.photoBase64} alt={crim.name} className="w-24 h-24 object-cover rounded-xl border border-slate-700 shrink-0 bg-black/50" />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
                          <UserSearch className="w-8 h-8 text-slate-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-white">{crim.name || 'Unknown'}</h3>
                        <p className="text-xs text-rose-400 font-medium mb-2">Age: {crim.age || 'N/A'}</p>
                        
                        <div className="text-xs text-slate-400 space-y-1">
                          <p><strong className="text-slate-300">Father's Name:</strong> {crim.fatherName || 'N/A'}</p>
                          <p><strong className="text-slate-300">Address:</strong> {crim.address || 'N/A'}</p>
                          <p><strong className="text-slate-300">Activity:</strong> {crim.activity || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-rose-900/10 border-t border-rose-900/30 px-5 py-3 flex justify-between items-center text-xs">
                      <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">{crim.complaintId}</span>
                      <span className="text-slate-400">{crim.category}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </>
        )}

        {/* ── FILE COMPLAINT TAB (Police Manual Filing) ── */}
        {activeTab === 'file_complaint' && (
          <PoliceFileComplaint officer={user} onSuccess={() => { fetchComplaints(); setActiveTab('complaints'); }} />
        )}

        {/* ── VERIFICATION REQUESTS TAB ── */}
        {activeTab === 'verification' && (
          <VerificationRequests />
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <BarChart2 className="w-7 h-7 text-emerald-400" />
                  Station Analytics
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Complaint breakdown for: <span className="text-emerald-400 font-semibold">{user?.station || 'All Stations'}</span>
                </p>
              </div>
              <button
                onClick={fetchComplaints}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            <ComplaintsCharts
              complaints={complaints}
              title="Complaint Status & Category Charts"
              accentColor="#10b981"
            />
          </>
        )}
      </main>

      {/* ── COMPLAINT DETAIL MODAL ── */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setSelectedComplaint(null); }}>
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-[#0f172a] z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{selectedComplaint.complaintId} — {selectedComplaint.category}</h2>
                  {selectedComplaint.isVerified && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> VERIFIED</span>}
                </div>
                <p className="text-slate-400 text-sm mt-1">Filed by {selectedComplaint.citizenId?.name} on {new Date(selectedComplaint.dateFiled).toLocaleString()}</p>
                {selectedComplaint.isEscalated && (
                  <p className="text-red-400 text-xs font-bold mt-1">⚠️ ESCALATED: {selectedComplaint.escalationWarning}</p>
                )}
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg text-xl leading-none">✕</button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-5">
                
                {selectedComplaint.isRevoked && (
                  <div className="bg-slate-800/50 border border-slate-700 text-slate-400 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5"/> This case has been formally revoked/withdrawn by the citizen.
                  </div>
                )}

                <div>
                  <h4 className="text-xs text-slate-500 mb-1 font-semibold uppercase">Title</h4>
                  <p className="text-white bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-sm">{selectedComplaint.title}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 mb-1 font-semibold uppercase">Description</h4>
                  <p className="text-white bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-sm whitespace-pre-wrap">{selectedComplaint.description}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 mb-1 font-semibold uppercase">Jurisdiction & Location</h4>
                  <p className="text-white bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-sm">
                    {selectedComplaint.district} › {selectedComplaint.taluk} › {selectedComplaint.station}
                    <br/>
                    <span className="text-slate-400 mt-1 block">Location: {selectedComplaint.incidentLocation || 'N/A'}</span>
                  </p>
                </div>

                {/* Case Management */}
                <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-emerald-500/20 pb-2">
                    <h3 className="font-bold text-emerald-400 text-base">Case Management</h3>
                    {!selectedComplaint.isVerified && (
                      <button onClick={()=>handleVerify(selectedComplaint._id)} className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded shadow-sm transition-colors font-bold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4"/> Verify Complaint
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Update Case Status</label>
                    <div className="flex gap-2 mb-3">
                      <select
                        value={tempStatus}
                        onChange={e => setTempStatus(e.target.value)}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-base font-medium border bg-slate-900 focus:outline-none transition-colors ${statusCls(tempStatus)}`}
                      >
                        {STATUS_OPTIONS.map(o => (
                          <option key={o.value} value={o.value} className="bg-slate-900 text-slate-200">{o.label}</option>
                        ))}
                      </select>
                      {tempStatus !== selectedComplaint.status && (
                        <button onClick={()=>handleUpdateStatus(selectedComplaint._id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap">
                          Confirm Update
                        </button>
                      )}
                    </div>
                    {tempStatus === 'Resolved' && (
                      <div className="bg-emerald-900/20 p-3 border border-emerald-500/30 rounded-lg">
                        <label className="block text-sm font-bold text-emerald-400 mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" /> Proof of Resolution Required
                        </label>
                        <p className="text-xs text-emerald-200/70 mb-2">You must upload an image or document as proof to officially resolve this case.</p>
                        <div className="flex items-center gap-3">
                          <input type="file" accept="image/*" onChange={(e) => handleProofUpload(e.target.files[0])} className="text-sm text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer" />
                          {(resolvedProofBase64 || selectedComplaint.resolvedProofBase64) && (
                            <span className="text-emerald-400 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Proof Attached</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Update Court / Judicial Status</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id={`court-${selectedComplaint._id}`}
                        defaultValue={selectedComplaint.courtStatus !== 'Not applicable' ? selectedComplaint.courtStatus : ''}
                        placeholder="e.g. Hearing on 10 May..."
                        className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => {
                          const val = document.getElementById(`court-${selectedComplaint._id}`).value;
                          if (val) handleCourtStatusChange(selectedComplaint._id, val);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>

                {/* FIR Section */}
                {!selectedComplaint.isFirFiled && !selectedComplaint.isRevoked ? (
                  <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl space-y-3">
                    <h3 className="font-bold text-blue-400 text-base flex items-center gap-2"><Edit className="w-5 h-5"/> File Formal FIR</h3>
                    {!isInitiatingFir ? (
                      <>
                        <p className="text-sm text-blue-200/70">To officially file an FIR, you must document the involved criminals first.</p>
                        <button onClick={()=>setIsInitiatingFir(true)} className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">Initiate FIR Process</button>
                      </>
                    ) : (
                      <p className="text-sm text-amber-400 font-bold bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">Please enter the criminal records below to complete the FIR filing process and generate the FIR number.</p>
                    )}
                  </div>
                ) : selectedComplaint.isFirFiled ? (
                  <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
                    <h4 className="font-bold text-blue-400 mb-1 text-base flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Formal FIR Filed</h4>
                    <p className="text-base text-blue-200 font-mono font-bold">{selectedComplaint.firDetails}</p>
                  </div>
                ) : null}

              </div>

              {/* Right Column — Evidence & Criminals */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm text-slate-500 mb-2 font-semibold uppercase">Evidence Attachment</h4>
                  {selectedComplaint.evidenceUrl ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-2 flex flex-col">
                      {selectedComplaint.evidenceUrl.match(/\.(mp4|avi|mov|webm)$/i) ? (
                        <video
                          src={`http://localhost:5000/${selectedComplaint.evidenceUrl.replace(/\\/g, '/')}`}
                          controls
                          className="w-full max-h-[380px] rounded-lg bg-black/50"
                        />
                      ) : (
                        <img
                          src={`http://localhost:5000/${selectedComplaint.evidenceUrl.replace(/\\/g, '/')}`}
                          alt="Evidence"
                          className="w-full max-h-[380px] object-contain rounded-lg bg-black/50 cursor-pointer hover:opacity-90"
                          onClick={() => setFullSizeImage(`http://localhost:5000/${selectedComplaint.evidenceUrl.replace(/\\/g, '/')}`)}
                        />
                      )}
                      <a
                        href={`http://localhost:5000/${selectedComplaint.evidenceUrl.replace(/\\/g, '/')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 block text-center bg-blue-600/20 text-blue-400 py-2 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-semibold"
                      >
                        Open Full Size ↗
                      </a>
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl h-[150px] flex flex-col items-center justify-center text-slate-500">
                      <AlertTriangle className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-sm">No evidence file attached</p>
                    </div>
                  )}
                </div>

                {/* Criminal Records (Show if FIR is filed OR if initiating FIR) */}
                {(selectedComplaint.isFirFiled || isInitiatingFir) && (
                  <div className="bg-rose-900/10 border border-rose-500/20 p-4 rounded-xl space-y-4 transition-all">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-rose-400 text-base">Criminal Records</h3>
                      {selectedComplaint.firDetails && (
                        <span className="bg-blue-900/50 text-blue-400 px-3 py-1 rounded-full text-xs font-mono font-bold border border-blue-500/30">
                          FIR: {selectedComplaint.firDetails}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Number of Criminals Involved</label>
                      <input type="number" min="0" value={numCriminals} onChange={handleNumCriminalsChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-base focus:outline-none focus:border-rose-500" placeholder="e.g. 2" />
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {criminalsData.map((c, idx) => (
                        <div key={idx} className="bg-slate-900/80 p-4 rounded-lg border border-slate-700 space-y-4">
                          <h4 className="text-sm font-bold text-slate-400">Criminal #{idx + 1}</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Name" value={c.name} onChange={e=>updateCriminalField(idx, 'name', e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500" />
                            <input type="number" placeholder="Age" value={c.age} onChange={e=>updateCriminalField(idx, 'age', e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500" />
                          </div>
                          <input type="text" placeholder="Father's Name" value={c.fatherName || ''} onChange={e=>updateCriminalField(idx, 'fatherName', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500" />
                          <input type="text" placeholder="Address" value={c.address} onChange={e=>updateCriminalField(idx, 'address', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500" />
                          <input type="text" placeholder="Activity Involved" value={c.activity} onChange={e=>updateCriminalField(idx, 'activity', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500" />
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2">Photo Upload</label>
                            <div className="flex items-center gap-3">
                              <input type="file" accept="image/*" onChange={e=>handleCriminalPhoto(idx, e.target.files[0])} className="text-sm text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-300 hover:file:bg-slate-600" />
                              {c.photoBase64 && <img src={c.photoBase64} alt="Criminal" className="w-12 h-12 object-cover rounded-lg bg-black border border-slate-700 cursor-pointer hover:opacity-90" onClick={() => setFullSizeImage(c.photoBase64)} />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {criminalsData.length > 0 && (
                      <button onClick={isInitiatingFir ? handleSaveCriminalsAndFir : handleSaveCriminals} className="w-full bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors">
                        {isInitiatingFir ? 'Accept Criminals & File FIR' : 'Save Criminal Records'}
                      </button>
                    )}
                  </div>
                )}

                {/* Final Judgement (Only if Resolved) */}
                {(tempStatus === 'Resolved' || selectedComplaint.status === 'Resolved') && (
                  <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl space-y-3">
                    <h3 className="font-bold text-purple-400 text-base">Final Judgement</h3>
                    <textarea rows="3" value={finalJudgementText} onChange={e=>setFinalJudgementText(e.target.value)} placeholder="Enter final court judgement here. This will be visible to the citizen." className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-base focus:outline-none focus:border-purple-500 resize-none"></textarea>
                    <button onClick={handleSaveJudgement} className="w-full bg-purple-600 hover:bg-purple-500 text-white px-3 py-2.5 rounded-lg text-sm font-bold transition-colors">Publish Judgement</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FULL SIZE IMAGE MODAL ── */}
      {fullSizeImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4" onClick={() => setFullSizeImage(null)}>
          <img src={fullSizeImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Full Size" />
          <button className="absolute top-6 right-6 text-white hover:text-red-400 transition-colors p-2 bg-black/50 rounded-full" onClick={() => setFullSizeImage(null)}><X className="w-8 h-8" /></button>
        </div>
      )}

      {/* ── CRIMINAL FULL DETAILS MODAL ── */}
      {selectedCriminal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedCriminal(null); }}>
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative">
            <button onClick={() => setSelectedCriminal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg z-10 transition-colors"><X className="w-5 h-5"/></button>
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0 w-full md:w-48">
                  {selectedCriminal.photoBase64 ? (
                    <img 
                      src={selectedCriminal.photoBase64} 
                      alt={selectedCriminal.name} 
                      className="w-full h-64 md:h-48 object-cover rounded-xl border-2 border-slate-700 bg-black cursor-pointer hover:opacity-90"
                      onClick={() => setFullSizeImage(selectedCriminal.photoBase64)}
                    />
                  ) : (
                    <div className="w-full h-64 md:h-48 rounded-xl bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                      <UserSearch className="w-16 h-16 text-slate-500" />
                    </div>
                  )}
                  <p className="text-center text-xs text-slate-500 mt-2">Click photo to enlarge</p>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">{selectedCriminal.name || 'Unknown'}</h2>
                    <span className="text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 inline-block text-sm">Age: {selectedCriminal.age || 'N/A'}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 text-base">
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Father's Name</strong>
                      <span className="text-slate-200">{selectedCriminal.fatherName || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Residential Address</strong>
                      <span className="text-slate-200">{selectedCriminal.address || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Criminal Activity Involved</strong>
                      <span className="text-rose-300 font-medium">{selectedCriminal.activity || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/30 p-4 rounded-xl">
                    <div>
                      <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Linked Case ID</strong>
                      <span className="text-white font-mono">{selectedCriminal.complaintId}</span>
                    </div>
                    {selectedCriminal.firNumber && (
                      <div className="text-center">
                        <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-1">FIR Number</strong>
                        <span className="text-blue-400 font-mono font-bold">{selectedCriminal.firNumber}</span>
                      </div>
                    )}
                    <div className="text-right">
                      <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Case Category</strong>
                      <span className="text-slate-300">{selectedCriminal.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliceDashboard;
