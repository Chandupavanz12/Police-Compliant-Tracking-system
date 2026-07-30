import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, MapPin, Scale, AlertOctagon, CheckCircle2, Clock, Trash2, XCircle, Download } from 'lucide-react';

const TrackComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/complaints/user');
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleEscalate = async (id) => {
    if (!window.confirm('Are you sure you want to escalate this complaint to the Administration?')) return;
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}/escalate`);
      fetchComplaints();
      alert('Complaint has been successfully escalated to the higher administration.');
    } catch (err) {
      console.error(err);
      alert('Failed to escalate complaint.');
    }
  };

  const handleMarkSolved = async (id) => {
    if (!window.confirm('By marking this as solved, you confirm that the police have satisfactorily resolved your issue. Continue?')) return;
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}/mark-solved`);
      fetchComplaints();
      alert('Thank you for confirming the resolution.');
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const isEscalationEligible = (c) => {
    if (c.isCitizenSolved || c.isRevoked) return false;
    return c.status === 'Resolved' || c.status === 'Filed' || c.status === 'In Progress';
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this complaint? It will be marked as Case Closed and no further action will be taken.')) return;
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}/revoke`);
      fetchComplaints();
      alert('Complaint revoked successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke complaint.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint? This cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/complaints/${id}`);
      fetchComplaints();
    } catch (err) {
      alert('Failed to delete complaint.');
    }
  };

  const handleDownloadPDF = (c) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Complaint Report - ${c.complaintId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
            .box { padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }
            .title { font-size: 12px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 4px; }
            .val { font-size: 16px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Official Police Complaint Report</h1>
          <p><strong>Complaint ID:</strong> ${c.complaintId}</p>
          <p><strong>Filing Date:</strong> ${new Date(c.dateFiled).toLocaleString()}</p>
          <p><strong>Current Status:</strong> <span class="badge" style="background:#eee;">${c.status}</span></p>
          
          <div class="grid">
            <div class="box">
              <div class="title">Category / Crime Type</div>
              <div class="val">${c.category}</div>
            </div>
            <div class="box">
              <div class="title">Assigned Jurisdiction</div>
              <div class="val">${c.station || 'Pending'}, ${c.taluk || ''}, ${c.district || ''}</div>
            </div>
          </div>

          <div class="box" style="margin-top:20px;">
            <div class="title">Complaint Title</div>
            <div class="val">${c.title}</div>
            <div class="title" style="margin-top:15px;">Description</div>
            <p>${c.description}</p>
          </div>

          <div class="grid">
            <div class="box">
              <div class="title">FIR Status</div>
              <div class="val">${c.isFirFiled ? 'FIR FILED' : 'Not Filed'}</div>
              ${c.isFirFiled ? `<p style="margin-top:5px; font-size:14px;">${c.firDetails}</p>` : ''}
            </div>
            <div class="box">
              <div class="title">Judgement / Court Status</div>
              <div class="val">${c.courtStatus || 'Not applicable'}</div>
            </div>
          </div>
          
          <p style="margin-top:40px; font-size:12px; color:#666; text-align:center;">This is a system generated report from the Smart Police Complaint Management System.</p>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] glass-effect rounded-2xl border border-slate-800/50 p-8">
        <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-4" />
        <p className="text-slate-400">Loading your complaint records...</p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] glass-effect rounded-2xl border border-slate-800/50 p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Complaints Filed</h2>
        <p className="text-slate-400">You haven't submitted any complaints to track yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-2xl p-8 border border-slate-800/50">
      <div className="flex justify-between items-end mb-8 border-b border-slate-800/50 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Track Complaints</h2>
          <p className="text-slate-400">Monitor real-time updates from Police and Court proceedings.</p>
        </div>
        <button 
          onClick={fetchComplaints}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="space-y-6">
        {complaints.map(c => {
          const canEscalate = isEscalationEligible(c);
          
          return (
            <div key={c._id} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{c.complaintId}</span>
                      <h3 className="text-xl font-bold text-white">{c.category}</h3>
                    </div>
                    <h4 className="text-slate-300 font-medium mb-1">{c.title}</h4>
                    <p className="text-xs text-slate-500">Filed on: {new Date(c.dateFiled).toLocaleString()}</p>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${c.statusColor.replace('text-', 'border-').split(' ')[0]} ${c.statusColor}`}>
                      {c.status}
                    </span>
                    
                    <div className="flex items-center gap-2 mt-1">
                      {c.isEscalated ? (
                        <span className="text-xs font-bold text-red-400 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                          <AlertOctagon className="w-3 h-3" /> Escalated
                        </span>
                      ) : !c.isRevoked && (
                        <button 
                          onClick={() => handleEscalate(c._id)}
                          disabled={!canEscalate}
                          title={canEscalate ? "Escalate to admin" : "Cannot escalate yet"}
                          className={`text-xs px-2 py-1 rounded flex items-center gap-1 font-semibold transition-all ${
                            canEscalate ? "bg-red-500 hover:bg-red-600 text-white" : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                          }`}
                        >
                          <AlertOctagon className="w-3 h-3" /> Escalate
                        </button>
                      )}

                      {!c.isFirFiled && !c.isRevoked && (
                        <button 
                          onClick={() => handleRevoke(c._id)}
                          className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/30 flex items-center gap-1 font-semibold transition-all"
                        >
                          <XCircle className="w-3 h-3" /> Revoke
                        </button>
                      )}

                      <button 
                        onClick={() => handleDelete(c._id)}
                        className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white border border-slate-700 flex items-center gap-1 font-semibold transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <button 
                        onClick={() => handleDownloadPDF(c)}
                        className="text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 flex items-center gap-1 font-semibold transition-all"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    </div>
                  </div>
                </div>

                {c.isRevoked && (
                  <div className="mb-4 bg-slate-800/50 border border-slate-700 p-3 rounded-lg flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-slate-400" />
                    <p className="text-sm text-slate-300">You have formally revoked and withdrawn this complaint. No further police action will be taken.</p>
                  </div>
                )}
                
                {c.isFirFiled && (
                  <div className="mb-4 bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Scale className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-bold text-emerald-400">Formal FIR Filed</h4>
                    </div>
                    <p className="text-sm text-emerald-100/70">{c.firDetails}</p>
                  </div>
                )}

                {c.status === 'Resolved' && c.resolvedProofBase64 && (
                  <div className="mb-4 bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl">
                    <h4 className="font-bold text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Resolution Proof Provided by Police</h4>
                    <img src={c.resolvedProofBase64} alt="Resolution Proof" className="w-full max-h-[400px] object-contain rounded-lg border border-emerald-500/30 bg-black/50" />
                    
                    {!c.isCitizenSolved ? (
                      <div className="mt-4 flex flex-col md:flex-row items-center justify-between bg-emerald-900/30 p-4 rounded-lg border border-emerald-500/30 gap-4">
                        <span className="text-sm text-emerald-200 font-medium text-center md:text-left">Please review the proof above. Has your issue been completely resolved?</span>
                        <div className="flex gap-3 shrink-0">
                          <button onClick={() => handleMarkSolved(c._id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg">Yes, Mark as Solved</button>
                          <button onClick={() => handleEscalate(c._id)} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg">No, Escalate to Admin</button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 bg-emerald-500/20 text-emerald-400 p-4 rounded-lg border border-emerald-500/30 text-sm font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5"/> You have verified and accepted this resolution. No further action is needed.
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-black/20 rounded-xl border border-slate-800">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs text-slate-400 mb-0.5">Assigned Jurisdiction</span>
                      <span className="text-sm text-slate-200 font-medium">{c.station || 'Pending Assignment'}</span>
                      <span className="block text-xs text-slate-500">{c.taluk ? `${c.taluk}, ${c.district}` : 'Routing in progress...'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Scale className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="block text-xs text-slate-400 mb-0.5">Judgement & Court Status</span>
                      <span className={`text-sm font-medium ${c.courtStatus && c.courtStatus !== 'Not applicable' ? 'text-purple-300' : 'text-slate-200'}`}>
                        {c.courtStatus && c.courtStatus !== 'Not applicable' ? c.courtStatus : 'Awaiting Hearing / Not applicable yet'}
                      </span>
                      {c.finalJudgement && (
                        <div className="mt-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                          <span className="block text-xs font-bold text-purple-400 mb-1">Final Court Judgement</span>
                          <p className="text-sm text-purple-200">{c.finalJudgement}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Progress Bar Timeline */}
              <div className="bg-slate-800/30 px-6 py-4 border-t border-slate-800">
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                  <span className={['Filed','In Progress','Under Review','Arrested Suspect','Case Closed','Resolved'].includes(c.status) ? 'text-blue-400' : ''}>Filed</span>
                  <span className={['In Progress','Under Review','Arrested Suspect','Case Closed','Resolved'].includes(c.status) ? 'text-amber-400' : ''}>In Progress</span>
                  <span className={['Under Review','Arrested Suspect','Case Closed','Resolved'].includes(c.status) ? 'text-purple-400' : ''}>Under Review</span>
                  <span className={['Arrested Suspect','Case Closed','Resolved'].includes(c.status) ? 'text-rose-400' : ''}>Arrested/Closed</span>
                  <span className={c.status === 'Resolved' ? 'text-emerald-400' : ''}>Resolved</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${
                    c.status === 'Resolved' ? 'w-full bg-emerald-500' :
                    (c.status === 'Arrested Suspect' || c.status === 'Case Closed') ? 'w-4/5 bg-rose-500' :
                    c.status === 'Under Review' ? 'w-3/5 bg-purple-500' :
                    c.status === 'In Progress' ? 'w-2/5 bg-amber-500' : 'w-1/5 bg-blue-500'
                  }`}></div>
                </div>
              </div>
              

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackComplaint;
