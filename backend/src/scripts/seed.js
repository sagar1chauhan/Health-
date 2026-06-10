import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resolve } from 'path';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import PatientProfile from '../models/PatientProfile.js';

// Load env vars
dotenv.config({ path: resolve(process.cwd(), '.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing doctors and users named "Mock"
    await User.deleteMany({ email: { $in: ['doctor@mock.com', 'patient@mock.com'] } });

    console.log('Inserting mock data...');

    // 1. Create a Mock Doctor
    const doctor = await User.create({
      name: 'Dr. Sarah Wilson',
      email: 'doctor@mock.com',
      password: 'password123',
      role: 'doctor',
      phone: '1234567890',
      status: 'active'
    });

    await DoctorProfile.create({
      userId: doctor._id,
      specialization: 'Cardiologist',
      experience: 10,
      availability: [
        {
          day: 'monday',
          slots: [
            { startTime: '09:00', endTime: '09:30' },
            { startTime: '10:00', endTime: '10:30' }
          ]
        },
        {
          day: 'wednesday',
          slots: [
            { startTime: '14:00', endTime: '14:30' },
            { startTime: '15:00', endTime: '15:30' }
          ]
        }
      ]
    });

    // 2. Create a Mock Patient
    const patient = await User.create({
      name: 'John Doe',
      email: 'patient@mock.com',
      password: 'password123',
      role: 'patient',
      phone: '0987654321',
      status: 'active'
    });

    await PatientProfile.create({
      userId: patient._id,
      age: 35,
      gender: 'male',
      bloodGroup: 'O+',
      height: 180,
      weight: 75
    });

    console.log('Mock Data Seeded Successfully!');
    console.log('---------------------------------');
    console.log('You can now log in with:');
    console.log('Doctor: doctor@mock.com / password123');
    console.log('Patient: patient@mock.com / password123');
    console.log('---------------------------------');
    
    process.exit();
  } catch (error) {
    console.error(`Error with data seeding: ${error}`);
    process.exit(1);
  }
};

seedData();
