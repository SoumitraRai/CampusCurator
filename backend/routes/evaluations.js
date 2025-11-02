const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Evaluations route' });
});
router.post('/', protect, authorize('mentor'), (req, res) => {
  res.json({ success: true, message: 'Evaluation submission endpoint' });
});
module.exports = router;
