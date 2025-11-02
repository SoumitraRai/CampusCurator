const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};
const filterAndSort = (query, filters = {}, sort = '-createdAt') => {
  return query.find(filters).sort(sort);
};
const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
const isDeadlinePassed = (deadline) => {
  return new Date() > new Date(deadline);
};
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
const calculatePercentage = (obtained, total) => {
  if (total === 0) return 0;
  return Math.round((obtained / total) * 100 * 100) / 100;
};
const getGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 35) return 'D';
  return 'F';
};
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9._-]/gi, '_').toLowerCase();
};
const successResponse = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};
const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};
module.exports = {
  asyncHandler,
  paginate,
  filterAndSort,
  generateRandomString,
  isDeadlinePassed,
  formatDate,
  calculatePercentage,
  getGrade,
  sanitizeFilename,
  successResponse,
  errorResponse
};
