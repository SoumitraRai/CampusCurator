const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  switchRole
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { googleAuth } = require('../controllers/googleAuthController'); // new
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Google OAuth token verification endpoint
router.post('/google', googleAuth);

router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.post('/switch-role', protect, switchRole);

module.exports = router;
