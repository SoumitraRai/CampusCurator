const express = require('express');
const {
  bulkCreateStudents,
  bulkCreateMentors,
  addUsersToDrive,
  getStudentsByBatch,
  getMentorsByDepartment
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Bulk user creation (Admin only)
router.post('/bulk/students', protect, authorize('admin'), bulkCreateStudents);
router.post('/bulk/mentors', protect, authorize('admin'), bulkCreateMentors);

// Add users to drive
router.post('/drives/:driveId/add-users', protect, authorize('admin'), addUsersToDrive);

// Get users by criteria
router.get('/students/batch/:batch', protect, getStudentsByBatch);
router.get('/mentors/department/:department', protect, getMentorsByDepartment);

// Default route
router.get('/', protect, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Users API',
    endpoints: {
      'POST /bulk/students': 'Bulk create students',
      'POST /bulk/mentors': 'Bulk create mentors',
      'POST /drives/:driveId/add-users': 'Add users to drive',
      'GET /students/batch/:batch': 'Get students by batch',
      'GET /mentors/department/:department': 'Get mentors by department'
    }
  });
});

module.exports = router;
