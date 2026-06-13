import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TelemedicineConsultation from './src/models/TelemedicineConsultation.js';
import Appointment from './src/models/Appointment.js';

dotenv.config({ path: './.env' });

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const sessions = await TelemedicineConsultation.find({});
    console.log('TelemedicineConsultations:', JSON.stringify(sessions, null, 2));
    
    const appointments = await Appointment.find({ type: 'telemedicine' });
    console.log('Appointments (telemedicine):', JSON.stringify(appointments, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkDb();
