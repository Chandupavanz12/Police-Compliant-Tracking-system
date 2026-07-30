const mongoose = require('mongoose');

const missingPersonSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  lastSeenLocation: { type: String, required: true },
  lastSeenDate: { type: Date, required: true },
  description: { type: String, required: true },
  contactNumber: { type: String, required: true },
  photoUrl: { type: String },
  district: { type: String },
  taluk: { type: String },
  station: { type: String },
  status: {
    type: String,
    enum: ['Searching', 'Found', 'Closed'],
    default: 'Searching'
  },
  foundDetails: { type: String },
  foundBy: { type: String }, // station name that found the person
}, { timestamps: true });

module.exports = mongoose.model('MissingPerson', missingPersonSchema);
