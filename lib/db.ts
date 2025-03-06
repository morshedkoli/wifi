import mongoose from 'mongoose';

// Declare a global mongoose object for caching the connection across hot reloads in development
declare global {
  // Ensure the type matches what you want to cache
  var mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  } | undefined;
}

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error('Please define the DATABASE_URL environment variable inside .env');
}

// Initialize global.mongoose if not already set
global.mongoose = global.mongoose || { conn: null, promise: null };

// Reference the cached object
let cached = global.mongoose;

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  const opts = {
    bufferCommands: false,
  };

  if (!cached.promise && MONGODB_URI) {
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      cached.conn = mongoose;
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;  // Reset the promise cache on connection error
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
