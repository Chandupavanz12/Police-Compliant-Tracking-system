import React, { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { ShieldCheck, ShieldX, Camera, Loader2, ScanFace, AlertTriangle } from 'lucide-react';

// face-api.js models are hosted on the official CDN / jsDelivr
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

const SCAN_LINE_DURATION = 2000; // ms for one scan-line sweep

const FaceVerification = ({ userId, onSuccess, onFailure, onClose }) => {
  const webcamRef = useRef(null);
  const [phase, setPhase] = useState('loading'); // loading | ready | scanning | success | error
  const [message, setMessage] = useState('Loading biometric models…');
  const [scanProgress, setScanProgress] = useState(0);

  // ── Load face-api models ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        if (!cancelled) {
          setPhase('ready');
          setMessage('Position your face in the frame, then click Scan.');
        }
      } catch (err) {
        console.error('[FaceVerification] Model load error:', err);
        if (!cancelled) {
          setPhase('error');
          setMessage('Failed to load biometric models. Check your internet connection.');
        }
      }
    };
    loadModels();
    return () => { cancelled = true; };
  }, []);

  // ── Animated scan progress ──────────────────────────────────────────────────
  const runScanAnimation = () => {
    setScanProgress(0);
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / SCAN_LINE_DURATION) * 100, 100);
      setScanProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // ── Capture + verify ────────────────────────────────────────────────────────
  const handleScan = useCallback(async () => {
    if (!webcamRef.current) return;
    setPhase('scanning');
    setMessage('Scanning face… please hold still.');
    runScanAnimation();

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error('Could not capture webcam frame.');

      // Create an HTMLImageElement for face-api to process
      const img = new Image();
      img.src = imageSrc;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setPhase('error');
        setMessage('No face detected. Ensure good lighting and face the camera directly.');
        return;
      }

      const liveDescriptor = Array.from(detection.descriptor);

      // Send to backend
      const { data } = await axios.post(
        `http://localhost:5000/api/security/face/verify/${userId}`,
        { liveDescriptor }
      );

      if (data.verified) {
        setPhase('success');
        setMessage(data.message || '✔ Face Verified — Access Granted');
        setTimeout(() => onSuccess(), 1500);
      } else {
        setPhase('error');
        setMessage(data.message || '❌ Unauthorized Face Detected');
        setTimeout(() => onFailure(data.message), 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Verification failed.';
      if (err.response?.status === 401) {
        setPhase('error');
        setMessage('❌ Unauthorized Face Detected — Access Denied');
        setTimeout(() => onFailure(msg), 2000);
      } else {
        setPhase('error');
        setMessage(msg);
      }
    }
  }, [userId, onSuccess, onFailure]);

  // ── Retry ───────────────────────────────────────────────────────────────────
  const handleRetry = () => {
    setPhase('ready');
    setMessage('Position your face in the frame, then click Scan.');
    setScanProgress(0);
  };

  // ── Phase colours ───────────────────────────────────────────────────────────
  const borderColor = {
    loading:  'border-slate-600',
    ready:    'border-emerald-500/50',
    scanning: 'border-blue-500/70',
    success:  'border-emerald-400',
    error:    'border-red-500/70',
  }[phase];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0d1117] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <ScanFace className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Biometric Verification</h2>
              <p className="text-slate-500 text-xs">Step 2 of 2 — Face Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors text-lg font-bold"
            title="Cancel"
          >
            ✕
          </button>
        </div>

        {/* Webcam area */}
        <div className="relative mx-auto mt-6 w-64 h-64">
          {/* Corner brackets */}
          {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2',
            'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'
          ].map((cls, i) => (
            <div key={i} className={`absolute w-6 h-6 ${cls} ${phase === 'success' ? 'border-emerald-400' : phase === 'error' ? 'border-red-400' : 'border-emerald-500'} z-10 rounded-sm`} />
          ))}

          {/* Webcam / state overlay */}
          <div className={`w-full h-full rounded-xl overflow-hidden border-2 ${borderColor} transition-colors duration-500`}>
            {phase === 'loading' ? (
              <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                <p className="text-slate-400 text-xs text-center px-4">Loading AI models…</p>
              </div>
            ) : phase === 'success' ? (
              <div className="w-full h-full bg-emerald-900/30 flex flex-col items-center justify-center gap-3">
                <ShieldCheck className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.8)]" />
                <p className="text-emerald-300 font-bold text-sm">Access Granted</p>
              </div>
            ) : phase === 'error' ? (
              <div className="w-full h-full bg-red-900/20 flex flex-col items-center justify-center gap-3 px-4">
                <ShieldX className="w-14 h-14 text-red-400" />
                <p className="text-red-300 text-xs text-center">{message}</p>
              </div>
            ) : (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  width={256}
                  height={256}
                  videoConstraints={{ width: 256, height: 256, facingMode: 'user' }}
                  className="w-full h-full object-cover"
                />
                {/* Scan line animation */}
                {phase === 'scanning' && (
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-90 z-20 transition-none"
                    style={{ top: `${scanProgress}%` }}
                  />
                )}
              </>
            )}
          </div>

          {/* Face outline ring */}
          <div className={`absolute inset-4 rounded-full border ${phase === 'success' ? 'border-emerald-400/60' : phase === 'error' ? 'border-red-400/40' : 'border-emerald-500/30'} pointer-events-none transition-colors duration-500`} />
        </div>

        {/* Status message */}
        <div className="mt-4 px-6">
          <div className={`text-center text-sm py-2 px-4 rounded-xl ${
            phase === 'success' ? 'bg-emerald-500/10 text-emerald-300' :
            phase === 'error'   ? 'bg-red-500/10 text-red-300' :
            phase === 'scanning'? 'bg-blue-500/10 text-blue-300' :
            'bg-slate-800 text-slate-400'
          }`}>
            {phase === 'loading' && <Loader2 className="inline w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {phase === 'scanning' && <Camera className="inline w-3.5 h-3.5 mr-1.5" />}
            {phase === 'error' && phase !== 'ready' && <AlertTriangle className="inline w-3.5 h-3.5 mr-1.5" />}
            {message}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 py-5 flex gap-3">
          {phase === 'ready' && (
            <button
              onClick={handleScan}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)] hover:shadow-[0_0_30px_rgba(5,150,105,0.6)] transition-all flex items-center justify-center gap-2"
            >
              <ScanFace className="w-5 h-5" /> Scan Face
            </button>
          )}
          {phase === 'scanning' && (
            <button disabled className="flex-1 py-3 bg-blue-600/50 text-blue-200 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
              <Loader2 className="w-5 h-5 animate-spin" /> Verifying…
            </button>
          )}
          {phase === 'error' && (
            <>
              <button
                onClick={handleRetry}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-red-600/20 border border-red-500/40 hover:bg-red-600/30 text-red-400 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Security notice */}
        <p className="text-center text-slate-600 text-xs pb-4">
          🔒 Biometric data is processed locally — not stored as images.
        </p>
      </div>
    </div>
  );
};

export default FaceVerification;
