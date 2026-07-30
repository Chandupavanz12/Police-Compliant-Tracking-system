const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const VerificationRequest = require('../models/VerificationRequest');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

// Generate a static key pair for the police department (For demo purposes)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Pre-check: verify criminal records BEFORE submitting application (no DB write)
router.post('/pre-check', async (req, res) => {
  try {
    const { fullName, fatherName } = req.body;
    if (!fullName || !fatherName) {
      return res.status(400).json({ success: false, message: 'Name and father name required.' });
    }
    const matchingCrimes = await Complaint.find({
      'criminalsInvolved': {
        $elemMatch: {
          name: { $regex: new RegExp(`^${fullName.trim()}$`, 'i') },
          fatherName: { $regex: new RegExp(`^${fatherName.trim()}$`, 'i') }
        }
      }
    }).select('_id station');

    if (matchingCrimes.length > 0) {
      return res.json({
        success: true,
        hasCriminalRecord: true,
        message: `Application rejected: A criminal record exists against the name "${fullName}" and father's name "${fatherName}" in police station records. You are not eligible for a verification certificate.`
      });
    }
    return res.json({ success: true, hasCriminalRecord: false });
  } catch (error) {
    console.error('[Pre-check Error]', error);
    res.status(500).json({ success: false, message: 'Server error during background check.' });
  }
});

// Apply for Verification
router.post('/apply', async (req, res) => {
  try {
    const { userId, fullName, fatherName, dob, gender, aadhaar, address, mobile, purpose, district, taluk, station } = req.body;
    
    console.log('[Verification Apply] userId received:', userId);

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required. Please log out and log back in.' });
    }

    // Auto Criminal Record Check
    let matchingCrimes = [];
    try {
      matchingCrimes = await Complaint.find({
        'criminalsInvolved': {
          $elemMatch: {
            name: { $regex: new RegExp(`^${fullName}$`, 'i') },
            fatherName: { $regex: new RegExp(`^${fatherName}$`, 'i') }
          }
        }
      });
    } catch (dbErr) {
      console.error('[Verification] DB check failed, proceeding without criminal record check:', dbErr.message);
    }

    const applicationNumber = 'KRP/APP/' + new Date().getFullYear() + '/' + Math.floor(10000 + Math.random() * 90000);

    let status = 'Pending';
    let statusMessage = '';
    let hasCriminalRecord = false;

    if (matchingCrimes.length > 0) {
      hasCriminalRecord = true;
      statusMessage = 'System flagged potential criminal record matches. Pending officer review.';
    }

    // Non-blocking notification — don't crash if it fails
    Notification.create({
      userId,
      message: `Your verification application ${applicationNumber} has been submitted for review.`,
      type: 'StatusUpdate'
    }).catch(err => console.error('[Notification] Failed to create notification:', err.message));

    const newRequest = new VerificationRequest({
      userId,
      applicationNumber,
      fullName,
      fatherName,
      dob,
      gender,
      aadhaar,
      address,
      mobile,
      purpose,
      district,
      taluk,
      station,
      status,
      statusMessage,
      hasCriminalRecord
    });

    await newRequest.save();
    res.status(201).json({ success: true, request: newRequest });
  } catch (error) {
    console.error('[Verification Apply Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Get requests by user
router.get('/user/:userId', async (req, res) => {
  try {
    const requests = await VerificationRequest.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get requests by station (for police)
router.get('/station', async (req, res) => {
  try {
    const { district, taluk, station } = req.query;
    const filter = {};
    if (district) filter.district = district;
    if (taluk) filter.taluk = taluk;
    if (station) filter.station = station;
    
    const requests = await VerificationRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve and Generate Certificate
router.post('/approve/:id', async (req, res) => {
  try {
    const request = await VerificationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    
    if (request.status !== 'Pending') {
       return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    request.status = 'Approved';
    request.dateOfVerification = new Date();
    
    const certNumber = 'KRP/VER/' + new Date().getFullYear() + '/' + Math.floor(10000 + Math.random() * 90000);
    
    // Data to sign
    const dataToSign = JSON.stringify({
      certNumber,
      fullName: request.fullName,
      fatherName: request.fatherName,
      aadhaar: request.aadhaar,
      status: 'CLEAR',
      dateOfVerification: request.dateOfVerification
    });

    // Create digital signature
    const sign = crypto.createSign('SHA256');
    sign.update(dataToSign);
    sign.end();
    const signature = sign.sign(privateKey, 'base64');
    
    request.certificateData = {
      certNumber,
      signature,
      publicKey,
      qrCodeData: JSON.stringify({ certNumber, signature: signature.substring(0, 20) + '...' })
    };

    await request.save();
    
    await Notification.create({
      userId: request.userId,
      message: `Your verification certificate ${certNumber} is approved and ready for download.`,
      type: 'StatusUpdate'
    });

    res.json({ success: true, request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject Verification
router.post('/reject/:id', async (req, res) => {
  try {
    const request = await VerificationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    
    if (request.status !== 'Pending') {
       return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    request.status = 'Rejected';
    request.statusMessage = 'Application rejected due to existing criminal records matching the applicant details.';
    
    await request.save();
    
    await Notification.create({
      userId: request.userId,
      message: `Your verification application ${request.applicationNumber} has been rejected by the police station.`,
      type: 'SystemAlert'
    });

    res.json({ success: true, request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
