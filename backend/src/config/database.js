import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URI;

    if (!mongoUrl) {
      console.error('❌ MONGODB_URI is not defined in the environment variables');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUrl, {
      maxPoolSize: process.env.NODE_ENV === 'production' ? 50 : 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} [${process.env.NODE_ENV || 'development'}]`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB Disconnected. Attempting reconnection...');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
