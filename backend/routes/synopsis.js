const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Synopsis route' });
});
router.post(
  '/',
  protect,
  authorize('student'),
  upload.array('documents', 5),
  (req, res) => {
    res.json({ success: true, message: 'Synopsis submission endpoint' });
  }
);
module.exports = router;
