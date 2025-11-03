#!/usr/bin/env node
/**
 * CampusCurator Database Seeder
 * Seeds sample users (admin, mentors, students) for testing
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import the seeder from database folder
const seeder = require(path.join(__dirname, '../database/seeder.js'));

console.log('Starting CampusCurator database seeder...\n');
