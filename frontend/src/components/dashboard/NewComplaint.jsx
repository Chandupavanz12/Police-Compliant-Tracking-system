import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertTriangle, Loader, MapPin } from 'lucide-react';
import { karnatakaData } from '../../utils/karnatakaData';

const NewComplaint = ({ setActiveTab }) => {
  const [formData, setFormData] = useState({ 
    title: '', description: '', category: '', customCategory: '',
    district: '', taluk: '', station: '', incidentLocation: ''
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const districts = Object.keys(karnatakaData);
  const taluks = formData.district ? Object.keys(karnatakaData[formData.district]) : [];
  const stations = formData.taluk ? karnatakaData[formData.district][formData.taluk] : [];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('customCategory', formData.customCategory);
      data.append('district', formData.district);
      data.append('taluk', formData.taluk);
      data.append('station', formData.station);
      data.append('incidentLocation', formData.incidentLocation);
      if (file) {
        data.append('evidence', file);
      }

      await axios.post('http://localhost:5000/api/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      setTimeout(() => {
        setActiveTab('dashboard'); 
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] glass-effect rounded-2xl border border-emerald-500/50 p-8 text-center bg-emerald-900/10">
        <CheckCircle className="w-20 h-20 text-emerald-400 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">Complaint Submitted!</h2>
        <p className="text-emerald-300">Your complaint has been successfully forwarded to the {formData.station || 'Police'} and Admin portals.</p>
        <p className="text-sm text-slate-400 mt-4">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-2xl p-8 border border-slate-800/50">
      <div className="mb-8 border-b border-slate-800/50 pb-6">
        <h2 className="text-2xl font-bold text-white mb-2">File a New Complaint</h2>
        <p className="text-slate-400">Please provide detailed information about the incident.</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3"><AlertTriangle className="w-5 h-5"/> {error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Form Details */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Incident Title</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Brief summary of the incident"
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Incident Location (Map / Exact Address)</label>
              <input 
                type="text" 
                required
                value={formData.incidentLocation}
                onChange={e => setFormData({...formData, incidentLocation: e.target.value})}
                placeholder="Exact location where incident occurred"
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Jurisdiction Selectors */}
            <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/30 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-slate-200">Incident Jurisdiction (Karnataka)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select 
                  required
                  value={formData.district}
                  onChange={e => setFormData({...formData, district: e.target.value, taluk: '', station: ''})}
                  className="w-full bg-slate-800/80 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="" disabled>Select District</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select 
                  required
                  disabled={!formData.district}
                  value={formData.taluk}
                  onChange={e => setFormData({...formData, taluk: e.target.value, station: ''})}
                  className="w-full bg-slate-800/80 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="" disabled>Select Taluk</option>
                  {taluks.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <select 
                required
                disabled={!formData.taluk}
                value={formData.station}
                onChange={e => setFormData({...formData, station: e.target.value})}
                className="w-full bg-slate-800/80 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="" disabled>Select Police Station</option>
                {stations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select 
                required
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="" disabled>Select category...</option>
                <option value="Theft">Theft</option>
                <option value="Assault">Assault</option>
                <option value="Cyber Crime">Cyber Crime</option>
                <option value="Fraud">Fraud</option>
                <option value="Vandalism">Vandalism</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {formData.category === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Specify Other Category</label>
                <input 
                  type="text" 
                  required
                  value={formData.customCategory}
                  onChange={e => setFormData({...formData, customCategory: e.target.value})}
                  placeholder="Please specify the crime type"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Detailed Description</label>
              <textarea 
                required
                rows="4"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Provide all relevant details regarding the incident..."
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
              ></textarea>
            </div>
          </div>

          {/* Right Column: Evidence Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Evidence Upload (Optional)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative h-[250px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${
                preview ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30 bg-slate-900/30'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,video/*" 
              />
              {preview ? (
                <>
                  {file && file.type.startsWith('video/') ? (
                    <video src={preview} className="absolute inset-0 w-full h-full object-cover opacity-30" muted loop autoPlay playsInline />
                  ) : (
                    <img src={preview} alt="Evidence" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  )}
                  <div className="z-10 flex flex-col items-center bg-black/50 p-4 rounded-xl backdrop-blur-sm">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
                    <span className="text-sm font-medium text-white text-center">Evidence Attached</span>
                    <span className="text-xs text-slate-300 mt-1">Click to change</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center p-6">
                  <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
                  <span className="text-sm font-medium text-slate-300 text-center">Click or drag photo/video here</span>
                  <span className="text-xs text-slate-500 mt-2">Max file size 10MB</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/50 flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-3 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading || !formData.title || !formData.description || !formData.category || !formData.station}
            className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin mr-2" /> : null}
            {loading ? 'Submitting...' : 'Submit to Station'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewComplaint;
