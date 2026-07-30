const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Multer storage setup for evidence upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Requires an "uploads" folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const User = require('../models/User'); // Need User for police filter

// POST /api/complaints -> Citizen OR Police submits a complaint
router.post('/', protect, authorize('citizen', 'police'), upload.single('evidence'), async (req, res) => {
  try {
    const {
      title, description, category, customCategory,
      district, taluk, station, incidentLocation,
      filedByPolice, officerName,
      firDetails, criminalsInvolved, hasCriminalRecord,
      status
    } = req.body;

    // Auto-generate complaint ID
    const complaintId = `CMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const isPolice = req.user.role === 'police';

    const newComplaint = new Complaint({
      // citizenId only set for citizen-filed complaints
      ...(req.user.role === 'citizen' && { citizenId: req.user.id }),
      complaintId,
      title,
      description,
      category,
      customCategory,
      district:  district  || (isPolice ? req.user.district  : undefined),
      taluk:     taluk     || (isPolice ? req.user.taluk     : undefined),
      station:   station   || (isPolice ? req.user.station   : undefined),
      incidentLocation,
      evidenceUrl: req.file ? req.file.path : null,
      statusColor: 'text-amber-400 bg-amber-400/10',
      status: status || (isPolice ? 'In Progress' : 'Filed'),
      // Police-specific fields
      ...(isPolice && {
        filedByPolice: true,
        officerName: officerName || req.user.name || req.user.username,
        ...(firDetails && { firDetails, isFirFiled: true }),
        ...(hasCriminalRecord && { hasCriminalRecord: true }),
        ...(criminalsInvolved && {
          criminalsInvolved: (typeof criminalsInvolved === 'string'
            ? JSON.parse(criminalsInvolved)
            : criminalsInvolved
          ).map(c => ({ ...c, age: Number(c.age) || 0 }))
        }),
      }),
    });

    await newComplaint.save();

    res.status(201).json({ message: 'Complaint submitted successfully', complaint: newComplaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/complaints/user -> Citizen views their own complaints
router.get('/user', protect, authorize('citizen'), async (req, res) => {
  try {
    // Exclude criminalsInvolved from citizen view for security
    const complaints = await Complaint.find({ citizenId: req.user.id }).select('-criminalsInvolved').sort({ dateFiled: -1 });
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching complaints' });
  }
});

// GET /api/complaints -> Police/Admin view all complaints
router.get('/', protect, authorize('police', 'admin'), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'police') {
      const policeUser = await User.findById(req.user.id);
      if (policeUser.station) {
        query.station = policeUser.station; // Filter by assigned station
      }
    }
    const complaints = await Complaint.find(query).populate('citizenId', 'name email').sort({ dateFiled: -1 });
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/complaints/:id -> Police updates status
router.put('/:id', protect, authorize('police', 'admin'), async (req, res) => {
  try {
    const { status, resolvedProofBase64 } = req.body;
    
    const statusColors = {
      'Filed': 'text-blue-400 bg-blue-400/10',
      'In Progress': 'text-amber-400 bg-amber-400/10',
      'Under Review': 'text-purple-400 bg-purple-400/10',
      'Arrested Suspect': 'text-rose-400 bg-rose-400/10',
      'Case Closed': 'text-slate-400 bg-slate-400/10',
      'Resolved': 'text-emerald-400 bg-emerald-400/10'
    };

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        statusColor: statusColors[status] || statusColors['Filed'],
        ...(status === 'Resolved' && { 
          resolvedDate: Date.now(), 
          resolvedProofBase64,
          isEscalated: false,
          escalationWarning: ''
        })
      },
      { returnDocument: 'after' }
    );

    if (!updated) return res.status(404).json({ message: 'Complaint not found' });

    // Trigger Notification for the citizen
    await Notification.create({
      userId: updated.citizenId,
      message: `Your complaint ${updated.complaintId} status has been updated to ${status}.`,
      type: 'StatusUpdate'
    });

    res.json({ message: 'Status updated', complaint: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/complaints/:id/court -> Police updates court status
router.put('/:id/court', protect, authorize('police', 'admin'), async (req, res) => {
  try {
    const { courtStatus } = req.body;
    const updated = await Complaint.findByIdAndUpdate(req.params.id, { courtStatus }, { returnDocument: 'after' });
    
    await Notification.create({
      userId: updated.citizenId,
      message: `Court status for ${updated.complaintId} updated to: ${courtStatus}`,
      type: 'HearingUpdate'
    });
    
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/complaints/:id/criminals -> Police updates criminals involved
router.put('/:id/criminals', protect, authorize('police', 'admin'), async (req, res) => {
  try {
    const { criminals } = req.body;
    const updated = await Complaint.findByIdAndUpdate(req.params.id, { criminalsInvolved: criminals }, { returnDocument: 'after' });
    res.json({ message: 'Criminal records updated successfully', complaint: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/complaints/:id/judgement -> Police updates final judgement
router.put('/:id/judgement', protect, authorize('police', 'admin'), async (req, res) => {
  try {
    const { finalJudgement } = req.body;
    const updated = await Complaint.findByIdAndUpdate(req.params.id, { finalJudgement }, { returnDocument: 'after' });
    
    await Notification.create({
      userId: updated.citizenId,
      message: `Final judgement for ${updated.complaintId} has been announced.`,
      type: 'SystemAlert'
    });

    res.json({ message: 'Final judgement updated successfully', complaint: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/complaints/:id/verify -> Police verifies complaint
router.put('/:id/verify', protect, authorize('police', 'admin'), async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(req.params.id, { isVerified: true }, { returnDocument: 'after' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/complaints/:id/escalate -> Citizen escalates
router.put('/:id/escalate', protect, authorize('citizen'), async (req, res) => {
  try {
    const updated = await Complaint.findOneAndUpdate(
      { _id: req.params.id, citizenId: req.user.id },
      { isEscalated: true, escalationWarning: 'Escalated — Pending Admin Review' },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ message: 'Complaint not found' });
    
    // Notify Admin (create a system notification)
    await Notification.create({
      userId: req.user.id, // stored so admin can query escalated ones
      message: `ESCALATION: Citizen escalated complaint ${updated.complaintId} (${updated.category}) at ${updated.station}. Immediate admin review required.`,
      type: 'Escalation'
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/complaints/:id/mark-solved -> Citizen confirms resolution
router.put('/:id/mark-solved', protect, authorize('citizen'), async (req, res) => {
  try {
    const updated = await Complaint.findOneAndUpdate(
      { _id: req.params.id, citizenId: req.user.id },
      { isCitizenSolved: true },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ message: 'Complaint not found' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/complaints/:id/warn -> Admin warns police station
router.put('/:id/warn', protect, authorize('admin'), async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { escalationWarning: 'Warning Issued to Station by Admin' },
      { returnDocument: 'after' }
    );
    
    await Notification.create({
      userId: updated.citizenId,
      message: `Admin has officially warned the police station regarding ${updated.complaintId}.`,
      type: 'SystemAlert'
    });
    
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/complaints/:id/fir -> Police files an FIR
router.put('/:id/fir', protect, authorize('police'), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    if (complaint.isRevoked) {
      return res.status(400).json({ message: 'Cannot file FIR on a revoked complaint' });
    }

    const firNumber = `FIR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    complaint.isFirFiled = true;
    complaint.firDetails = firNumber;
    complaint.status = 'In Progress';
    complaint.statusColor = 'text-amber-400 bg-amber-400/10';
    await complaint.save();

    res.json({ message: 'FIR filed successfully', complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/complaints/:id/revoke -> Citizen revokes their complaint
router.put('/:id/revoke', protect, authorize('citizen'), async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, citizenId: req.user.id });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    if (complaint.isFirFiled) {
      return res.status(400).json({ message: 'Cannot revoke a complaint after an FIR has been filed' });
    }

    complaint.isRevoked = true;
    complaint.status = 'Case Closed';
    complaint.statusColor = 'text-slate-400 bg-slate-400/10';
    await complaint.save();

    res.json({ message: 'Complaint revoked successfully', complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/complaints/:id -> Delete a complaint (Admin/Police/Citizen)
router.delete('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    // Authorization check
    if (req.user.role === 'citizen' && complaint.citizenId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this complaint' });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
