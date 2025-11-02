const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Checkpoints route' });
});
router.post(
  '/',
  protect,
  authorize('student'),
  upload.array('files', 10),
  (req, res) => {
    res.json({ success: true, message: 'Checkpoint submission endpoint' });
  }
);
module.exports = router;
