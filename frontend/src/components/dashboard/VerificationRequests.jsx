import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FileCheck, CheckCircle, XCircle, Search, RefreshCw, Eye } from 'lucide-react';

const VerificationRequests = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Assuming user has a station, we filter by it. Or we fetch all for now and filter frontend
      const res = await axios.get('http://localhost:5000/api/verification/station', {
        params: { station: user.station } // if police officer is assigned to a station
      });
      setRequests(res.data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this verification request? This will generate a digital signature.")) return;
    setProcessingId(id);
    try {
      await axios.post(`http://localhost:5000/api/verification/approve/${id}`);
      alert("Application Approved. Certificate generated.");
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to REJECT this verification application due to criminal records?")) return;
    setProcessingId(id);
    try {
      await axios.post(`http://localhost:5000/api/verification/reject/${id}`);
      alert("Application Rejected.");
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(r => 
    (r.fullName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.applicationNumber?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.aadhaar?.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Verification Requests</h1>
          <p className="text-slate-400 text-sm">Review and approve citizen police verification applications.</p>
        </div>
        <button onClick={fetchRequests} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by name, application number, or Aadhaar..."
          className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><RefreshCw className="w-8 h-8 text-blue-400 animate-spin" /></div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16 glass-effect rounded-2xl border border-slate-800/50">
          <FileCheck className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No Applications Found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">{filteredRequests.length} request(s) found</p>
          {filteredRequests.map(req => (
            <div key={req._id} className="p-6 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-slate-600 transition-colors">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{req.fullName}</h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{req.applicationNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      req.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div className="flex"><span className="text-slate-500 w-24 block">Father's Name</span><span className="text-slate-300">: {req.fatherName}</span></div>
                    <div className="flex"><span className="text-slate-500 w-24 block">Aadhaar</span><span className="text-slate-300">: {req.aadhaar}</span></div>
                    <div className="flex"><span className="text-slate-500 w-24 block">Purpose</span><span className="text-slate-300">: {req.purpose}</span></div>
                    <div className="flex"><span className="text-slate-500 w-24 block">Mobile</span><span className="text-slate-300">: {req.mobile}</span></div>
                    <div className="flex col-span-1 md:col-span-2"><span className="text-slate-500 w-24 block shrink-0">Address</span><span className="text-slate-300">: {req.address}</span></div>
                  </div>
                  
                  {req.status === 'Rejected' && req.statusMessage && (
                    <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-sm text-red-300 flex items-start gap-2">
                       <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                       <p>{req.statusMessage}</p>
                    </div>
                  )}

                  {req.status === 'Pending' && (
                    <div className={`mt-4 p-3 rounded-lg border flex items-start gap-3 ${
                      req.hasCriminalRecord 
                        ? 'bg-rose-900/20 border-rose-500/30 text-rose-300' 
                        : 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300'
                    }`}>
                      {req.hasCriminalRecord ? (
                        <>
                          <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-rose-400">⚠️ CRIMINAL RECORD MATCH FOUND</p>
                            <p className="text-sm mt-1">System found matching records for this applicant and father's name. Please reject the application.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-emerald-400">CLEAR BACKGROUND</p>
                            <p className="text-sm mt-1">No criminal records found with the applicant name. Do you want to approve?</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col gap-2 shrink-0">
                  {req.status === 'Pending' && !req.hasCriminalRecord && (
                    <button
                      onClick={() => handleApprove(req._id)}
                      disabled={processingId === req._id}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {processingId === req._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve & Sign
                    </button>
                  )}
                  {req.status === 'Pending' && req.hasCriminalRecord && (
                    <button
                      onClick={() => handleReject(req._id)}
                      disabled={processingId === req._id}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                    >
                      {processingId === req._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject Application
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerificationRequests;
