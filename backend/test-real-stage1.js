const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Mock database models for testing
const mockUsers = [
  { _id: 'student1', email: 'alice@campus.edu', name: 'Alice Johnson', role: 'student', batch: '2025' },
  { _id: 'student2', email: 'bob@campus.edu', name: 'Bob Smith', role: 'student', batch: '2025' },
  { _id: 'mentor1', email: 'prof.kumar@campus.edu', name: 'Prof Kumar', role: 'mentor', department: 'CS' },
  { _id: 'mentor2', email: 'dr.priya@campus.edu', name: 'Dr Priya', role: 'mentor', department: 'CS' }
];

// Mock User model
const mockUserModel = {
  find: (query) => {
    return {
      map: (fn) => mockUsers.filter(u => {
        if (query.email && query.email.$in) {
          return query.email.$in.includes(u.email) && (!query.role || u.role === query.role);
        }
        return true;
      }).map(fn || (x => x))
    };
  }
};

// Mock Drive model  
const mockDriveModel = {
  create: (data) => {
    return Promise.resolve({
      _id: 'mock-drive-id',
      ...data,
      createdAt: new Date()
    });
  },
  findById: (id) => ({
    populate: () => ({
      populate: () => ({
        populate: () => Promise.resolve({
          _id: id,
          name: 'Test Drive',
          status: 'active'
        })
      })
    })
  })
};

// Mock auth middleware
const mockAuth = (req, res, next) => {
  req.user = {
    id: 'test-admin-id',
    name: 'Test Admin',
    email: 'testadmin@campus.edu',
    role: 'admin'
  };
  next();
};

const mockAuthorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized`
      });
    }
    next();
  };
};

// Mock your actual createDrive controller logic
const testCreateDrive = async (req, res, next) => {
  try {
    const {
      participatingStudentEmails,
      mentorEmails,
      ...driveData
    } = req.body;

    driveData.createdBy = req.user.id;

    // Test email validation for students
    if (participatingStudentEmails && participatingStudentEmails.length > 0) {
      const students = mockUserModel.find({
        email: { $in: participatingStudentEmails },
        role: 'student'
      });
      
      if (students.length !== participatingStudentEmails.length) {
        const foundEmails = students.map(s => s.email);
        const notFound = participatingStudentEmails.filter(email => !foundEmails.includes(email));
        return res.status(400).json({
          success: false,
          message: `Students not found with emails: ${notFound.join(', ')}`
        });
      }
      
      driveData.participatingStudents = students.map(s => s._id);
    }

    // Test email validation for mentors
    if (mentorEmails && mentorEmails.length > 0) {
      const mentors = mockUserModel.find({
        email: { $in: mentorEmails },
        role: 'mentor'
      });
      
      if (mentors.length !== mentorEmails.length) {
        const foundEmails = mentors.map(m => m.email);
        const notFound = mentorEmails.filter(email => !foundEmails.includes(email));
        return res.status(400).json({
          success: false,
          message: `Mentors not found with emails: ${notFound.join(', ')}`
        });
      }
      
      driveData.mentors = mentors.map(m => m._id);
    }

    const drive = await mockDriveModel.create(driveData);
    
    res.status(201).json({
      success: true,
      message: 'Drive created successfully with actual Stage 1 logic!',
      data: drive,
      testMode: true
    });
  } catch (error) {
    next(error);
  }
};

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Testing Real Stage 1 Logic (Database Mocked)',
    availableUsers: mockUsers.length,
    mode: 'Stage 1 Real Code Testing'
  });
});

// Test your actual Stage 1 routes
app.route('/api/drives')
  .get(mockAuth, (req, res) => {
    res.json({
      success: true,
      count: 1,
      data: [{ name: 'Sample Drive', status: 'active' }]
    });
  })
  .post(mockAuth, mockAuthorize('admin'), testCreateDrive);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = 5002;
const server = app.listen(PORT, () => {
  console.log(`🎯 Testing Real Stage 1 Logic on port ${PORT}`);
  console.log(`📋 Using actual CampusCurator controller logic with mocked database`);
});

module.exports = app;
