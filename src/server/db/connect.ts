import mongoose from "mongoose";

declare global {
  var mongooseConnection:
    | {
        connection: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

function getMongoUri(): string {
  const value = process.env.MONGODB_URI;

  if (!value) {
    throw new Error("MONGODB_URI is not set. Check your environment variables.");
  }

  return value;
}

const cached =
  global.mongooseConnection ??
  (global.mongooseConnection = { connection: null, promise: null });

export async function connectToDatabase() {
  const mongodbUri = getMongoUri();

  if (cached.connection) {
    return cached.connection;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongodbUri, {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB_NAME ?? "pawhub",
    });
  }

  cached.connection = await cached.promise;
  return cached.connection;
}
