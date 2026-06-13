import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config({ path: './.env' });

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = await User.find({}).select('name email role');
    console.log('Users:', JSON.stringify(users, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkUsers();
