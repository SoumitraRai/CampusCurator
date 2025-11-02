const mongoose = require('mongoose');
const driveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a drive name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  academicYear: {
    type: String,
    required: true
  },
  participatingBatches: [{
    type: String,
    required: true
  }],
  participatingStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  mentors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxGroupSize: {
    type: Number,
    required: true,
    default: 4,
    min: 1
  },
  minGroupSize: {
    type: Number,
    default: 1,
    min: 1
  },
  maxGroupsPerMentor: {
    type: Number,
    required: true,
    default: 6,
    min: 1
  },
  stages: {
    groupFormation: {
      enabled: {
        type: Boolean,
        default: true
      },
      startDate: Date,
      deadline: Date,
      status: {
        type: String,
        enum: ['not-started', 'active', 'completed'],
        default: 'not-started'
      }
    },
    mentorAllotment: {
      enabled: {
        type: Boolean,
        default: true
      },
      deadline: Date,
      status: {
        type: String,
        enum: ['not-started', 'active', 'completed'],
        default: 'not-started'
      }
    },
    synopsisSubmission: {
      enabled: {
        type: Boolean,
        default: true
      },
      deadline: Date,
      status: {
        type: String,
        enum: ['not-started', 'active', 'completed'],
        default: 'not-started'
      }
    },
    checkpoints: [{
      name: {
        type: String,
        required: true
      },
      deadline: Date,
      maxMarks: {
        type: Number,
        default: 100
      },
      status: {
        type: String,
        enum: ['not-started', 'active', 'completed'],
        default: 'not-started'
      }
    }],
    result: {
      enabled: {
        type: Boolean,
        default: true
      },
      deadline: Date,
      status: {
        type: String,
        enum: ['not-started', 'active', 'completed'],
        default: 'not-started'
      }
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  currentStage: {
    type: String,
    enum: ['group-formation', 'mentor-allotment', 'synopsis', 'checkpoints', 'result', 'completed'],
    default: 'group-formation'
  },
  allowLateSubmissions: {
    type: Boolean,
    default: false
  },
  autoProgressStages: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
driveSchema.index({ status: 1, createdAt: -1 });
driveSchema.index({ participatingBatches: 1 });
module.exports = mongoose.model('Drive', driveSchema);
