const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    // In a real app, you filter by req.user.id for citizen, or show all for admin/police
    const query = req.user.role === 'citizen' ? { citizenId: req.user.id } : {};
    
    const total = await Complaint.countDocuments(query);
    const inProgress = await Complaint.countDocuments({ ...query, status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ ...query, status: 'Resolved' });
    const underReview = await Complaint.countDocuments({ ...query, status: 'Under Review' });

    res.json({ total, inProgress, resolved, underReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// GET /api/dashboard/analytics
router.get('/analytics', protect, async (req, res) => {
  try {
    // Return mock analytics data representing trends over months
    // A real implementation would use MongoDB aggregation pipeline grouped by month
    const analyticsData = [
      { name: 'Jan', filed: 4, resolved: 2 },
      { name: 'Feb', filed: 3, resolved: 3 },
      { name: 'Mar', filed: 5, resolved: 4 },
      { name: 'Apr', filed: 2, resolved: 1 },
      { name: 'May', filed: 6, resolved: 4 },
      { name: 'Jun', filed: 3, resolved: 5 },
    ];
    
    res.json(analyticsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

module.exports = router;
