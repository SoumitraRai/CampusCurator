const Drive = require('../../database/Drive');
const User = require('../../database/User');
const Group = require('../../database/Group');
exports.createDrive = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const drive = await Drive.create(req.body);
    res.status(201).json({
      success: true,
      data: drive
    });
  } catch (error) {
    next(error);
  }
};
exports.getDrives = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === 'student') {
      query = Drive.find({
        $or: [
          { participatingBatches: req.user.batch },
          { participatingStudents: req.user.id }
        ],
        status: { $in: ['active', 'completed'] }
      });
    } else if (req.user.role === 'mentor') {
      query = Drive.find({
        mentors: req.user.id
      });
    } else {
      query = Drive.find();
    }
    const drives = await query
      .populate('createdBy', 'name email')
      .populate('mentors', 'name email department')
      .sort('-createdAt');
    res.status(200).json({
      success: true,
      count: drives.length,
      data: drives
    });
  } catch (error) {
    next(error);
  }
};
exports.getDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('mentors', 'name email department')
      .populate('participatingStudents', 'name email batch');
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }
    res.status(200).json({
      success: true,
      data: drive
    });
  } catch (error) {
    next(error);
  }
};
exports.updateDrive = async (req, res, next) => {
  try {
    let drive = await Drive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }
    drive = await Drive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      success: true,
      data: drive
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }
    await drive.deleteOne();
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
exports.getDriveStats = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }
    const totalGroups = await Group.countDocuments({ drive: req.params.id });
    const groupsWithMentor = await Group.countDocuments({ 
      drive: req.params.id, 
      assignedMentor: { $exists: true } 
    });
    const activeGroups = await Group.countDocuments({ 
      drive: req.params.id, 
      status: 'active' 
    });
    const totalStudents = drive.participatingStudents.length;
    const studentsInGroups = await Group.aggregate([
      { $match: { drive: mongoose.Types.ObjectId(req.params.id) } },
      { $unwind: '$members' },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    res.status(200).json({
      success: true,
      data: {
        drive: {
          name: drive.name,
          status: drive.status,
          currentStage: drive.currentStage
        },
        groups: {
          total: totalGroups,
          withMentor: groupsWithMentor,
          active: activeGroups
        },
        students: {
          total: totalStudents,
          inGroups: studentsInGroups[0]?.count || 0,
          unregistered: totalStudents - (studentsInGroups[0]?.count || 0)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
exports.updateDriveStage = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }
    const { stage } = req.body;
    drive.currentStage = stage;
    await drive.save();
    res.status(200).json({
      success: true,
      data: drive
    });
  } catch (error) {
    next(error);
  }
};
