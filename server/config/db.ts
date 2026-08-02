import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri !== 'mongodb://127.0.0.1:27017/college_erp') {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`[MongoDB] Connected to custom MongoDB URI: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`[MongoDB] Failed to connect to MONGODB_URI (${uri}), falling back to Memory DB...`, err);
    }
  }

  // Fallback to in-memory MongoDB Server for instant seamless execution
  try {
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB] Connected to In-Memory MongoDB Instance at ${conn.connection.host}`);
  } catch (err) {
    console.error('[MongoDB] Connection error:', err);
  }
};
