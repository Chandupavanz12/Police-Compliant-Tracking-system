import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader, RefreshCw } from 'lucide-react';

const knowledgeBase = [
  { keywords: ['hello', 'hi', 'hey', 'help'], response: "Hello! I'm your Smart Police Assistant. I can help you understand complaint filing, track your case status, or explain legal procedures. What would you like to know?" },
  { keywords: ['file', 'submit', 'new complaint', 'register complaint', 'how to file'], response: "To file a complaint:\n1. Click 'New Complaint' in the sidebar\n2. Enter the incident title and description\n3. Select District → Taluk → Police Station\n4. Upload any evidence photos\n5. Submit — the AI will auto-categorize it\n\nYour complaint will immediately be visible to the assigned police station and admin." },
  { keywords: ['track', 'status', 'progress', 'update'], response: "To track your complaint status, go to 'My Complaints' or 'Track Complaint' in the sidebar. Each complaint shows a visual progress bar with 4 stages:\n• Filed → In Progress → Under Review → Resolved\n\nYou'll also see any Court Status updates added by the police officer." },
  { keywords: ['escalate', 'escalation', 'not action', 'ignore', 'no response'], response: "If your complaint has not been acted upon for more than 3 days, an 'Escalate Issue' button will activate on the Track Complaint page.\n\nClicking it sends an automatic alert to the Admin, who can then issue an official warning to the police station. This ensures accountability at every level." },
  { keywords: ['evidence', 'photo', 'upload', 'image', 'file'], response: "Strong evidence significantly improves your case outcome. You can:\n• Attach photos or videos while filing the complaint\n• Use the 'Image Analysis' tool to get AI-powered forensic insights\n• Include screenshots of digital crimes (fraud, cyber threats)\n\nSupported formats: JPG, PNG, MP4, WEBP (max 10MB)" },
  { keywords: ['court', 'hearing', 'judicial', 'lawyer', 'legal'], response: "Court updates are added by the Police Officer handling your case. You can view them in:\n• The 'Court Updates' section in the sidebar\n• The 'Hearing Calendar' for a timeline view\n• The 'Track Complaint' page under each individual case\n\nFor legal advice, consult a registered lawyer or the District Legal Aid cell." },
  { keywords: ['category', 'type', 'what kind'], response: "The system supports these complaint categories:\n• Theft — stolen property, vehicles\n• Assault — physical attack, harassment\n• Cyber Crime — online fraud, hacking, cyberbullying\n• Fraud — financial scams, document forgery\n• Vandalism — property damage, graffiti\n• Other — anything not covered above\n\nOur AI also suggests the correct category based on your evidence photo." },
  { keywords: ['warn', 'warning', 'police warning', 'station warning'], response: "When a complaint is escalated by a citizen, the Admin can issue an official warning to the responsible police station. The police officer will see a critical alert banner on their dashboard requiring immediate action on the case." },
  { keywords: ['password', 'account', 'login', 'credential'], response: "For police account credentials, please contact the district Administrator. Citizens can register themselves at /citizen-register. Admin credentials are pre-configured and should be kept confidential." },
  { keywords: ['thank', 'thanks', 'ok', 'great', 'got it'], response: "You're welcome! Stay safe, and don't hesitate to ask if you need anything else. Justice is a process — stay informed and proactive!" },
];

const getResponse = (input) => {
  const lower = input.toLowerCase();
  const match = knowledgeBase.find(kb => kb.keywords.some(k => lower.includes(k)));
  if (match) return match.response;
  return "I don't have a specific answer for that right now. For detailed assistance, please contact your local police station or visit the citizen helpline at 112. I can help with complaint filing, tracking, evidence, escalation, or court updates.";
};

const ChatMessage = ({ msg }) => (
  <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-700'}`}>
      {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
    </div>
    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
      {msg.content}
    </div>
  </div>
);

const AiChatbotFull = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello! I'm your Smart Police AI Assistant 🤖\n\nI can help you with:\n• Filing complaints\n• Tracking case status\n• Evidence tips\n• Escalation procedures\n• Court updates\n\nHow can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const botReply = { role: 'bot', content: getResponse(input) };
      setMessages(prev => [...prev, botReply]);
      setLoading(false);
    }, 1000 + Math.random() * 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "How do I file a complaint?",
    "How to track my case?",
    "What is escalation?",
    "How to upload evidence?",
  ];

  return (
    <div className="glass-effect rounded-2xl border border-slate-800/50 flex flex-col" style={{ height: '80vh' }}>
      {/* Header */}
      <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
          <Bot className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Smart AI Assistant</h2>
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Online
          </p>
        </div>
        <button
          onClick={() => setMessages([{ role: 'bot', content: "Conversation reset. How can I help you today?" }])}
          className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
          title="Reset chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <Loader className="w-4 h-4 text-emerald-400 animate-spin" />
              <span className="text-slate-400 text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-6 pt-2 pb-0 flex flex-wrap gap-2">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => { setInput(p); }}
            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800/50 flex gap-3">
        <textarea
          rows="1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your complaint..."
          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl text-white transition-colors flex items-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AiChatbotFull;
