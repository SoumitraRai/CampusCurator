const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Users route' });
});
module.exports = router;
