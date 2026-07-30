import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertTriangle, Loader, File, X } from 'lucide-react';

const EvidenceUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFiles = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError('');

    // Simulate upload (in production, upload to a specific complaint)
    await new Promise(r => setTimeout(r, 2500));

    setUploaded(files.map(f => f.name));
    setFiles([]);
    setUploading(false);
  };

  return (
    <div className="glass-effect rounded-2xl p-8 border border-slate-800/50">
      <div className="mb-8 border-b border-slate-800/50 pb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
          <UploadCloud className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Evidence Upload Centre</h2>
          <p className="text-slate-400">Upload additional evidence files (photos, videos, documents) for your existing complaints.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}

      {uploaded.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold">Upload Complete!</span>
          </div>
          <ul className="text-sm space-y-1 pl-7">
            {uploaded.map((f, i) => <li key={i}>✓ {f}</li>)}
          </ul>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); }}
        className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/30 hover:bg-blue-500/5 mb-6"
      >
        <input ref={inputRef} type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={handleFiles} />
        <UploadCloud className="w-14 h-14 text-slate-500 mb-4" />
        <p className="text-slate-300 font-medium mb-1">Click or drag & drop files here</p>
        <p className="text-slate-500 text-sm">Supports: JPG, PNG, MP4, PDF — Max 10MB per file</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mb-6 space-y-2">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Queued Files ({files.length})</h3>
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3">
              <File className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="text-slate-300 text-sm flex-1 truncate">{f.name}</span>
              <span className="text-slate-500 text-xs">{(f.size / 1024).toFixed(0)} KB</span>
              <button onClick={() => removeFile(i)} className="text-slate-600 hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={files.length === 0 || uploading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 disabled:opacity-40 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
      >
        {uploading ? <><Loader className="w-5 h-5 animate-spin" /> Uploading...</> : <><UploadCloud className="w-5 h-5" /> Upload {files.length > 0 ? `${files.length} File(s)` : 'Files'}</>}
      </button>
    </div>
  );
};

export default EvidenceUpload;
