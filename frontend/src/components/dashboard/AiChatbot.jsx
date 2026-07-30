import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Brain } from 'lucide-react';
import axios from 'axios';

const localFallback = (msg) => {
  const lower = msg.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi')) return "Hello! How can I assist you today?";
  if (lower.includes('file') || lower.includes('complaint')) return "Click 'New Complaint' in the sidebar to file. You'll need to select District → Taluk → Station and can attach evidence photos.";
  if (lower.includes('track') || lower.includes('status')) return "Go to 'My Complaints' or 'Track Complaint' to see your case progress in real time.";
  if (lower.includes('escalat')) return "If police haven't acted in 3 days, the Escalate button activates on your Track Complaint page.";
  if (lower.includes('evidence') || lower.includes('photo')) return "You can upload photos or videos as evidence while filing. Our AI will forensically analyze them.";
  if (lower.includes('court') || lower.includes('hearing')) return "Court updates added by the police appear in 'Court Updates' and 'Hearing Calendar' sections.";
  if (lower.includes('thank')) return "You're welcome! Stay safe and don't hesitate to ask anything.";
  return "I can help with filing complaints, tracking status, evidence tips, escalation, and court updates. Ask me anything!";
};

const AiChatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am your AI Legal Assistant. How can I help you today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/ai/chat', { message: currentInput });
      setMessages(prev => [...prev, { id: Date.now() + 1, text: response.data.reply, sender: 'ai' }]);
    } catch (error) {
      // Use local fallback if backend fails
      const fallbackReply = localFallback(currentInput);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: fallbackReply, sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-effect rounded-2xl flex flex-col h-[400px] border border-slate-800/50 overflow-hidden">
      <div className="p-4 border-b border-slate-800/50 flex items-center gap-3 bg-slate-900/50">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Brain className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">AI Legal Assistant</h3>
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-slate-800/50 bg-slate-900/30 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default AiChatbot;
