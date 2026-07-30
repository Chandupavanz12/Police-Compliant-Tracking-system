const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const MissingPerson = require('../models/MissingPerson');
const { protect, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, 'missing-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// POST /api/missing — Citizen reports a missing person
router.post('/', protect, authorize('citizen'), upload.single('photo'), async (req, res) => {
  try {
    const { name, age, gender, lastSeenLocation, lastSeenDate, description, contactNumber, district, taluk, station } = req.body;
    const reportId = `MP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const report = await MissingPerson.create({
      reportedBy: req.user.id,
      reportId,
      name, age, gender,
      lastSeenLocation, lastSeenDate, description, contactNumber,
      district, taluk, station,
      photoUrl: req.file ? req.file.path : null,
    });

    res.status(201).json({ message: 'Missing person report filed successfully', report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/missing — Police/Admin: all reports (all stations can see all)
router.get('/', protect, authorize('police', 'admin'), async (req, res) => {
  try {
    const reports = await MissingPerson.find().populate('reportedBy', 'name email').sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/missing/user — Citizen: own reports
router.get('/user', protect, authorize('citizen'), async (req, res) => {
  try {
    const reports = await MissingPerson.find({ reportedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/missing/:id/status — Police updates missing person status
router.put('/:id/status', protect, authorize('police', 'admin'), async (req, res) => {
  try {
    const { status, foundDetails, foundBy } = req.body;
    const updated = await MissingPerson.findByIdAndUpdate(
      req.params.id,
      { status, foundDetails, foundBy },
      { returnDocument: 'after' }
    ).populate('reportedBy', 'name email');

    if (!updated) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Status updated', report: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
