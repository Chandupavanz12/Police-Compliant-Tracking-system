const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');
const { protect, authorize } = require('../middleware/auth');
const { verifyFace, isValidDescriptor } = require('../utils/faceRecognition');
const { logFaceEvent, getIP } = require('../middleware/idsMiddleware');

// ─── FACE REGISTRATION ────────────────────────────────────────────────────────
// Admin uploads face descriptor for a police officer
router.post('/face/register/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const { faceDescriptor } = req.body;

    if (!faceDescriptor || !isValidDescriptor(faceDescriptor)) {
      return res.status(400).json({ message: 'Invalid or missing face descriptor (must be 128-element array).' });
    }

    const user = await User.findById(req.params.userId);
    if (!user || user.role !== 'police') {
      return res.status(404).json({ message: 'Police officer not found.' });
    }

    user.faceDescriptor = faceDescriptor;
    await user.save();

    res.json({ message: 'Face registered successfully for officer.' });
  } catch (err) {
    console.error('[Security] Face register error:', err);
    res.status(500).json({ message: 'Server error during face registration.' });
  }
});

// ─── FACE VERIFICATION ────────────────────────────────────────────────────────
// Called by PoliceLogin after username/password check passes
router.post('/face/verify/:userId', async (req, res) => {
  try {
    const { liveDescriptor } = req.body;
    const ip = getIP(req);

    const user = await User.findById(req.params.userId);
    if (!user || user.role !== 'police') {
      return res.status(404).json({ message: 'Officer not found.' });
    }

    // If no face registered yet, allow login but warn
    if (!user.faceDescriptor || user.faceDescriptor.length === 0) {
      return res.json({
        verified: true,
        message: 'No face registered — skipping biometric check.',
        noFaceRegistered: true,
      });
    }

    if (!liveDescriptor || !isValidDescriptor(liveDescriptor)) {
      return res.status(400).json({ message: 'Invalid live face descriptor.' });
    }

    const { verifyFace: vf } = require('../utils/faceRecognition');
    const result = vf(user.faceDescriptor, liveDescriptor);

    await logFaceEvent({
      userId: user._id,
      username: user.username,
      role: user.role,
      verified: result.match,
      ipAddress: ip,
    });

    if (result.match) {
      return res.json({
        verified: true,
        distance: result.distance,
        message: '✔ Face Verified — Access Granted',
      });
    } else {
      return res.status(401).json({
        verified: false,
        distance: result.distance,
        message: '❌ Unauthorized Face Detected — Access Denied',
      });
    }
  } catch (err) {
    console.error('[Security] Face verify error:', err);
    res.status(500).json({ message: 'Server error during face verification.' });
  }
});

// ─── SECURITY STATS (Admin) ───────────────────────────────────────────────────
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      failedLogins,
      faceMismatches,
      blockedUsers,
      intrusionAlerts,
      totalLogs,
    ] = await Promise.all([
      SecurityLog.countDocuments({ activityType: 'FAILED_LOGIN' }),
      SecurityLog.countDocuments({ activityType: 'FACE_MISMATCH' }),
      SecurityLog.countDocuments({ activityType: 'USER_BLOCKED' }),
      SecurityLog.countDocuments({ activityType: { $in: ['FACE_MISMATCH', 'BRUTE_FORCE_DETECTED', 'UNAUTHORIZED_ACCESS'] } }),
      SecurityLog.countDocuments(),
    ]);

    res.json({ failedLogins, faceMismatches, blockedUsers, intrusionAlerts, totalLogs });
  } catch (err) {
    console.error('[Security] Stats error:', err);
    res.status(500).json({ message: 'Error fetching security stats.' });
  }
});

// ─── SECURITY LOGS TABLE (Admin) ─────────────────────────────────────────────
router.get('/logs', protect, authorize('admin'), async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.threatLevel) filter.threatLevel = req.query.threatLevel;
    if (req.query.activityType) filter.activityType = req.query.activityType;

    const [logs, total] = await Promise.all([
      SecurityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SecurityLog.countDocuments(filter),
    ]);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[Security] Logs error:', err);
    res.status(500).json({ message: 'Error fetching security logs.' });
  }
});

// ─── MARK LOG AS RESOLVED (Admin) ────────────────────────────────────────────
router.put('/logs/:id/resolve', protect, authorize('admin'), async (req, res) => {
  try {
    await SecurityLog.findByIdAndUpdate(req.params.id, { status: 'RESOLVED' });
    res.json({ message: 'Log marked as resolved.' });
  } catch (err) {
    res.status(500).json({ message: 'Error resolving log.' });
  }
});

// ─── CHECK IF POLICE HAS FACE REGISTERED ─────────────────────────────────────
router.get('/face/status/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('faceDescriptor role');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ hasFace: !!(user.faceDescriptor && user.faceDescriptor.length > 0) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
