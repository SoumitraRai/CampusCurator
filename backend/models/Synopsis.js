const mongoose = require('mongoose');
const synopsisSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    unique: true
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide project title'],
    trim: true
  },
  abstract: {
    type: String,
    required: [true, 'Please provide project abstract'],
    trim: true
  },
  objectives: {
    type: String,
    trim: true
  },
  methodology: {
    type: String,
    trim: true
  },
  expectedOutcome: {
    type: String,
    trim: true
  },
  technologies: [{
    type: String,
    trim: true
  }],
  documents: [{
    fileName: String,
    fileUrl: String,
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
  version: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under-review', 'approved', 'rejected', 'revision-requested'],
    default: 'draft'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  feedback: {
    type: String,
    trim: true
  },
  revisions: [{
    version: Number,
    submittedAt: Date,
    feedback: String,
    status: String
  }]
}, {
  timestamps: true
});
synopsisSchema.index({ group: 1 });
synopsisSchema.index({ drive: 1, status: 1 });
synopsisSchema.index({ reviewedBy: 1 });
module.exports = mongoose.model('Synopsis', synopsisSchema);
