const mongoose = require('mongoose');
const resultSchema = new mongoose.Schema({
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
  checkpointScores: [{
    checkpointIndex: Number,
    checkpointName: String,
    evaluation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evaluation'
    },
    marks: Number,
    maxMarks: Number,
    percentage: Number
  }],
  totalMarks: {
    type: Number,
    required: true
  },
  totalMaxMarks: {
    type: Number,
    required: true
  },
  averagePercentage: {
    type: Number
  },
  finalGrade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
  },
  result: {
    type: String,
    enum: ['pass', 'fail', 'distinction', 'pending'],
    default: 'pending'
  },
  remarks: {
    type: String,
    trim: true
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: Date,
  isPublished: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'finalized', 'published'],
    default: 'draft'
  }
}, {
  timestamps: true
});
resultSchema.pre('save', function(next) {
  if (this.totalMarks && this.totalMaxMarks) {
    this.averagePercentage = (this.totalMarks / this.totalMaxMarks) * 100;
    if (this.averagePercentage >= 90) this.finalGrade = 'A+';
    else if (this.averagePercentage >= 80) this.finalGrade = 'A';
    else if (this.averagePercentage >= 70) this.finalGrade = 'B+';
    else if (this.averagePercentage >= 60) this.finalGrade = 'B';
    else if (this.averagePercentage >= 50) this.finalGrade = 'C+';
    else if (this.averagePercentage >= 40) this.finalGrade = 'C';
    else if (this.averagePercentage >= 35) this.finalGrade = 'D';
    else this.finalGrade = 'F';
    if (this.averagePercentage >= 75) this.result = 'distinction';
    else if (this.averagePercentage >= 40) this.result = 'pass';
    else this.result = 'fail';
  }
  next();
});
resultSchema.index({ group: 1 });
resultSchema.index({ drive: 1, isPublished: 1 });
module.exports = mongoose.model('Result', resultSchema);
