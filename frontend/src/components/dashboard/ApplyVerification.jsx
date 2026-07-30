import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FileCheck, MapPin, User, FileText, Phone, Calendar, AlertCircle, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { karnatakaData } from '../../utils/karnatakaData';

const ApplyVerification = ({ setActiveTab }) => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    fatherName: '',
    dob: '',
    gender: 'Male',
    aadhaar: '',
    address: '',
    mobile: '',
    purpose: '',
    district: '',
    taluk: '',
    station: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [aadhaarError, setAadhaarError] = useState('');
  const [rejected, setRejected] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fullName' || name === 'fatherName') {
      // Letters and spaces only
      const letters = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData({ ...formData, [name]: letters });
    } else if (name === 'mobile') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, mobile: digits });
      setMobileError(digits.length > 0 && digits.length < 10 ? 'Mobile number must be exactly 10 digits.' : '');
    } else if (name === 'aadhaar') {
      // Strip non-digits, cap at 12
      const digits = value.replace(/\D/g, '').slice(0, 12);
      // Format as XXXX XXXX XXXX
      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      setFormData({ ...formData, aadhaar: formatted });
      const rawDigits = digits;
      setAadhaarError(rawDigits.length > 0 && rawDigits.length < 12 ? 'Aadhaar must be exactly 12 digits.' : '');
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const districts = Object.keys(karnatakaData);
  const availableTaluks = formData.district ? Object.keys(karnatakaData[formData.district]) : [];
  const availableStations = formData.taluk && formData.district ? karnatakaData[formData.district][formData.taluk] : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setRejected(false);

    if (formData.mobile.length !== 10) {
      setMobileError('Mobile number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    const rawAadhaar = formData.aadhaar.replace(/\s/g, '');
    if (rawAadhaar.length !== 12) {
      setAadhaarError('Aadhaar must be exactly 12 digits.');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Pre-check criminal records BEFORE submitting
      const checkRes = await axios.post('http://localhost:5000/api/verification/pre-check', {
        fullName: formData.fullName,
        fatherName: formData.fatherName
      });

      if (checkRes.data.hasCriminalRecord) {
        // Immediately reject — do NOT submit the application
        setRejected(true);
        setError(checkRes.data.message);
        setLoading(false);
        return;
      }

      // Step 2: No criminal record — proceed to submit
      const response = await axios.post('http://localhost:5000/api/verification/apply', {
        userId: user.id || user._id,
        ...formData
      });
      
      if (response.data.success) {
        setSuccess('Your verification application has been submitted successfully! The police station will review it shortly.');
        setTimeout(() => {
          setActiveTab('verification_status');
        }, 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <FileCheck className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Apply for Police Verification</h1>
          <p className="text-slate-400 text-sm">Request a background verification certificate.</p>
        </div>
      </div>

      <div className="glass-effect p-8 rounded-2xl border border-slate-800/50 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>

        {/* Criminal Record Rejection Banner */}
        {rejected && (
          <div className="mb-6 p-5 bg-red-900/30 border border-red-500/50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/20 rounded-full shrink-0">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h4 className="text-red-400 font-bold text-base mb-1">Application Rejected</h4>
                <p className="text-red-300/80 text-sm leading-relaxed">{error}</p>
                <p className="text-slate-400 text-xs mt-3">
                  If you believe this is an error, please contact your nearest police station.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generic error (non-criminal-record errors) */}
        {error && !rejected && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-red-400">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center text-emerald-400">
            <ShieldCheck className="w-5 h-5 mr-3 shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Applicant Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center mb-4">
                <User className="w-5 h-5 mr-2 text-blue-400" /> Personal Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Father's / Guardian's Name</label>
                <input 
                  type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                  placeholder="Enter father's name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date of Birth</label>
                  <input 
                    type="date" name="dob" value={formData.dob} onChange={handleChange} required
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Gender</label>
                  <select 
                    name="gender" value={formData.gender} onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Aadhaar Number</label>
                <input 
                  type="text" name="aadhaar" value={formData.aadhaar} onChange={handleChange} required
                  maxLength={14}
                  className={`w-full bg-slate-900/50 border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 font-mono tracking-widest ${
                    aadhaarError ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/50' : 'border-slate-700/50 focus:border-blue-500/50 focus:ring-blue-500/50'
                  }`}
                  placeholder="XXXX XXXX XXXX"
                />
                {aadhaarError && <p className="text-red-400 text-xs mt-1">{aadhaarError}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mobile Number</label>
                <input 
                  type="text" name="mobile" value={formData.mobile} onChange={handleChange} required
                  maxLength={10}
                  className={`w-full bg-slate-900/50 border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 ${
                    mobileError ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/50' : 'border-slate-700/50 focus:border-blue-500/50 focus:ring-blue-500/50'
                  }`}
                  placeholder="10 digit number"
                />
                {mobileError && <p className="text-red-400 text-xs mt-1">{mobileError}</p>}
              </div>
            </div>

            {/* Jurisdiction & Other Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center mb-4">
                <MapPin className="w-5 h-5 mr-2 text-blue-400" /> Jurisdiction & Purpose
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                <textarea 
                  name="address" value={formData.address} onChange={handleChange} required rows={3}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none"
                  placeholder="Full residential address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Purpose of Verification</label>
                <select 
                  name="purpose" value={formData.purpose} onChange={handleChange} required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                >
                  <option value="">Select Purpose</option>
                  <option value="Employment">Employment</option>
                  <option value="Passport">Passport</option>
                  <option value="Visa / Immigration">Visa / Immigration</option>
                  <option value="Tenant Verification">Tenant Verification</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">District</label>
                <select 
                  name="district" value={formData.district} onChange={handleChange} required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                >
                  <option value="">Select District</option>
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {formData.district && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Taluk</label>
                  <select 
                    name="taluk" value={formData.taluk} onChange={handleChange} required
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                  >
                    <option value="">Select Taluk</option>
                    {availableTaluks.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.taluk && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Police Station</label>
                  <select 
                    name="station" value={formData.station} onChange={handleChange} required
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                  >
                    <option value="">Select Police Station</option>
                    {availableStations.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/50 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-500 hover:to-blue-400'}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileCheck className="w-5 h-5 mr-2" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyVerification;
