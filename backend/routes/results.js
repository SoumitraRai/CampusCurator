const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Results route' });
});
router.post('/', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, message: 'Results declaration endpoint' });
});
module.exports = router;
