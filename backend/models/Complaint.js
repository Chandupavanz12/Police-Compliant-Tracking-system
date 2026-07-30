const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  // Optional for police-filed complaints (no citizen account)
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  complaintId: { type: String, required: true, unique: true }, 
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, 
  status: { 
    type: String, 
    enum: ['Filed', 'In Progress', 'Under Review', 'Arrested Suspect', 'Case Closed', 'Resolved'], 
    default: 'Filed' 
  },
  statusColor: { type: String, default: 'text-blue-400 bg-blue-400/10' },
  evidenceUrl: { type: String },
  dateFiled: { type: Date, default: Date.now },
  resolvedDate: { type: Date },
  resolvedProofBase64: { type: String, default: '' },
  
  // Jurisdiction & Location
  district: { type: String },
  taluk: { type: String },
  station: { type: String },
  incidentLocation: { type: String, default: '' },
  customCategory: { type: String, default: '' },
  
  // Verification
  isVerified: { type: Boolean, default: false },

  // Court details
  courtStatus: { type: String, default: 'Not applicable' },
  
  // Escalation & Citizen Verification
  isEscalated: { type: Boolean, default: false },
  escalationWarning: { type: String, default: '' },
  isCitizenSolved: { type: Boolean, default: false },

  // FIR & Revocation
  isFirFiled: { type: Boolean, default: false },
  firDetails: { type: String, default: '' },
  isRevoked: { type: Boolean, default: false },

  // Criminal Records (Police only)
  criminalsInvolved: [{
    name: String,
    fatherName: String,
    age: Number,
    address: String,
    activity: String,
    crimeDetails: String,
    photoBase64: String
  }],

  // Police-filed complaint metadata
  filedByPolice: { type: Boolean, default: false },
  officerName: { type: String, default: '' },
  hasCriminalRecord: { type: Boolean, default: false },

  // Final Judgement
  finalJudgement: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
