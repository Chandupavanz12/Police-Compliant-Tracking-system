const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { recordFailedLogin, clearFailedLogins, isIPBlocked, getIP } = require('../middleware/idsMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// Register Citizen
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'citizen'
    });

    await newUser.save();
    
    res.status(201).json({ message: 'Citizen registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin creates Police account
router.post('/register-police', protect, authorize('admin'), async (req, res) => {
  try {
    const { username, password, name, district, taluk, station } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Police username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      role: 'police',
      district,
      taluk,
      station
    });

    await newUser.save();
    res.status(201).json({ message: 'Police account created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin gets all Police accounts
router.get('/police', protect, authorize('admin'), async (req, res) => {
  try {
    const policeOfficers = await User.find({ role: 'police' }).select('-password');
    res.json(policeOfficers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin gets all Citizen accounts
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const citizens = await User.find({ role: 'citizen' }).select('-password');
    res.json(citizens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin resets Police password
router.put('/police/:id/reset-password', protect, authorize('admin'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Police account not found' });
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generic Login for all roles
router.post('/login', async (req, res) => {
  try {
    const { email, username, password, expectedRole } = req.body;
    const ip = getIP(req);

    // IDS: Block check
    if (isIPBlocked(ip)) {
      return res.status(429).json({ message: '⚠ Too many failed attempts. You are temporarily blocked. Try again in 15 minutes.' });
    }

    let user;
    if (expectedRole === 'citizen') {
      user = await User.findOne({ email, role: 'citizen' });
    } else {
      user = await User.findOne({ username, role: expectedRole });
    }

    if (!user) {
      // IDS: record failed login
      await recordFailedLogin({ ip, username: username || email || 'unknown', userId: null, role: expectedRole || 'unknown' });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // IDS: record failed login
      const { blocked } = await recordFailedLogin({ ip, username: user.username || user.email, userId: user._id, role: user.role });
      if (blocked) {
        return res.status(429).json({ message: '⚠ Too many failed attempts. Account temporarily blocked for 15 minutes.' });
      }
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // IDS: Clear failed login record on success
    clearFailedLogins(ip, user.username || user.email);

    // Create JWT — include station for police filtering
    const token = jwt.sign(
      { id: user._id, role: user.role, station: user.station, district: user.district, taluk: user.taluk },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        district: user.district,
        taluk: user.taluk,
        station: user.station,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
