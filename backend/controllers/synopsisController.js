const path = require('path');
const Synopsis = require('../models/Synopsis');
const Group = require('../models/Group');
const Drive = require('../models/Drive');
const User = require('../models/User');
const { notifySynopsisReviewed, createNotificationWithEmail } = require('../utils/notifications');
const { emailTemplates, sendEmail } = require('../utils/email');

const STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  CHANGES_REQUESTED: 'changes_requested',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const TRANSITIONS = {
  [STATUS.DRAFT]: [STATUS.SUBMITTED],
  [STATUS.SUBMITTED]: [STATUS.UNDER_REVIEW, STATUS.CHANGES_REQUESTED, STATUS.APPROVED, STATUS.REJECTED],
  [STATUS.UNDER_REVIEW]: [STATUS.APPROVED, STATUS.REJECTED, STATUS.CHANGES_REQUESTED],
  [STATUS.CHANGES_REQUESTED]: [STATUS.SUBMITTED],
  [STATUS.REJECTED]: [STATUS.SUBMITTED],
  [STATUS.APPROVED]: []
};

const SUBMITTABLE_STATUSES = [STATUS.DRAFT, STATUS.CHANGES_REQUESTED, STATUS.REJECTED];
const REVIEW_DECISIONS = [STATUS.UNDER_REVIEW, STATUS.APPROVED, STATUS.REJECTED, STATUS.CHANGES_REQUESTED];

const canTransition = (current, next) => (TRANSITIONS[current] || []).includes(next);

const buildDocumentsFromFiles = files =>
  (files || []).map(file => ({
    fileName: file.originalname,
    fileUrl: `/uploads/${path.basename(file.path)}`,
    fileSize: file.size,
    uploadedAt: new Date()
  }));

const isGroupMember = (group, userId) => {
  const target = userId.toString();
  const acceptedMembers = group.members.filter(m => !m.status || m.status === 'accepted');
  const memberMatch = acceptedMembers.some(m => m.student && m.student.toString() === target);
  return group.leader.toString() === target || memberMatch;
};

const takeSnapshot = synopsis => ({
  version: synopsis.version,
  title: synopsis.title,
  abstract: synopsis.abstract,
  objectives: synopsis.objectives,
  methodology: synopsis.methodology,
  expectedOutcome: synopsis.expectedOutcome,
  technologies: synopsis.technologies,
  documents: (synopsis.documents || []).map(doc => ({
    fileName: doc.fileName,
    fileUrl: doc.fileUrl,
    fileSize: doc.fileSize,
    uploadedAt: doc.uploadedAt
  })),
  status: synopsis.status,
  feedback: synopsis.feedback,
  reviewedBy: synopsis.reviewedBy,
  reviewedAt: synopsis.reviewedAt,
  submittedBy: synopsis.submittedBy,
  submittedAt: synopsis.submittedAt,
  snapshotTakenAt: new Date()
});

const ensureDriveAllowsSynopsis = drive => {
  if (!drive) {
    return 'Drive not found';
  }

  if (drive.status !== 'active') {
    return 'Drive is not active for submissions';
  }

  const stage = drive.stages?.synopsisSubmission;
  if (!stage || stage.enabled === false) {
    return 'Synopsis submission stage is disabled for this drive';
  }

  if (stage.status !== 'active' && !drive.allowLateSubmissions) {
    return 'Synopsis submission window is closed for this drive';
  }

  return null;
};

/**
 * @desc    Submit synopsis for a group
 * @route   POST /api/synopsis
 * @access  Private/Student
 */
exports.submitSynopsis = async (req, res, next) => {
  try {
    const { groupId, title, abstract, objectives, methodology, expectedOutcome, technologies } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!isGroupMember(group, req.user.id)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to submit synopsis for this group' });
    }

    const drive = await Drive.findById(group.drive);
    const driveError = ensureDriveAllowsSynopsis(drive);
    if (driveError) {
      return res.status(400).json({ success: false, message: driveError });
    }

    if (!group.assignedMentor) {
      return res.status(400).json({ success: false, message: 'Group must have an assigned mentor before submitting synopsis' });
    }

    const documents = buildDocumentsFromFiles(req.files);
    let synopsis = await Synopsis.findOne({ group: groupId });

    if (synopsis) {
      if (!SUBMITTABLE_STATUSES.includes(synopsis.status)) {
        return res.status(400).json({
          success: false,
          message: `Synopsis cannot be resubmitted while it is ${synopsis.status}`
        });
      }

      synopsis.history.push(takeSnapshot(synopsis));

      synopsis.version += 1;
      synopsis.title = title;
      synopsis.abstract = abstract;
      synopsis.objectives = objectives || synopsis.objectives;
      synopsis.methodology = methodology || synopsis.methodology;
      synopsis.expectedOutcome = expectedOutcome || synopsis.expectedOutcome;
      synopsis.technologies = technologies || synopsis.technologies;
      synopsis.documents = documents.length > 0 ? documents : synopsis.documents;
      synopsis.submittedBy = req.user.id;
      synopsis.submittedAt = new Date();
      synopsis.status = STATUS.SUBMITTED;
      synopsis.reviewedBy = undefined;
      synopsis.reviewedAt = undefined;
      synopsis.feedback = undefined;

      await synopsis.save();
    } else {
      synopsis = await Synopsis.create({
        group: groupId,
        drive: group.drive,
        title,
        abstract,
        objectives,
        methodology,
        expectedOutcome,
        technologies,
        documents,
        submittedBy: req.user.id,
        submittedAt: new Date(),
        status: STATUS.SUBMITTED
      });
    }

    await synopsis.populate('group', 'name');
    await synopsis.populate('submittedBy', 'name email');

    if (group.assignedMentor) {
      const mentor = await User.findById(group.assignedMentor);

      await createNotificationWithEmail(
        {
          recipient: group.assignedMentor,
          type: 'synopsis-submitted',
          title: 'New Synopsis Submission',
          message: `Group "${group.name}" has submitted their project synopsis "${title}" for review.`,
          relatedGroup: groupId,
          actionUrl: '/mentor/reviews'
        },
        true
      );

      const template = emailTemplates.synopsisSubmitted(group.name, title);
      await sendEmail({
        email: mentor.email,
        subject: template.subject,
        message: template.message,
        html: template.html
      }).catch(err => console.error('Email failed:', err));
    }

    res.status(201).json({
      success: true,
      message: synopsis.version > 1 ? 'Synopsis updated successfully' : 'Synopsis submitted successfully',
      data: synopsis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get synopsis by ID
 * @route   GET /api/synopsis/:id
 * @access  Private
 */
exports.getSynopsis = async (req, res, next) => {
  try {
    const synopsis = await Synopsis.findById(req.params.id)
      .populate('group', 'name leader members assignedMentor')
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email');

    if (!synopsis) {
      return res.status(404).json({
        success: false,
        message: 'Synopsis not found'
      });
    }

    const group = synopsis.group;
    const isMentor = group.assignedMentor && group.assignedMentor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isGroupMember(group, req.user.id) && !isMentor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this synopsis'
      });
    }

    res.status(200).json({
      success: true,
      data: synopsis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get synopsis for a group
 * @route   GET /api/synopsis/group/:groupId
 * @access  Private
 */
exports.getGroupSynopsis = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const isMentor = group.assignedMentor && group.assignedMentor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isGroupMember(group, req.user.id) && !isMentor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this synopsis'
      });
    }

    const synopsis = await Synopsis.findOne({ group: groupId })
      .populate('group', 'name leader members assignedMentor')
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email');

    if (!synopsis) {
      return res.status(404).json({
        success: false,
        message: 'Synopsis not found for this group'
      });
    }

    res.status(200).json({
      success: true,
      data: synopsis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all synopses (for mentor/admin)
 * @route   GET /api/synopsis
 * @access  Private/Mentor/Admin
 */
exports.getAllSynopses = async (req, res, next) => {
  try {
    const { status, drive } = req.query;
    let query = {};

    // Mentors can only see synopses for their assigned groups
    if (req.user.role === 'mentor') {
      const groups = await Group.find({ assignedMentor: req.user.id });
      const groupIds = groups.map(g => g._id);
      query.group = { $in: groupIds };
    }

    // Filter by status if provided
    if (status) {
      const normalizedStatus = status.replace('-', '_');
      query.status = normalizedStatus;
    }

    // Filter by drive if provided
    if (drive) {
      query.drive = drive;
    }

    const synopses = await Synopsis.find(query)
      .populate('group', 'name leader members')
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort('-submittedAt');

    res.status(200).json({
      success: true,
      count: synopses.length,
      data: synopses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Review synopsis (approve/reject/request revision)
 * @route   PUT /api/synopsis/:id/review
 * @access  Private/Mentor
 */
exports.reviewSynopsis = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;

    if (!REVIEW_DECISIONS.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be under_review, approved, rejected, or changes_requested' });
    }

    if ([STATUS.REJECTED, STATUS.CHANGES_REQUESTED].includes(status) && !feedback) {
      return res.status(400).json({ success: false, message: 'Feedback is required when rejecting or requesting changes' });
    }

    const synopsis = await Synopsis.findById(req.params.id).populate('group', 'name leader members assignedMentor');

    if (!synopsis) {
      return res.status(404).json({ success: false, message: 'Synopsis not found' });
    }

    if (synopsis.group.assignedMentor?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the assigned mentor can review this synopsis' });
    }

    if (!canTransition(synopsis.status, status)) {
      return res.status(400).json({ success: false, message: `Cannot transition synopsis from ${synopsis.status} to ${status}` });
    }

    synopsis.history.push(takeSnapshot(synopsis));

    synopsis.status = status;
    synopsis.feedback = feedback;
    synopsis.reviewedBy = req.user.id;
    synopsis.reviewedAt = new Date();

    await synopsis.save();
    await synopsis.populate('reviewedBy', 'name email');

    const group = await Group.findById(synopsis.group._id).populate('leader members.student');
    const studentIds = [group.leader._id, ...group.members.map(m => m.student._id)];

    await notifySynopsisReviewed(
      synopsis.group._id,
      synopsis.group.name,
      studentIds,
      status,
      feedback || 'No feedback provided',
      true
    );

    res.status(200).json({
      success: true,
      message: `Synopsis ${status}`,
      data: synopsis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update synopsis (for resubmission after revision request)
 * @route   PUT /api/synopsis/:id
 * @access  Private/Student
 */
exports.updateSynopsis = async (req, res, next) => {
  try {
    const { title, abstract, objectives, methodology, expectedOutcome, technologies } = req.body;

    const synopsis = await Synopsis.findById(req.params.id).populate('group');

    if (!synopsis) {
      return res.status(404).json({
        success: false,
        message: 'Synopsis not found'
      });
    }

    const group = synopsis.group;
    if (!isGroupMember(group, req.user.id)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this synopsis' });
    }

    const drive = await Drive.findById(group.drive);
    const driveError = ensureDriveAllowsSynopsis(drive);
    if (driveError) {
      return res.status(400).json({ success: false, message: driveError });
    }

    if (!SUBMITTABLE_STATUSES.includes(synopsis.status)) {
      return res.status(400).json({
        success: false,
        message: 'Synopsis can only be updated when changes are requested, rejected, or in draft'
      });
    }

    synopsis.history.push(takeSnapshot(synopsis));

    synopsis.version += 1;
    synopsis.title = title || synopsis.title;
    synopsis.abstract = abstract || synopsis.abstract;
    synopsis.objectives = objectives || synopsis.objectives;
    synopsis.methodology = methodology || synopsis.methodology;
    synopsis.expectedOutcome = expectedOutcome || synopsis.expectedOutcome;
    synopsis.technologies = technologies || synopsis.technologies;
    synopsis.submittedBy = req.user.id;
    synopsis.submittedAt = new Date();
    synopsis.status = STATUS.SUBMITTED;
    synopsis.reviewedBy = undefined;
    synopsis.reviewedAt = undefined;
    synopsis.feedback = undefined;

    const documents = buildDocumentsFromFiles(req.files);
    if (documents.length > 0) {
      synopsis.documents = documents;
    }

    await synopsis.save();
    await synopsis.populate('submittedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Synopsis updated and resubmitted for review',
      data: synopsis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete synopsis
 * @route   DELETE /api/synopsis/:id
 * @access  Private/Admin
 */
exports.deleteSynopsis = async (req, res, next) => {
  try {
    const synopsis = await Synopsis.findById(req.params.id);

    if (!synopsis) {
      return res.status(404).json({
        success: false,
        message: 'Synopsis not found'
      });
    }

    await synopsis.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Synopsis deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get synopsis history (versions)
 * @route   GET /api/synopsis/:id/history
 * @access  Private
 */
exports.getSynopsisHistory = async (req, res, next) => {
  try {
    const synopsis = await Synopsis.findById(req.params.id).populate('group', 'leader members assignedMentor');

    if (!synopsis) {
      return res.status(404).json({ success: false, message: 'Synopsis not found' });
    }

    const group = synopsis.group;
    const isMentor = group.assignedMentor && group.assignedMentor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isGroupMember(group, req.user.id) && !isMentor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this history' });
    }

    res.status(200).json({ success: true, data: synopsis.history || [] });
  } catch (error) {
    next(error);
  }
};
