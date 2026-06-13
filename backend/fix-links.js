import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TelemedicineConsultation from './src/models/TelemedicineConsultation.js';
import Appointment from './src/models/Appointment.js';

dotenv.config({ path: './.env' });

async function fixLinks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const sessions = await TelemedicineConsultation.find({});
    let updated = 0;
    
    for (const session of sessions) {
      if (session.meetingLink && session.meetingLink.includes('meet.healthhub.com')) {
        const newLink = session.meetingLink.replace('https://meet.healthhub.com/', 'https://meet.jit.si/HealthHub_');
        session.meetingLink = newLink;
        await session.save();
        
        // Also update appointment
        const apt = await Appointment.findById(session.appointmentId);
        if (apt) {
          apt.meetingLink = newLink;
          await apt.save();
        }
        updated++;
      }
    }
    
    console.log(`Successfully updated ${updated} meeting links.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fixLinks();
