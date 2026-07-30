const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  username:     { type: String, default: 'Unknown' },
  role:         { type: String, enum: ['citizen', 'police', 'admin', 'unknown'], default: 'unknown' },
  activityType: {
    type: String,
    enum: [
      'FAILED_LOGIN',
      'FACE_MISMATCH',
      'FACE_VERIFIED',
      'UNAUTHORIZED_ACCESS',
      'BRUTE_FORCE_DETECTED',
      'USER_BLOCKED',
      'SUCCESSFUL_LOGIN',
      'SUSPICIOUS_REQUEST'
    ],
    required: true
  },
  ipAddress:    { type: String, default: 'N/A' },
  threatLevel:  { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  status:       { type: String, enum: ['ACTIVE', 'RESOLVED', 'BLOCKED'], default: 'ACTIVE' },
  details:      { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
