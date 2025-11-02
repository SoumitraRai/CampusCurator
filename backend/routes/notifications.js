const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Notifications route' });
});
router.put('/:id/read', protect, (req, res) => {
  res.json({ success: true, message: 'Mark notification as read endpoint' });
});
module.exports = router;
