import React, { useState, useContext } from 'react';
import { User, Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InputField from '../components/InputField';
import { AuthContext } from '../context/AuthContext';
import FaceVerification from '../components/FaceVerification';

const PoliceLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Face verification state
  const [showFaceVerify, setShowFaceVerify] = useState(false);
  const [pendingUser, setPendingUser]       = useState(null);
  const [pendingToken, setPendingToken]     = useState(null);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // ── Step 1: username + password ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
        expectedRole: 'police'
      });

      // Store pending credentials — wait for face verification
      setPendingUser(response.data.user);
      setPendingToken(response.data.token);
      setShowFaceVerify(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: face verified ──────────────────────────────────────────────────
  const handleFaceSuccess = () => {
    login(pendingUser, pendingToken);
    navigate('/PoliceDashbord');
  };

  // ── Step 2: face failed ────────────────────────────────────────────────────
  const handleFaceFailure = (msg) => {
    setShowFaceVerify(false);
    setPendingUser(null);
    setPendingToken(null);
    setError(msg || '❌ Unauthorized Face Detected — Access Denied');
  };

  // ── Face modal closed (cancelled) ─────────────────────────────────────────
  const handleFaceClose = () => {
    setShowFaceVerify(false);
    setPendingUser(null);
    setPendingToken(null);
    setError('Face verification cancelled.');
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Portals
        </Link>
        
        <div className="glass-effect p-8 rounded-2xl border border-emerald-500/20 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Police Portal</h2>
            <p className="text-slate-400">Secure access for authorized personnel only.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">1</div>
              <span className="text-xs text-emerald-400 font-medium">Credentials</span>
            </div>
            <div className="h-px flex-1 bg-slate-700" />
            <div className="flex items-center gap-2 flex-1 justify-end">
              <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${showFaceVerify ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}>2</div>
              <span className={`text-xs font-medium ${showFaceVerify ? 'text-emerald-400' : 'text-slate-500'}`}>Face Auth</span>
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

          <form onSubmit={handleSubmit}>
            <InputField 
              label="Badge / Username" 
              icon={User} 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter your username" 
            />
            
            <InputField 
              label="Password" 
              icon={Lock} 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password" 
            />

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white font-semibold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.3)] hover:shadow-[0_0_25px_rgba(5,150,105,0.5)] transition-all duration-300"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-xs">
            Notice: Access is restricted to authorized law enforcement officers. Unauthorized access will be prosecuted.
          </p>
        </div>
      </div>

      {/* ── Face Verification Modal (Step 2) ─────────────────────────────── */}
      {showFaceVerify && pendingUser && (
        <FaceVerification
          userId={pendingUser.id}
          onSuccess={handleFaceSuccess}
          onFailure={handleFaceFailure}
          onClose={handleFaceClose}
        />
      )}
    </div>
  );
};

export default PoliceLogin;
