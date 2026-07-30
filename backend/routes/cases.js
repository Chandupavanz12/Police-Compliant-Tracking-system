const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');
const { protect, authorize } = require('../middleware/auth');

// POST /api/cases -> Police creates a case
router.post('/', protect, authorize('police', 'admin'), async (req, res) => {
  try {
    const { complaintId, courtStatus, nextHearing } = req.body;
    
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const newCase = new Case({
      complaintId,
      courtStatus,
      nextHearing
    });

    await newCase.save();

    // Notify citizen
    await Notification.create({
      userId: complaint.citizenId,
      message: `A legal case has been opened for your complaint ${complaint.complaintId}.`,
      type: 'SystemAlert'
    });

    res.status(201).json(newCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/cases/:id -> Get case details
router.get('/:id', protect, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id).populate('complaintId');
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    
    // If citizen, ensure they own the underlying complaint
    if (req.user.role === 'citizen') {
      if (caseData.complaintId.citizenId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this case' });
      }
    }

    res.json(caseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/cases/:id -> Update hearing and decision
router.put('/:id', protect, authorize('police', 'admin'), async (req, res) => {
  try {
    const { courtStatus, nextHearing, decision } = req.body;
    
    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { courtStatus, nextHearing, decision },
      { returnDocument: 'after' }
    ).populate('complaintId');

    if (!updatedCase) return res.status(404).json({ message: 'Case not found' });

    // Notify citizen
    if (nextHearing || decision) {
      await Notification.create({
        userId: updatedCase.complaintId.citizenId,
        message: `There is an update on your case related to ${updatedCase.complaintId.complaintId}.`,
        type: nextHearing ? 'HearingUpdate' : 'StatusUpdate'
      });
    }

    res.json(updatedCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
