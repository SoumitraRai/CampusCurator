const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'drive-created',
      'group-invitation',
      'member-joined',
      'member-request',
      'mentor-assigned',
      'synopsis-submitted',
      'synopsis-reviewed',
      'checkpoint-reminder',
      'evaluation-published',
      'result-published',
      'deadline-reminder',
      'general'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  relatedDrive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive'
  },
  relatedGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  actionUrl: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000
  }
}, {
  timestamps: true
});
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', notificationSchema);
