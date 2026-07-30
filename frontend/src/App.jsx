import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import CitizenLogin from './pages/CitizenLogin';
import CitizenRegister from './pages/CitizenRegister';
import PoliceLogin from './pages/PoliceLogin';
import AdminLogin from './pages/AdminLogin';
import CitizenDashboard from './pages/CitizenDashboard';
import PoliceDashboard from './pages/PoliceDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">Loading...</div>;
  
  if (!user) {
    return <Navigate to="/" />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Auth Routes */}
          <Route path="/citizen-login" element={<CitizenLogin />} />
          <Route path="/citizen-register" element={<CitizenRegister />} />
          <Route path="/police-login" element={<PoliceLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Protected Dashboards */}
          <Route 
            path="/citizen-dashboard" 
            element={
              <ProtectedRoute allowedRole="citizen">
                <CitizenDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/PoliceDashbord" 
            element={
              <ProtectedRoute allowedRole="police">
                <PoliceDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
