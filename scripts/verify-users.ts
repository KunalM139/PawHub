import { connectToDatabase } from "../src/server/db/connect";
import { UserModel } from "../src/server/models/user";
import mongoose from "mongoose";

async function verifyAllUsers() {
  try {
    await connectToDatabase();
    
    // Update all users to verified seller
    const result = await UserModel.updateMany(
      {},
      { 
        $set: { 
          role: "verifiedSeller", 
          isPhoneVerified: true 
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} users to verifiedSeller.`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verifyAllUsers();
