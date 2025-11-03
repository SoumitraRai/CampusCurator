const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    required: true
  },
  submissionType: {
    type: String,
    enum: ['logbook', 'synopsis', 'report', 'ppt', 'other'],
    required: true
  },
  // Logbook submission
  logbook: {
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: Date
  },
  // Synopsis submission
  synopsis: {
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: Date
  },
  // Project Report submission
  projectReport: {
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: Date
  },
  // PPT/Presentation submission
  ppt: {
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: Date
  },
  // Additional files
  additionalFiles: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Submission details
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isLateSubmission: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under-review', 'accepted', 'revision-requested', 'rejected'],
    default: 'draft'
  },
  // Mentor review/feedback
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  feedback: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  // Version tracking for revisions
  version: {
    type: Number,
    default: 1
  },
  revisions: [{
    version: Number,
    submittedAt: Date,
    feedback: String,
    status: String,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
submissionSchema.index({ group: 1, drive: 1 });
submissionSchema.index({ drive: 1, submissionType: 1 });
submissionSchema.index({ submittedBy: 1 });
submissionSchema.index({ reviewedBy: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
