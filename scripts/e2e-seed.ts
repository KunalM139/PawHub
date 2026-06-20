import { connectToDatabase } from "../src/server/db/connect";
import { UserModel } from "../src/server/models/user";
import { ListingModel } from "../src/server/models/listing";
import { InterestRequestModel } from "../src/server/models/interest-request";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

async function runE2ESeed() {
  try {
    await connectToDatabase();

    const passwordHash = await bcrypt.hash("password123", 10);

    // 1. Create Buyer
    const buyer = await UserModel.findOneAndUpdate(
      { email: "buyer@test.com" },
      {
        $set: {
          name: "E2E Buyer",
          password: passwordHash,
          role: "user",
          isPhoneVerified: true,
          phone: "+91 99999 11111"
        }
      },
      { upsert: true, new: true }
    );

    // 2. Create Seller
    const seller = await UserModel.findOneAndUpdate(
      { email: "seller@test.com" },
      {
        $set: {
          name: "E2E Seller",
          password: passwordHash,
          role: "verifiedSeller",
          isPhoneVerified: true,
          phone: "+91 88888 22222"
        }
      },
      { upsert: true, new: true }
    );

    // Clean up old listings/requests
    await ListingModel.deleteMany({ title: "E2E Test Golden Retriever" });
    await InterestRequestModel.deleteMany({ buyerId: buyer._id });

    // 3. Create Listing
    const listing = await ListingModel.create({
      sellerId: seller._id,
      listingType: "sale",
      petCategory: "dog",
      title: "E2E Test Golden Retriever",
      breed: "Golden Retriever",
      description: "This is a special test dog for the E2E browser test.",
      ageInMonths: 4,
      gender: "male",
      priceInr: 15000,
      city: "Mumbai",
      state: "Maharashtra",
      images: ["https://res.cloudinary.com/demo/image/upload/dog.jpg"],
      isVerifiedSeller: true,
      isPhoneVerified: true,
      status: "approved",
      isActive: true,
    });

    console.log(`E2E Seed complete.`);
    console.log(`Buyer: buyer@test.com / password123`);
    console.log(`Seller: seller@test.com / password123`);
    console.log(`Listing ID: ${listing._id}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runE2ESeed();
