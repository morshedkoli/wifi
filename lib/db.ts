import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error('Please define the DATABASE_URL environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }

  const opts = {
    bufferCommands: false,
  };

  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
        return mongoose;
      });
    }

    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;