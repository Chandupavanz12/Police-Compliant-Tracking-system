import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UserSearch, Upload, CheckCircle, Loader, AlertTriangle, MapPin } from 'lucide-react';
import { karnatakaData } from '../../utils/karnatakaData';

const MissingPersonForm = ({ setActiveTab }) => {
  const [form, setForm] = useState({
    name: '', age: '', gender: '', lastSeenLocation: '', lastSeenDate: '',
    description: '', contactNumber: '', district: '', taluk: '', station: ''
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const districts = Object.keys(karnatakaData);
  const taluks = form.district ? Object.keys(karnatakaData[form.district]) : [];
  const stations = form.taluk ? karnatakaData[form.district][form.taluk] : [];

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (f) { setPhoto(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (photo) data.append('photo', photo);
      const res = await axios.post('http://localhost:5000/api/missing', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(res.data.report);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center h-[60vh] glass-effect rounded-2xl border border-amber-500/50 p-8 text-center bg-amber-900/10">
      <CheckCircle className="w-20 h-20 text-amber-400 mb-6" />
      <h2 className="text-3xl font-bold text-white mb-2">Report Filed — {success.reportId}</h2>
      <p className="text-amber-200 mb-2">Missing person details have been shared with all police stations across the network.</p>
      <p className="text-slate-400 text-sm">You will be notified immediately when any station gets information.</p>
      <button onClick={() => setActiveTab('missing_track')} className="mt-6 px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors">
        Track Report
      </button>
    </div>
  );

  return (
    <div className="glass-effect rounded-2xl p-8 border border-slate-800/50">
      <div className="mb-8 border-b border-slate-800/50 pb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
          <UserSearch className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Report Missing Person</h2>
          <p className="text-slate-400">Your report is shared instantly with all police stations in the network.</p>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">Full Name *</label>
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Missing person's full name" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">Age *</label>
                <input required type="number" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} placeholder="Age" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">Gender *</label>
                <select required value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500">
                  <option value="" disabled>Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">Contact Number *</label>
                <input required type="tel" pattern="\d{10}" maxLength="10" minLength="10" title="Must be exactly 10 digits" value={form.contactNumber} onChange={e=>setForm({...form,contactNumber:e.target.value.replace(/\D/g, '')})} placeholder="10 digit mobile number" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Last Seen Location *</label>
              <input required value={form.lastSeenLocation} onChange={e=>setForm({...form,lastSeenLocation:e.target.value})} placeholder="Street / Area / Landmark" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Last Seen Date & Time *</label>
              <input required type="datetime-local" value={form.lastSeenDate} onChange={e=>setForm({...form,lastSeenDate:e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Physical Description *</label>
              <textarea required rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Height, skin tone, clothing worn, any identifying marks..." className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 resize-none" />
            </div>

            {/* Jurisdiction */}
            <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/30 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-slate-200">Last Known Jurisdiction</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select required value={form.district} onChange={e=>setForm({...form,district:e.target.value,taluk:'',station:''})} className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                  <option value="" disabled>District</option>
                  {districts.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
                <select required disabled={!form.district} value={form.taluk} onChange={e=>setForm({...form,taluk:e.target.value,station:''})} className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 disabled:opacity-50">
                  <option value="" disabled>Taluk</option>
                  {taluks.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <select required disabled={!form.taluk} value={form.station} onChange={e=>setForm({...form,station:e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 disabled:opacity-50">
                <option value="" disabled>Police Station</option>
                {stations.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Right: Photo Upload */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Recent Photograph *</label>
            <div onClick={()=>fileRef.current?.click()} className={`relative h-72 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${preview ? 'border-amber-500/50' : 'border-slate-700 hover:border-amber-500/40 bg-slate-900/30'}`}>
              <input type="file" ref={fileRef} onChange={handlePhoto} className="hidden" accept="image/*" />
              {preview ? (
                <img src={preview} alt="Missing person" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center p-6 text-center">
                  <Upload className="w-12 h-12 text-amber-400/50 mb-3" />
                  <p className="text-slate-300 font-medium">Upload a clear, recent photo</p>
                  <p className="text-slate-500 text-xs mt-2">This will be circulated to all police stations</p>
                </div>
              )}
              {preview && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-2 text-center">
                  <span className="text-xs text-amber-300">Click to change photo</span>
                </div>
              )}
            </div>

            <div className="mt-4 bg-amber-900/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-200">
              <p className="font-bold mb-1">📢 How it works:</p>
              <ul className="space-y-1 text-amber-200/80 text-xs">
                <li>• Report is instantly visible to all police stations in the system</li>
                <li>• Any officer can update the status when they find information</li>
                <li>• You will receive an immediate notification when status changes</li>
                <li>• Keep your contact number reachable at all times</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/50 flex justify-end gap-4 mt-6">
          <button type="button" onClick={()=>setActiveTab('dashboard')} className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <><Loader className="w-5 h-5 animate-spin" /> Submitting...</> : '🔍 Submit Report to All Stations'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MissingPersonForm;
