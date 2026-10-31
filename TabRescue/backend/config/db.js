import mongoose from 'mongoose';

/**
 * Connect to MongoDB with robust error handling and event logging
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tabrescue', {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[TabRescue DB] MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error(`[TabRescue DB Error]: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[TabRescue DB Warning]: MongoDB disconnected. Attempting reconnect...');
    });

    return conn;
  } catch (error) {
    console.error(`[TabRescue DB Fatal Error]: ${error.message}`);
    console.warn('[TabRescue DB Warning]: Ensure MongoDB is running on mongodb://localhost:27017 or configure MONGODB_URI in backend/.env');
    // Note: Do not exit immediately so dev server can still give informative error messages to API clients
  }
};

export default connectDB;
