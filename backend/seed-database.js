const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Drive = require('./models/Drive');

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Sample data
const sampleStudents = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@campus.edu',
    password: 'student123',
    role: 'student',
    batch: '2025',
    department: 'Computer Science',
    registrationNumber: 'CS2025001'
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@campus.edu',
    password: 'student123',
    role: 'student',
    batch: '2025',
    department: 'Computer Science',
    registrationNumber: 'CS2025002'
  },
  {
    name: 'Charlie Brown',
    email: 'charlie.brown@campus.edu',
    password: 'student123',
    role: 'student',
    batch: '2025',
    department: 'Computer Science',
    registrationNumber: 'CS2025003'
  },
  {
    name: 'Diana Prince',
    email: 'diana.prince@campus.edu',
    password: 'student123',
    role: 'student',
    batch: '2024',
    department: 'Information Technology',
    registrationNumber: 'IT2024001'
  },
  {
    name: 'Eve Adams',
    email: 'eve.adams@campus.edu',
    password: 'student123',
    role: 'student',
    batch: '2024',
    department: 'Information Technology',
    registrationNumber: 'IT2024002'
  }
];

const sampleMentors = [
  {
    name: 'Prof. Kumar Sharma',
    email: 'prof.kumar@campus.edu',
    password: 'mentor123',
    role: 'mentor',
    department: 'Computer Science',
    phone: '+91-9876543210'
  },
  {
    name: 'Dr. Priya Patel',
    email: 'dr.priya@campus.edu',
    password: 'mentor123',
    role: 'mentor',
    department: 'Computer Science',
    phone: '+91-9876543211'
  },
  {
    name: 'Prof. Rajesh Singh',
    email: 'prof.rajesh@campus.edu',
    password: 'mentor123',
    role: 'mentor',
    department: 'Information Technology',
    phone: '+91-9876543212'
  }
];

const sampleAdmin = {
  name: 'Admin User',
  email: 'admin@campus.edu',
  password: 'admin123',
  role: 'admin',
  department: 'Administration'
};

// Seeder functions
const seedUsers = async () => {
  try {
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});

    console.log('👨‍🎓 Creating students...');
    const students = await User.create(sampleStudents);
    console.log(`✅ Created ${students.length} students`);

    console.log('👨‍🏫 Creating mentors...');
    const mentors = await User.create(sampleMentors);
    console.log(`✅ Created ${mentors.length} mentors`);

    console.log('👨‍💼 Creating admin...');
    const admin = await User.create(sampleAdmin);
    console.log(`✅ Created admin: ${admin.email}`);

    console.log('\n📊 Summary:');
    console.log(`Students: ${students.length}`);
    console.log(`Mentors: ${mentors.length}`);
    console.log(`Admin: 1`);
    console.log(`Total Users: ${students.length + mentors.length + 1}`);

    return { students, mentors, admin };
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    throw error;
  }
};

const seedDriveWithUsers = async () => {
  try {
    console.log('\n🚀 Creating sample drive with populated users...');
    
    // Get all users
    const students = await User.find({ role: 'student' });
    const mentors = await User.find({ role: 'mentor' });
    const admin = await User.findOne({ role: 'admin' });

    if (!admin) {
      throw new Error('Admin user not found');
    }

    // Create drive with actual users
    const sampleDrive = {
      name: 'Mini Project Drive - 2025',
      description: 'Final year mini project for batches 2024 and 2025',
      academicYear: '2024-25',
      participatingBatches: ['2025', '2024'],
      participatingStudents: students.map(s => s._id),
      mentors: mentors.map(m => m._id),
      maxGroupSize: 4,
      maxGroupsPerMentor: 6,
      stages: {
        groupFormation: {
          enabled: true,
          startDate: new Date('2025-01-01'),
          deadline: new Date('2025-01-15'),
          status: 'active'
        },
        mentorAllotment: {
          enabled: true,
          deadline: new Date('2025-01-20'),
          status: 'not-started'
        },
        synopsisSubmission: {
          enabled: true,
          deadline: new Date('2025-02-01'),
          status: 'not-started'
        }
      },
      status: 'active',
      currentStage: 'group-formation',
      createdBy: admin._id
    };

    await Drive.deleteMany({}); // Clear existing drives
    const drive = await Drive.create(sampleDrive);
    
    // Populate for display
    const populatedDrive = await Drive.findById(drive._id)
      .populate('participatingStudents', 'name email batch')
      .populate('mentors', 'name email department')
      .populate('createdBy', 'name email');

    console.log('✅ Drive created successfully!');
    console.log(`📝 Drive Name: ${populatedDrive.name}`);
    console.log(`👨‍🎓 Participating Students: ${populatedDrive.participatingStudents.length}`);
    console.log(`👨‍🏫 Mentors: ${populatedDrive.mentors.length}`);
    console.log(`📊 Max Groups: ${populatedDrive.mentors.length * populatedDrive.maxGroupsPerMentor}`);

    return populatedDrive;
  } catch (error) {
    console.error('❌ Error creating drive:', error.message);
    throw error;
  }
};

// Main seeder function
const runSeeder = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    await connectDB();
    
    // Seed users first
    const { students, mentors, admin } = await seedUsers();
    
    // Create drive with the seeded users
    const drive = await seedDriveWithUsers();
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@campus.edu / admin123');
    console.log('Student: alice.johnson@campus.edu / student123');
    console.log('Mentor: prof.kumar@campus.edu / mentor123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Command line options
const args = process.argv.slice(2);
if (args.includes('--delete-only')) {
  // Only delete data
  connectDB().then(async () => {
    console.log('🗑️ Deleting all data...');
    await User.deleteMany({});
    await Drive.deleteMany({});
    console.log('✅ All data deleted');
    process.exit(0);
  });
} else {
  // Run full seeder
  runSeeder();
}

module.exports = {
  seedUsers,
  seedDriveWithUsers,
  sampleStudents,
  sampleMentors,
  sampleAdmin
};
