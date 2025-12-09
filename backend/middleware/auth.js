const jwt = require('jsonwebtoken');
const User = require('../models/User');

const resolveActiveRole = (user, headerRole) => {
  const candidate = headerRole || user.activeRole || user.role;
  if (!candidate) return null;
  const rolesList = Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role];
  return rolesList.includes(candidate) ? candidate : rolesList[0];
};

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    const headerRole = req.headers['x-active-role'];
    req.activeRole = resolveActiveRole(req.user, headerRole || decoded.activeRole);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const roleToCheck = req.activeRole || req.user?.activeRole || req.user?.role;
    const userRoles = Array.isArray(req.user?.roles) && req.user.roles.length > 0 ? req.user.roles : [req.user?.role];
    const authorized = roles.some(r => userRoles.includes(r) && r === roleToCheck);

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: `User role ${roleToCheck} is not authorized to access this route`
      });
    }
    next();
  };
};
