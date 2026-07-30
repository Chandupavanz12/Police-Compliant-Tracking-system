import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FileCheck, Download, Clock, XCircle, CheckCircle, Eye } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Certificate = React.forwardRef(({ data }, ref) => {
  if (!data) return null;

  const rows = [
    ['Full Name',             <strong style={{ textTransform:'uppercase' }}>{data.fullName}</strong>],
    ["Father's / Guardian Name", <strong style={{ textTransform:'uppercase' }}>{data.fatherName}</strong>],
    ['Date of Birth',         data.dob],
    ['Gender',                data.gender?.toUpperCase()],
    ['Aadhaar / ID Number',   data.aadhaar],
    ['Address',               data.address],
    ['Purpose',               data.purpose],
    ['Application Number',    data.applicationNumber],
    ['Date of Application',   new Date(data.dateOfApplication).toLocaleDateString('en-GB')],
    ['Date of Verification',  new Date(data.dateOfVerification || data.updatedAt).toLocaleDateString('en-GB')],
  ];

  return (
    <div ref={ref} style={{
      width: '794px',
      height: '1123px',
      padding: '50px 55px',
      fontFamily: 'Georgia, serif',
      backgroundColor: '#ffffff',
      color: '#000000',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Outer border */}
      <div style={{ position:'absolute', top:'14px', left:'14px', right:'14px', bottom:'14px', border:'5px solid #1e3a8a', pointerEvents:'none', zIndex:0 }} />
      {/* Inner border */}
      <div style={{ position:'absolute', top:'22px', left:'22px', right:'22px', bottom:'22px', border:'1.5px solid #1e3a8a', pointerEvents:'none', zIndex:0 }} />

      {/* Cert No & Date */}
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px', zIndex:1 }}>
        <span style={{ fontSize:'13px' }}>Certificate No: <strong>{data.certificateData?.certNumber}</strong></span>
        <span style={{ fontSize:'13px' }}>Date of Issue: <strong>{new Date(data.dateOfVerification || data.updatedAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</strong></span>
      </div>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:'16px', zIndex:1 }}>
        <h1 style={{ fontSize:'32px', fontWeight:'bold', color:'#1e3a8a', letterSpacing:'3px', margin:'0 0 4px 0', textTransform:'uppercase' }}>Karnataka Police</h1>
        <h2 style={{ fontSize:'16px', color:'#374151', margin:0, fontWeight:'normal', letterSpacing:'1px' }}>Government of Karnataka</h2>
      </div>

      {/* Certificate Title Banner */}
      <div style={{ textAlign:'center', marginBottom:'18px', zIndex:1 }}>
        <h3 style={{
          fontSize:'20px', fontWeight:'bold', color:'#1e3a8a',
          borderTop:'3px solid #1e3a8a', borderBottom:'3px solid #1e3a8a',
          padding:'8px 40px', display:'inline-block', margin:0,
          letterSpacing:'1.5px', textTransform:'uppercase'
        }}>
          Police Verification Certificate
        </h3>
      </div>

      {/* Intro */}
      <p style={{ textAlign:'center', fontSize:'15px', marginBottom:'20px', zIndex:1, fontStyle:'italic' }}>
        This is to certify that the following individual has been verified by the Karnataka Police Department and found to have <strong>no adverse criminal record</strong>.
      </p>

      {/* Main 2-column body */}
      <div style={{ display:'flex', gap:'24px', flex:1, zIndex:1 }}>

        {/* Left: Details */}
        <div style={{ flex:'1 1 55%', borderRight:'1px solid #d1d5db', paddingRight:'20px' }}>
          {rows.map(([label, value], i) => (
            <div key={i} style={{ display:'flex', marginBottom:'13px', fontSize:'14px', lineHeight:'1.5' }}>
              <span style={{ minWidth:'185px', fontWeight:'700', color:'#111827', flexShrink:0 }}>{label}</span>
              <span style={{ color:'#1f2937' }}>:&nbsp;{value}</span>
            </div>
          ))}
        </div>

        {/* Right: Status + QR */}
        <div style={{ flex:'1 1 38%', display:'flex', flexDirection:'column', alignItems:'center', gap:'18px' }}>
          {/* Status box */}
          <div style={{
            background:'#f0fdf4', border:'2px solid #86efac', borderRadius:'12px',
            padding:'18px 14px', textAlign:'center', width:'100%'
          }}>
            <div style={{ width:'52px', height:'52px', background:'#16a34a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', margin:'0 auto 10px', fontSize:'24px', fontWeight:'bold' }}>✓</div>
            <p style={{ fontSize:'11px', color:'#4b5563', fontWeight:'700', margin:'0 0 4px 0', textTransform:'uppercase', letterSpacing:'1px' }}>Verification Status</p>
            <p style={{ fontSize:'28px', fontWeight:'bold', color:'#15803d', margin:'0 0 8px 0' }}>CLEAR</p>
            <p style={{ fontSize:'11px', color:'#6b7280', lineHeight:'1.5' }}>
              As per the records of Karnataka Police, no criminal case is registered against the above mentioned individual.
            </p>
          </div>

          {/* QR Code */}
          <div style={{ textAlign:'center' }}>
            <QRCodeCanvas value={data.certificateData?.qrCodeData || 'invalid'} size={130} />
            <p style={{ fontSize:'12px', color:'#6b7280', marginTop:'6px', fontWeight:'500' }}>Scan to Verify Authenticity</p>
            <p style={{ fontSize:'11px', fontWeight:'700', color:'#1e3a8a' }}>{data.certificateData?.certNumber}</p>
          </div>
        </div>
      </div>

      {/* Validity */}
      <p style={{ textAlign:'center', fontSize:'13px', color:'#374151', margin:'18px 0 14px', borderTop:'1px dashed #9ca3af', paddingTop:'12px', zIndex:1 }}>
        This certificate is valid for <strong style={{ color:'#15803d' }}>180 days</strong> from the date of issue. Issued under the authority of Karnataka Police.
      </p>

      {/* Footer: Digital Signature */}
      <div style={{ display:'flex', justifyContent:'flex-end', zIndex:1 }}>
        <div style={{ border:'1.5px solid #9ca3af', padding:'12px 16px', width:'260px', background:'#f9fafb', borderRadius:'6px', position:'relative' }}>
          <p style={{ fontSize:'10px', color:'#6b7280', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 8px 0' }}>Digitally Signed</p>
          <div style={{ height:'52px', display:'flex', alignItems:'center', justifyContent:'center', borderBottom:'1px solid #d1d5db', marginBottom:'8px' }}>
            <span style={{ fontFamily:"'Dancing Script', cursive", fontSize:'22px', color:'#1e40af' }}>{data.station} Police Station</span>
          </div>
          <p style={{ fontSize:'10px', color:'#374151', margin:'3px 0' }}>Signed by: Station House Officer</p>
          <p style={{ fontSize:'10px', color:'#374151', margin:'3px 0' }}>Station: {data.station}</p>
          <p style={{ fontSize:'10px', color:'#374151', margin:'3px 0' }}>Date: {new Date(data.dateOfVerification || data.updatedAt).toLocaleString()}</p>
          <div style={{ position:'absolute', bottom:'10px', right:'10px', width:'22px', height:'22px', background:'#16a34a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'11px', fontWeight:'bold' }}>✓</div>
        </div>
      </div>

      <p style={{ textAlign:'center', fontSize:'11px', color:'#2563eb', marginTop:'12px', zIndex:1 }}>
        This is a digitally signed certificate. It does not require any physical signature or stamp.
      </p>
    </div>
  );
});


const VerificationStatus = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const certRef = useRef(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/verification/user/${user.id || user._id}`);
        setRequests(response.data.requests);
      } catch (err) {
        console.error('Failed to fetch verification requests', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id || user?._id) fetchRequests();
  }, [user]);

  const handleDownloadPDF = () => {
    if (!certRef.current) return;

    // Clone the certificate DOM node so we can safely mutate it
    const clone = certRef.current.cloneNode(true);

    // Find all <canvas> elements (QR code) in the clone and replace with <img>
    const canvases = certRef.current.querySelectorAll('canvas');
    const cloneCanvases = clone.querySelectorAll('canvas');
    canvases.forEach((canvas, i) => {
      const dataUrl = canvas.toDataURL('image/png');
      const img = document.createElement('img');
      img.src = dataUrl;
      img.width = canvas.width;
      img.height = canvas.height;
      img.style.display = 'block';
      cloneCanvases[i]?.replaceWith(img);
    });

    const printContents = clone.outerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      alert('Please allow popups for this site to download the certificate.');
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Police_Verification_${selectedCert.applicationNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: white; font-family: serif; }
            @page { size: A4 portrait; margin: 0; }
            @media print {
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
            img { max-width: 100%; }
            .bg-white { background-color: #ffffff !important; }
            .text-black { color: #000000; }
            .text-blue-900 { color: #1e3a8a; }
            .text-gray-700 { color: #374151; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-500 { color: #6b7280; }
            .text-green-600 { color: #16a34a; }
            .text-blue-800 { color: #1e40af; }
            .text-blue-600 { color: #2563eb; }
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .text-lg { font-size: 1.125rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-3xl { font-size: 1.875rem; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .uppercase { text-transform: uppercase; }
            .tracking-wide { letter-spacing: 0.05em; }
            .relative { position: relative; }
            .absolute { position: absolute; }
            .inset-4 { top:1rem; right:1rem; bottom:1rem; left:1rem; }
            .inset-5 { top:1.25rem; right:1.25rem; bottom:1.25rem; left:1.25rem; }
            .border-4 { border-width: 4px; border-style: solid; }
            .border { border-width: 1px; border-style: solid; }
            .border-2 { border-width: 2px; border-style: solid; }
            .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
            .border-y-2 { border-top: 2px solid; border-bottom: 2px solid; }
            .border-blue-900 { border-color: #1e3a8a; }
            .border-green-200 { border-color: #bbf7d0; }
            .border-gray-300 { border-color: #d1d5db; }
            .border-dashed { border-style: dashed; }
            .pointer-events-none { pointer-events: none; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .items-end { align-items: flex-end; }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .w-full { width: 100%; }
            .w-48 { width: 12rem; }
            .w-24 { width: 6rem; }
            .w-32 { width: 8rem; }
            .w-64 { width: 16rem; }
            .w-12 { width: 3rem; }
            .w-6 { width: 1.5rem; }
            .h-24 { height: 6rem; }
            .h-32 { height: 8rem; }
            .h-16 { height: 4rem; }
            .h-12 { height: 3rem; }
            .h-6 { height: 1.5rem; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-8 { margin-bottom: 2rem; }
            .mb-10 { margin-bottom: 2.5rem; }
            .mb-12 { margin-bottom: 3rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-8 { margin-top: 2rem; }
            .mt-12 { margin-top: 3rem; }
            .mt-auto { margin-top: auto; }
            .pl-6 { padding-left: 1.5rem; }
            .p-10 { padding: 2.5rem; }
            .p-4 { padding: 1rem; }
            .p-3 { padding: 0.75rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .px-8 { padding-left: 2rem; padding-right: 2rem; }
            .flex-1 { flex: 1; }
            .inline-block { display: inline-block; }
            .rounded-full { border-radius: 9999px; }
            .rounded-lg { border-radius: 0.5rem; }
            .bg-green-50 { background-color: #f0fdf4 !important; }
            .bg-green-500 { background-color: #22c55e !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            .bg-gray-200 { background-color: #e5e7eb !important; }
            .bottom-4 { bottom: 1rem; }
            .right-4 { right: 1rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .shrink-0 { flex-shrink: 0; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <FileCheck className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Verification Status</h1>
          <p className="text-slate-400 text-sm">Track your police verification applications.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-effect p-12 rounded-2xl text-center border border-slate-800/50">
          <FileCheck className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Applications Found</h3>
          <p className="text-slate-400">You haven't applied for a police verification certificate yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map(req => (
            <div key={req._id} className="glass-effect p-6 rounded-2xl border border-slate-800/50 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-blue-500/30 transition-colors">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full mt-1 ${
                  req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                  req.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {req.status === 'Approved' ? <CheckCircle className="w-6 h-6" /> :
                   req.status === 'Rejected' ? <XCircle className="w-6 h-6" /> :
                   <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">App No: {req.applicationNumber}</h3>
                  <div className="text-sm text-slate-400 mt-1 space-y-1">
                    <p>Applicant: {req.fullName}</p>
                    <p>Purpose: {req.purpose}</p>
                    <p>Applied On: {new Date(req.dateOfApplication).toLocaleDateString()}</p>
                  </div>
                  {req.statusMessage && (
                    <p className={`mt-3 text-sm font-medium ${req.status === 'Rejected' ? 'text-red-400' : 'text-slate-300'}`}>
                      {req.statusMessage}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col items-end space-y-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                  req.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {req.status.toUpperCase()}
                </span>
                
                {req.status === 'Approved' && (
                  <button
                    onClick={() => setSelectedCert(req)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Certificate</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Verification Certificate</h3>
              <div className="flex space-x-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {isGeneratingPDF ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>
                <button onClick={() => setSelectedCert(null)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex justify-center items-center bg-gray-100 flex-1">
              {/* This is the hidden actual certificate that will be rendered for PDF */}
              <div className="scale-75 origin-top md:scale-100 shadow-2xl">
                 <Certificate data={selectedCert} ref={certRef} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationStatus;
