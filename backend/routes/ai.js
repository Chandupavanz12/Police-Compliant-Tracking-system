const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Knowledge base for chatbot
const knowledgeBase = [
  { keywords: ['hello', 'hi', 'hey'], reply: "Hello! I'm your Smart Police AI Assistant. I can help with filing complaints, tracking status, escalation procedures, and legal guidance. What do you need help with?" },
  { keywords: ['file', 'submit', 'new complaint', 'register'], reply: "To file a complaint:\n1. Click 'New Complaint' in the sidebar\n2. Enter incident title and description\n3. Select District → Taluk → Police Station\n4. Upload evidence photos\n5. Submit — AI will auto-categorize it\n\nYour complaint is immediately forwarded to the assigned station and admin." },
  { keywords: ['track', 'status', 'progress', 'update', 'follow'], reply: "To track your complaint, go to 'My Complaints' or 'Track Complaint'. Each complaint shows a visual progress bar:\n• Filed → In Progress → Under Review → Resolved\n\nCourt updates added by the police officer also appear here." },
  { keywords: ['escalate', 'escalation', 'not taken', 'ignore', 'no response', 'delay'], reply: "If your complaint is not acted upon for more than 3 days, an 'Escalate' button activates on the Track Complaint page.\n\nClicking it alerts the Admin, who can issue an official warning to the police station. The station receives a critical alert on their dashboard." },
  { keywords: ['evidence', 'photo', 'upload', 'image', 'video', 'proof'], reply: "You can attach photos/videos when filing a complaint. Use the 'Image Analysis' tool for AI forensic analysis.\n\nTips:\n• CCTV footage resolves cases 3x faster\n• Screenshot digital crimes immediately\n• Photograph physical damage before it changes\n\nSupported: JPG, PNG, MP4, WEBP (max 10MB)" },
  { keywords: ['court', 'hearing', 'judicial', 'legal', 'lawyer'], reply: "Court updates are added by the police officer handling your case. View them in:\n• 'Court Updates' section\n• 'Hearing Calendar' for a timeline\n• 'Track Complaint' under each case\n\nFor legal advice, consult the District Legal Aid cell or a registered lawyer." },
  { keywords: ['theft', 'stolen', 'robbery'], reply: "For theft complaints:\n• File immediately — time is critical\n• List all stolen items with estimated values\n• Attach any receipts or photos of valuables\n• Note exact time, location, and any witnesses\n• Check nearby CCTV cameras before they're overwritten" },
  { keywords: ['fraud', 'scam', 'cheated', 'money', 'bank'], reply: "For fraud cases:\n• Do NOT transfer any more money\n• Screenshot all communication with the fraudster\n• Note transaction IDs and timestamps\n• Contact your bank immediately to freeze transactions\n• File under 'Fraud' category with all digital evidence" },
  { keywords: ['cyber', 'online', 'hacking', 'phishing', 'harassment'], reply: "For cyber crime:\n• Preserve all digital evidence immediately\n• Screenshot threatening messages, fake profiles, suspicious emails\n• Do NOT delete any communication\n• File under 'Cyber Crime' — our AI will guide further steps\n• For emergencies: Cyber Crime Helpline 1930" },
  { keywords: ['assault', 'attack', 'violence', 'hurt', 'injury'], reply: "For assault cases:\n• Seek medical attention first\n• Document injuries with photos at the hospital\n• Get a medical certificate from the doctor\n• Identify any witnesses present\n• File immediately — include time, location, and suspect description" },
  { keywords: ['warn', 'warning', 'police action'], reply: "When a complaint is escalated by a citizen, the Admin can issue an official warning to the police station. The officer sees a critical red alert banner on their dashboard requiring immediate action." },
  { keywords: ['category', 'type'], reply: "Available complaint categories:\n• Theft — stolen property, vehicles\n• Assault — physical attack, harassment\n• Cyber Crime — online fraud, hacking\n• Fraud — financial scams, forgery\n• Vandalism — property damage\n• Other — anything not listed above\n\nAI also auto-suggests the category from your evidence photo." },
  { keywords: ['thank', 'thanks', 'ok', 'great', 'done'], reply: "You're welcome! Stay safe. Don't hesitate to return if you need more help. Remember: Filing a complaint is your right — we are here to help you." },
  { keywords: ['password', 'account', 'login'], reply: "Citizens can register at the login page. For police accounts, contact your district administrator. Admin credentials are pre-configured. Never share your password with anyone." },
  { keywords: ['emergency', 'urgent', 'help', 'danger'], reply: "🚨 EMERGENCY? Call 112 immediately!\n\nFor urgent situations:\n• Police: 100\n• Ambulance: 108\n• Women Helpline: 1091\n• Cyber Crime: 1930\n\nAfter ensuring safety, file a formal complaint here for official tracking." },
];

// GET /api/ai/insights
router.get('/insights', protect, async (req, res) => {
  try {
    const insights = [
      { id: 1, type: 'priority', title: 'High Priority Case', desc: 'CMP-2026-089 requires additional evidence upload.', icon: 'ShieldAlert', color: 'text-red-400 bg-red-400/10' },
      { id: 2, type: 'reminder', title: 'Upcoming Hearing', desc: 'Hearing scheduled for CMP-2026-088 on Apr 30.', icon: 'Calendar', color: 'text-amber-400 bg-amber-400/10' },
      { id: 3, type: 'suggestion', title: 'Evidence Suggestion', desc: 'Adding location coordinates could speed up CMP-2026-089.', icon: 'Lightbulb', color: 'text-blue-400 bg-blue-400/10' },
    ];
    res.json(insights);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ai/tips
router.get('/tips', protect, async (req, res) => {
  try {
    res.json({
      title: "Cyber Security Alert",
      content: "Never share your banking OTPs with anyone claiming to be police. Official channels will never ask for financial credentials."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/ai/chat — Smart rule-based AI assistant
router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const lower = message.toLowerCase();

    const match = knowledgeBase.find(kb => kb.keywords.some(k => lower.includes(k)));
    
    const reply = match 
      ? match.reply 
      : "I don't have a specific answer for that. For detailed assistance, please contact your local police station or call 112. I can help with: filing complaints, tracking status, evidence tips, escalation, and court updates.";

    // Slight delay to simulate processing
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
