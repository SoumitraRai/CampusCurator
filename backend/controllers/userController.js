const User = require('../models/User');
const Drive = require('../models/Drive');

// Bulk create students
exports.bulkCreateStudents = async (req, res, next) => {
  try {
    const { students } = req.body;
    
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({
        success: false,
        message: 'Students array is required'
      });
    }

    // Add default role and password if not provided
    const studentsData = students.map(student => ({
      ...student,
      role: 'student',
      password: student.password || 'student123'
    }));

    const createdStudents = await User.create(studentsData);

    res.status(201).json({
      success: true,
      message: `${createdStudents.length} students created successfully`,
      data: createdStudents.map(s => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        batch: s.batch,
        department: s.department,
        registrationNumber: s.registrationNumber
      }))
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate email or registration number found'
      });
    }
    next(error);
  }
};

// Bulk create mentors
exports.bulkCreateMentors = async (req, res, next) => {
  try {
    const { mentors } = req.body;
    
    if (!mentors || !Array.isArray(mentors)) {
      return res.status(400).json({
        success: false,
        message: 'Mentors array is required'
      });
    }

    // Add default role and password if not provided
    const mentorsData = mentors.map(mentor => ({
      ...mentor,
      role: 'mentor',
      password: mentor.password || 'mentor123'
    }));

    const createdMentors = await User.create(mentorsData);

    res.status(201).json({
      success: true,
      message: `${createdMentors.length} mentors created successfully`,
      data: createdMentors.map(m => ({
        _id: m._id,
        name: m.name,
        email: m.email,
        department: m.department,
        phone: m.phone
      }))
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate email found'
      });
    }
    next(error);
  }
};

// Add users to existing drive
exports.addUsersToDrive = async (req, res, next) => {
  try {
    const { driveId } = req.params;
    const { studentEmails, mentorEmails } = req.body;

    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }

    let addedStudents = [];
    let addedMentors = [];

    // Add students if provided
    if (studentEmails && studentEmails.length > 0) {
      const students = await User.find({
        email: { $in: studentEmails },
        role: 'student'
      });

      const newStudentIds = students
        .filter(s => !drive.participatingStudents.includes(s._id))
        .map(s => s._id);

      drive.participatingStudents.push(...newStudentIds);
      addedStudents = students;
    }

    // Add mentors if provided
    if (mentorEmails && mentorEmails.length > 0) {
      const mentors = await User.find({
        email: { $in: mentorEmails },
        role: 'mentor'
      });

      const newMentorIds = mentors
        .filter(m => !drive.mentors.includes(m._id))
        .map(m => m._id);

      drive.mentors.push(...newMentorIds);
      addedMentors = mentors;
    }

    await drive.save();

    // Populate the updated drive
    const updatedDrive = await Drive.findById(driveId)
      .populate('participatingStudents', 'name email batch')
      .populate('mentors', 'name email department');

    res.status(200).json({
      success: true,
      message: 'Users added to drive successfully',
      data: {
        drive: updatedDrive,
        summary: {
          studentsAdded: addedStudents.length,
          mentorsAdded: addedMentors.length,
          totalStudents: updatedDrive.participatingStudents.length,
          totalMentors: updatedDrive.mentors.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all students by batch
exports.getStudentsByBatch = async (req, res, next) => {
  try {
    const { batch } = req.params;
    
    const students = await User.find({ 
      role: 'student',
      batch: batch
    }).select('name email batch department registrationNumber');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// Get all mentors by department
exports.getMentorsByDepartment = async (req, res, next) => {
  try {
    const { department } = req.params;
    
    const mentors = await User.find({ 
      role: 'mentor',
      ...(department !== 'all' && { department: department })
    }).select('name email department phone');

    res.status(200).json({
      success: true,
      count: mentors.length,
      data: mentors
    });
  } catch (error) {
    next(error);
  }
};
