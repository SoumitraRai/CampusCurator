const Group = require('../models/Group');
const Drive = require('../models/Drive');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
exports.createGroup = async (req, res, next) => {
  try {
    const { name, drive, maxMembers, mentorPreferences } = req.body;
    const driveDoc = await Drive.findById(drive);
    if (!driveDoc || driveDoc.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Drive is not active or does not exist'
      });
    }
    const existingGroup = await Group.findOne({
      drive,
      $or: [
        { leader: req.user.id },
        { 'members.student': req.user.id }
      ]
    });
    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: 'You are already part of a group in this drive'
      });
    }
    const invitationCode = uuidv4().substring(0, 8).toUpperCase();
    const group = await Group.create({
      name,
      drive,
      leader: req.user.id,
      maxMembers: Math.min(maxMembers, driveDoc.maxGroupSize),
      invitationCode,
      mentorPreferences
    });
    await group.populate('leader', 'name email batch');
    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};
exports.getGroups = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.drive) {
      query.drive = req.query.drive;
    }
    if (req.user.role === 'student') {
      query.$or = [
        { leader: req.user.id },
        { 'members.student': req.user.id }
      ];
    } else if (req.user.role === 'mentor') {
      query.assignedMentor = req.user.id;
    }
    const groups = await Group.find(query)
      .populate('leader', 'name email batch')
      .populate('members.student', 'name email batch')
      .populate('assignedMentor', 'name email department')
      .populate('drive', 'name status currentStage')
      .sort('-createdAt');
    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    next(error);
  }
};
exports.getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('leader', 'name email batch')
      .populate('members.student', 'name email batch')
      .populate('assignedMentor', 'name email department')
      .populate('drive', 'name status currentStage')
      .populate('mentorPreferences.mentor', 'name email department');
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};
exports.joinGroup = async (req, res, next) => {
  try {
    const { invitationCode } = req.body;
    const group = await Group.findOne({ invitationCode });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invitation code'
      });
    }
    if (group.isLocked) {
      return res.status(400).json({
        success: false,
        message: 'Group is locked and cannot accept new members'
      });
    }
    const isMember = group.members.some(
      m => m.student.toString() === req.user.id.toString()
    );
    const isLeader = group.leader.toString() === req.user.id.toString();
    if (isMember || isLeader) {
      return res.status(400).json({
        success: false,
        message: 'You are already part of this group'
      });
    }
    const acceptedMembers = group.members.filter(m => m.status === 'accepted').length;
    if (acceptedMembers + 1 >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Group is full'
      });
    }
    group.members.push({
      student: req.user.id,
      status: 'pending'
    });
    await group.save();
    await group.populate('members.student', 'name email batch');
    res.status(200).json({
      success: true,
      data: group,
      message: 'Join request sent to group leader'
    });
  } catch (error) {
    next(error);
  }
};
exports.manageMemberRequest = async (req, res, next) => {
  try {
    const { action } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    if (group.leader.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only group leader can manage member requests'
      });
    }
    const member = group.members.id(req.params.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    if (action === 'accept') {
      member.status = 'accepted';
    } else if (action === 'reject') {
      member.status = 'rejected';
      member.remove();
    }
    await group.save();
    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};
exports.removeMember = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    if (group.leader.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only group leader can remove members'
      });
    }
    if (group.assignedMentor) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove members after mentor allotment'
      });
    }
    const member = group.members.id(req.params.memberId);
    if (member) {
      member.remove();
      await group.save();
    }
    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    if (
      req.user.role !== 'admin' &&
      group.leader.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this group'
      });
    }
    if (group.assignedMentor && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete group after mentor allotment'
      });
    }
    await group.deleteOne();
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
exports.allotMentor = async (req, res, next) => {
  try {
    const { mentorId } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }
    const drive = await Drive.findById(group.drive);
    const mentorGroupCount = await Group.countDocuments({
      drive: group.drive,
      assignedMentor: mentorId
    });
    if (mentorGroupCount >= drive.maxGroupsPerMentor) {
      return res.status(400).json({
        success: false,
        message: 'Mentor has reached maximum group limit'
      });
    }
    group.assignedMentor = mentorId;
    group.mentorAllottedAt = Date.now();
    group.mentorAllottedBy = req.user.id;
    group.status = 'mentor-assigned';
    await group.save();
    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};
exports.autoAllotMentors = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.driveId);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }
    const groups = await Group.find({
      drive: req.params.driveId,
      assignedMentor: { $exists: false }
    }).populate('mentorPreferences.mentor');
    const mentorCapacity = {};
    for (const mentor of drive.mentors) {
      const currentGroups = await Group.countDocuments({
        drive: req.params.driveId,
        assignedMentor: mentor
      });
      mentorCapacity[mentor.toString()] = drive.maxGroupsPerMentor - currentGroups;
    }
    for (const group of groups) {
      let allotted = false;
      if (group.mentorPreferences && group.mentorPreferences.length > 0) {
        const sortedPrefs = group.mentorPreferences.sort((a, b) => a.rank - b.rank);
        for (const pref of sortedPrefs) {
          const mentorId = pref.mentor._id.toString();
          if (mentorCapacity[mentorId] > 0) {
            group.assignedMentor = mentorId;
            group.mentorAllottedAt = Date.now();
            group.mentorAllottedBy = req.user.id;
            group.status = 'mentor-assigned';
            mentorCapacity[mentorId]--;
            allotted = true;
            await group.save();
            break;
          }
        }
      }
      if (!allotted) {
        for (const [mentorId, capacity] of Object.entries(mentorCapacity)) {
          if (capacity > 0) {
            group.assignedMentor = mentorId;
            group.mentorAllottedAt = Date.now();
            group.mentorAllottedBy = req.user.id;
            group.status = 'mentor-assigned';
            mentorCapacity[mentorId]--;
            await group.save();
            break;
          }
        }
      }
    }
    res.status(200).json({
      success: true,
      message: 'Mentors auto-allotted successfully'
    });
  } catch (error) {
    next(error);
  }
};
