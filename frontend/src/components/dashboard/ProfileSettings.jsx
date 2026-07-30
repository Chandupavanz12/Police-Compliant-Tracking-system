import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Shield, Lock, Save, CheckCircle } from 'lucide-react';

const ProfileSettings = () => {
  const { user } = useContext(AuthContext);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    notifications: true,
    emailAlerts: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="glass-effect rounded-2xl p-8 border border-slate-800/50">
      <div className="mb-8 border-b border-slate-800/50 pb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center">
          <User className="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          <p className="text-slate-400">Manage your citizen profile and notification preferences.</p>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5" /> Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Personal Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
            <input
              type="tel"
              pattern="\d{10}"
              maxLength="10"
              minLength="10"
              title="Must be exactly 10 digits"
              placeholder="10 digit mobile number"
              value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '')})}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Residential Address</label>
            <textarea
              rows="3"
              placeholder="Your address..."
              value={form.address}
              onChange={e => setForm({...form, address: e.target.value})}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="space-y-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Account & Security</h3>
          
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Account Role</span>
            </div>
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm rounded-full font-medium capitalize">
              {user?.role || 'Citizen'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="Leave blank to keep current"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pt-2">Notification Preferences</h3>
          
          <div className="space-y-3">
            {[
              { key: 'notifications', label: 'In-app notifications', desc: 'Status updates and case alerts' },
              { key: 'emailAlerts', label: 'Email alerts', desc: 'Court updates and admin messages' },
            ].map(pref => (
              <label key={pref.key} className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div>
                  <p className="text-white font-medium text-sm">{pref.label}</p>
                  <p className="text-slate-500 text-xs">{pref.desc}</p>
                </div>
                <div
                  onClick={() => setForm(f => ({...f, [pref.key]: !f[pref.key]}))}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form[pref.key] ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form[pref.key] ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </div>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
