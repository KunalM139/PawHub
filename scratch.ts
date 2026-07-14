const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());

import { connectToDatabase } from "./src/server/db/connect";
import { MessageModel } from "./src/server/models/message";
import mongoose from "mongoose";

async function run() {
  await connectToDatabase();
  const listingId = new mongoose.Types.ObjectId();
  const senderId = new mongoose.Types.ObjectId();
  const receiverId = new mongoose.Types.ObjectId();
  
  const msg = await MessageModel.create({
    listingId, senderId, receiverId, body: "test", status: "sent"
  });
  
  console.log("Raw object keys:", Object.keys(msg.toObject()));
  console.log("JSON:", JSON.stringify(msg));
  process.exit(0);
}
run();
