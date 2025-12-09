const User = require('../models/User');
exports.register = async (req, res, next) => {
  return res.status(410).json({ success: false, message: 'Email/password registration is disabled. Use Google Sign-In.' });
};
exports.login = async (req, res, next) => {
  return res.status(410).json({ success: false, message: 'Email/password login is disabled. Use Google Sign-In.' });
};
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {},
    message: 'Logged out successfully'
  });
};
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: user.roles,
      activeRole: user.activeRole || user.role,
      batch: user.batch,
      department: user.department
    }
  });
};

exports.switchRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const user = await User.findById(req.user.id);
    const rolesList = Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role];

    if (!rolesList.includes(role)) {
      return res.status(403).json({ success: false, message: 'You do not have this role' });
    }

    // Keep legacy role field in sync for compatibility
    user.activeRole = role;
    user.role = role;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
