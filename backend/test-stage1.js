const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Mock middleware for testing (without database)
const mockAuth = (req, res, next) => {
  // Mock user object for testing
  req.user = {
    id: 'mock-admin-id',
    name: 'Mock Admin',
    email: 'admin@test.com',
    role: 'admin'
  };
  next();
};

const mockAuthorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Mock Drive Controller for testing Stage 1 - COMPLETE VERSION
const mockCreateDrive = async (req, res) => {
  try {
    // Validate required fields for Stage 1
    const {
      name,
      description,
      academicYear,
      participatingBatches,
      participatingStudentEmails,
      mentorEmails,
      maxGroupSize,
      maxGroupsPerMentor,
      stages
    } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Drive name is required'
      });
    }

    if (!participatingBatches || participatingBatches.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one participating batch is required'
      });
    }

    // Mock email validation for students
    let mockStudents = [];
    if (participatingStudentEmails && participatingStudentEmails.length > 0) {
      mockStudents = participatingStudentEmails.map((email, index) => ({
        _id: `student-${index}`,
        email,
        name: `Student ${index + 1}`,
        batch: participatingBatches[0]
      }));
    }

    // Mock email validation for mentors  
    let mockMentors = [];
    if (mentorEmails && mentorEmails.length > 0) {
      mockMentors = mentorEmails.map((email, index) => ({
        _id: `mentor-${index}`,
        email,
        name: `Mentor ${index + 1}`,
        department: 'Computer Science'
      }));
    }

    // Mock successful drive creation
    const mockDrive = {
      _id: 'mock-drive-id',
      name,
      description,
      academicYear,
      participatingBatches,
      participatingStudents: mockStudents,
      mentors: mockMentors,
      maxGroupSize: maxGroupSize || 4,
      maxGroupsPerMentor: maxGroupsPerMentor || 6,
      stages: stages || {
        groupFormation: {
          enabled: true,
          status: 'not-started',
          deadline: '2025-01-15T23:59:59Z'
        },
        mentorAllotment: {
          enabled: true,
          status: 'not-started',
          deadline: '2025-01-20T23:59:59Z'
        },
        synopsisSubmission: {
          enabled: true,
          status: 'not-started',
          deadline: '2025-02-01T23:59:59Z'
        }
      },
      status: 'active', // Drive becomes "Active" as per flow
      currentStage: 'group-formation',
      createdBy: req.user.id,
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Stage 1: Drive created successfully with all participants!',
      data: mockDrive,
      summary: {
        totalStudents: mockStudents.length,
        totalMentors: mockMentors.length,
        maxGroups: Math.floor(mockMentors.length * (maxGroupsPerMentor || 6)),
        stagesConfigured: Object.keys(mockDrive.stages).length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const mockGetDrives = async (req, res) => {
  const mockDrives = [
    {
      _id: 'drive-1',
      name: 'Mini Project 3 - 2025 Batch',
      description: 'Final year project drive',
      academicYear: '2024-25',
      participatingBatches: ['2025'],
      status: 'active',
      currentStage: 'group-formation',
      createdAt: new Date()
    }
  ];

  res.status(200).json({
    success: true,
    count: mockDrives.length,
    data: mockDrives
  });
};

// Routes for Stage 1 testing
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Stage 1 Test Server is running',
    stage: 'Drive Creation Testing'
  });
});

// Stage 1: Drive Creation Routes
app.route('/api/drives')
  .get(mockAuth, mockGetDrives)
  .post(mockAuth, mockAuthorize('admin'), mockCreateDrive);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5001; // Use different port to avoid conflicts
const server = app.listen(PORT, () => {
  console.log(`Stage 1 Test Server running on port ${PORT}`);
});

module.exports = app;
