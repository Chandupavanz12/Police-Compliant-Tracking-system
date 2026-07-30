const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationNumber: { type: String, required: true, unique: true },
  
  // Applicant Details
  fullName: { type: String, required: true },
  fatherName: { type: String, required: true },
  dob: { type: String, required: true }, // Format DD-MM-YYYY
  gender: { type: String, required: true },
  aadhaar: { type: String, required: true },
  address: { type: String, required: true },
  mobile: { type: String, required: true },
  purpose: { type: String, required: true },
  
  // Jurisdiction
  district: { type: String, required: true },
  taluk: { type: String, required: true },
  station: { type: String, required: true },

  // Status
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  statusMessage: { type: String, default: '' },
  hasCriminalRecord: { type: Boolean, default: false },
  
  // Dates
  dateOfApplication: { type: Date, default: Date.now },
  dateOfVerification: { type: Date },

  // Certificate Details (populated on approval)
  certificateData: {
    certNumber: String,
    signature: String, // Digital signature of the data
    publicKey: String, // Public key to verify the signature
    qrCodeData: String, // Data embedded in the QR
  }
}, { timestamps: true });

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
