import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader, CheckCircle } from 'lucide-react';

const VoiceComplaint = ({ setActiveTab }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Simulate processing the audio text into a complaint structure
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setSuccess(true);
      }, 3000);
    } else {
      setIsListening(true);
      setTranscript('');
      // Simulate speech-to-text typing effect
      const dummySpeech = "I want to report an incident... Yesterday at 9 PM my phone was stolen near the main bus stand... It is a black smartphone...";
      let i = 0;
      const interval = setInterval(() => {
        setTranscript(dummySpeech.substring(0, i));
        i++;
        if (i > dummySpeech.length) clearInterval(interval);
      }, 50);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] glass-effect rounded-2xl border border-blue-500/50 p-8 text-center bg-blue-900/10">
        <CheckCircle className="w-20 h-20 text-blue-400 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">Voice Captured Successfully!</h2>
        <p className="text-blue-300">The AI has converted your speech into a structured formal complaint.</p>
        <p className="text-sm text-slate-400 mt-4 max-w-lg mb-6 italic">"{transcript}"</p>
        <button 
          onClick={() => setActiveTab('new_complaint')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          Review & Submit Formal Draft
        </button>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-2xl p-8 border border-slate-800/50">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-4">AI Voice Complaint Assistant</h2>
        <p className="text-slate-400">
          Speak naturally in your preferred language. Our advanced AI will transcribe your voice, extract the incident details, and automatically draft a formal police report for you to review.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-12">
        
        {/* Animated Microphone Button */}
        <div className="relative">
          {isListening && (
            <>
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-[-20px] border border-red-500 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.2s' }}></div>
            </>
          )}
          
          <button 
            onClick={toggleListening}
            className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isListening 
                ? 'bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.6)] scale-110' 
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-[0_0_30px_rgba(0,0,0,0.5)]'
            }`}
          >
            {isListening ? (
              <Mic className="w-12 h-12 text-white" />
            ) : (
              <MicOff className="w-12 h-12 text-slate-400" />
            )}
          </button>
        </div>

        <div className="text-center">
          <h3 className={`text-xl font-bold mb-2 ${isListening ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {isListening ? 'Listening...' : 'Tap to start speaking'}
          </h3>
          <p className="text-slate-500 text-sm">
            Supported languages: English, Kannada, Hindi.
          </p>
        </div>

        {/* Live Transcription Box */}
        {(transcript || isProcessing) && (
          <div className="w-full max-w-3xl bg-slate-900/80 border border-slate-700 rounded-2xl p-6 min-h-[150px] shadow-inner relative overflow-hidden">
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-10">
                <Loader className="w-8 h-8 text-blue-400 animate-spin mb-3" />
                <span className="text-blue-300 font-medium">NLP AI is formatting legal document...</span>
              </div>
            ) : null}
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Live Transcription</h4>
            <p className="text-lg text-slate-200 leading-relaxed font-mono">
              {transcript}
              {isListening && <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse"></span>}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default VoiceComplaint;
