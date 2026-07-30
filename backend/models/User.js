const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: false }, // Only needed for citizens
  username: { type: String, required: false, unique: true, sparse: true }, // For police/admin
  email: { type: String, required: false, unique: true, sparse: true }, // For citizens
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['citizen', 'police', 'admin'] 
  },
  district: { type: String },
  taluk: { type: String },
  station: { type: String },
  faceDescriptor: { type: [Number], default: undefined } // 128-element face-api.js descriptor for police biometrics
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
