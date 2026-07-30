import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopNavbar from '../components/dashboard/TopNavbar';
import StatsCards from '../components/dashboard/StatsCards';
import StatusChart from '../components/dashboard/StatusChart';
import RecentComplaints from '../components/dashboard/RecentComplaints';
import AiInsights from '../components/dashboard/AiInsights';
import QuickActions from '../components/dashboard/QuickActions';
import AiChatbot from '../components/dashboard/AiChatbot';
import SafetyTips from '../components/dashboard/SafetyTips';
import NewComplaint from '../components/dashboard/NewComplaint';
import TrackComplaint from '../components/dashboard/TrackComplaint';
import VoiceComplaint from '../components/dashboard/VoiceComplaint';
import CitizenNotifications from '../components/dashboard/CitizenNotifications';
import SmartSuggestions from '../components/dashboard/SmartSuggestions';
import ImageAnalysis from '../components/dashboard/ImageAnalysis';
import AiChatbotFull from '../components/dashboard/AiChatbotFull';
import CourtUpdates from '../components/dashboard/CourtUpdates';
import HearingCalendar from '../components/dashboard/HearingCalendar';
import ProfileSettings from '../components/dashboard/ProfileSettings';
import EvidenceUpload from '../components/dashboard/EvidenceUpload';
import MissingPersonForm from '../components/dashboard/MissingPersonForm';
import MissingPersonTrack from '../components/dashboard/MissingPersonTrack';
import ApplyVerification from '../components/dashboard/ApplyVerification';
import VerificationStatus from '../components/dashboard/VerificationStatus';

const CitizenDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <StatsCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <StatusChart />
              </div>
              <div className="space-y-6">
                <AiInsights />
                <SafetyTips />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <RecentComplaints />
              </div>
              <div className="space-y-6">
                <QuickActions setActiveTab={setActiveTab} />
                <AiChatbot />
              </div>
            </div>
          </>
        );

      // Complaint Actions
      case 'new_complaint':     return <NewComplaint setActiveTab={setActiveTab} />;
      case 'my_complaints':     return <TrackComplaint />;
      case 'track_complaint':   return <TrackComplaint />;
      case 'evidence_upload':   return <EvidenceUpload />;

      // Missing Persons
      case 'missing_report':    return <MissingPersonForm setActiveTab={setActiveTab} />;
      case 'missing_track':     return <MissingPersonTrack setActiveTab={setActiveTab} />;

      // Services
      case 'apply_verification': return <ApplyVerification setActiveTab={setActiveTab} />;
      case 'verification_status': return <VerificationStatus />;

      // AI Features
      case 'category_prediction': return <ImageAnalysis />;
      case 'voice_complaint':     return <VoiceComplaint setActiveTab={setActiveTab} />;
      case 'image_analysis':      return <ImageAnalysis />;
      case 'chatbot':             return <AiChatbotFull />;
      case 'smart_suggestions':   return <SmartSuggestions />;

      // Other
      case 'notifications':     return <CitizenNotifications />;
      case 'court_updates':     return <CourtUpdates />;
      case 'hearing_calendar':  return <HearingCalendar />;
      case 'settings':          return <ProfileSettings />;

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] glass-effect rounded-2xl border border-slate-800/50 p-8 text-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-full opacity-50 animate-ping"></div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-slate-400 max-w-md mx-auto">This module is being activated. Please check back shortly.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#020617] to-[#020617] -z-20 pointer-events-none"></div>
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopNavbar />
        
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CitizenDashboard;
