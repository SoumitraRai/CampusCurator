const express = require('express');
const {
  createDrive,
  getDrives,
  getDrive,
  updateDrive,
  deleteDrive,
  getDriveStats,
  updateDriveStage
} = require('../controllers/driveController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
router
  .route('/')
  .get(protect, getDrives)
  .post(protect, authorize('admin'), createDrive);
router
  .route('/:id')
  .get(protect, getDrive)
  .put(protect, authorize('admin'), updateDrive)
  .delete(protect, authorize('admin'), deleteDrive);
router
  .route('/:id/stats')
  .get(protect, authorize('admin', 'mentor'), getDriveStats);
router
  .route('/:id/stage')
  .put(protect, authorize('admin'), updateDriveStage);
module.exports = router;
