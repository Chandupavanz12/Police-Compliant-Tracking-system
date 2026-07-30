import React, { useState, useContext } from 'react';
import { User, Lock, ArrowLeft, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InputField from '../components/InputField';
import { AuthContext } from '../context/AuthContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
        expectedRole: 'admin'
      });
      
      login(response.data.user, response.data.token);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Portals
        </Link>
        
        <div className="glass-effect p-8 rounded-2xl border border-purple-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Shield className="w-32 h-32 text-purple-500" />
          </div>

          <div className="text-center mb-8 relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2">Admin Portal</h2>
            <p className="text-slate-400">System administration login.</p>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center relative z-10">{error}</div>}

          <form onSubmit={handleSubmit} className="relative z-10">
            <InputField 
              label="Admin ID" 
              icon={User} 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter your ID" 
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
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 text-white font-semibold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all duration-300"
            >
              {loading ? 'Authenticating...' : 'Access System'}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-xs relative z-10">
            Only authorized system administrators may access this portal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
