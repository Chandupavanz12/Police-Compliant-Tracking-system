import React, { useState } from 'react';
import { Image, Upload, Brain, CheckCircle, AlertTriangle, Loader } from 'lucide-react';

const ImageAnalysis = () => {
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResult(null);
    setPreview(URL.createObjectURL(file));
    setAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const categories = ['Theft', 'Vandalism', 'Assault', 'Fraud', 'Cyber Crime'];
      const threats = ['Low Risk', 'Medium Risk', 'High Risk'];
      const findings = [
        'Detected signs of forced entry on door frame.',
        'Evidence of property damage visible in the upper-right quadrant.',
        'Potential suspect figure captured in background (blurred).',
        'Time-stamp metadata indicates incident at nighttime.',
        'Multiple individuals present — possible group offence.',
      ];
      
      setResult({
        category: categories[Math.floor(Math.random() * categories.length)],
        confidence: `${Math.floor(85 + Math.random() * 14)}%`,
        threatLevel: threats[Math.floor(Math.random() * threats.length)],
        findings: findings.slice(0, Math.floor(2 + Math.random() * 3)),
      });
      setAnalyzing(false);
    }, 3500);
  };

  return (
    <div className="glass-effect rounded-2xl p-8 border border-slate-800/50">
      <div className="mb-8 border-b border-slate-800/50 pb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
          <Image className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Evidence Image Analysis</h2>
          <p className="text-slate-400">Upload crime-related images. Our forensic AI will analyze and identify key findings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div>
          <label
            htmlFor="ai-image-upload"
            className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
              preview ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-900/30'
            }`}
          >
            <input id="ai-image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            {preview ? (
              <img src={preview} alt="Upload preview" className="w-full h-full object-contain p-3 rounded-2xl" />
            ) : (
              <div className="flex flex-col items-center p-6 text-center">
                <Upload className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-slate-300 font-medium">Click to upload evidence image</p>
                <p className="text-slate-500 text-sm mt-2">PNG, JPG, WEBP up to 10MB</p>
              </div>
            )}
          </label>
        </div>

        {/* Results Area */}
        <div className="flex flex-col">
          {!preview && !analyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-900/30 rounded-2xl border border-slate-800/50 p-8">
              <Brain className="w-14 h-14 text-slate-600 mb-4" />
              <p className="text-slate-400 font-medium">Upload an image to run forensic AI analysis</p>
            </div>
          )}

          {analyzing && (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/30 rounded-2xl border border-cyan-500/20 p-8 gap-4">
              <Loader className="w-10 h-10 text-cyan-400 animate-spin" />
              <p className="text-cyan-300 font-semibold">Forensic AI Scanning...</p>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
              <p className="text-xs text-slate-500">Object detection • Scene classification • Metadata extraction</p>
            </div>
          )}

          {result && !analyzing && (
            <div className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-lg">Analysis Complete</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/80 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Category</p>
                  <p className="text-sm font-bold text-purple-400">{result.category}</p>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Confidence</p>
                  <p className="text-sm font-bold text-emerald-400">{result.confidence}</p>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Threat Level</p>
                  <p className={`text-sm font-bold ${result.threatLevel === 'High Risk' ? 'text-red-400' : result.threatLevel === 'Medium Risk' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {result.threatLevel}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> AI Forensic Findings
                </h4>
                <ul className="space-y-2">
                  {result.findings.map((f, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-500 mt-1">▸</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysis;
