const mongoose = require('mongoose');
const checkpointSubmissionSchema = new mongoose.Schema({
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
  checkpointIndex: {
    type: Number,
    required: true
  },
  checkpointName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  files: [{
    fileName: String,
    fileUrl: String,
    fileType: {
      type: String,
      enum: ['report', 'code', 'presentation', 'video', 'other']
    },
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
    enum: ['draft', 'submitted', 'under-evaluation', 'evaluated', 'revision-requested'],
    default: 'draft'
  }
}, {
  timestamps: true
});
checkpointSubmissionSchema.index({ group: 1, checkpointIndex: 1 });
checkpointSubmissionSchema.index({ drive: 1, checkpointIndex: 1 });
module.exports = mongoose.model('CheckpointSubmission', checkpointSubmissionSchema);
