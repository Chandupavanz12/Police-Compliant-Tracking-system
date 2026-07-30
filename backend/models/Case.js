const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  courtStatus: { type: String, enum: ['Hearing Scheduled', 'Awaiting Trial', 'Closed', 'Appealed'], default: 'Awaiting Trial' },
  nextHearing: { type: Date },
  decision: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);
