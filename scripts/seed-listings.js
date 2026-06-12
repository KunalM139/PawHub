/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

function loadEnv() {
  if (process.env.MONGODB_URI) {
    return;
  }

  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, "utf8");
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const index = trimmed.indexOf("=");
    if (index === -1) {
      return;
    }

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function run() {
  loadEnv();

  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "pawhub";

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing in environment.");
  }

  await mongoose.connect(mongoUri, { dbName });

  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      image: { type: String },
      role: { type: String, default: "user" },
      phone: { type: String, default: null },
      city: { type: String, default: null },
      bio: { type: String, default: null },
      isPhoneVerified: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false },
  );

  const listingSchema = new mongoose.Schema(
    {
      sellerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
      listingType: { type: String, required: true },
      petCategory: { type: String, required: true },
      title: { type: String, required: true },
      breed: { type: String, required: true },
      description: { type: String, required: true },
      ageInMonths: { type: Number, required: true },
      gender: { type: String, required: true },
      priceInr: { type: Number, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      images: { type: [String], required: true },
      video: { type: String, default: null },
      isVerifiedSeller: { type: Boolean, default: false },
      isPhoneVerified: { type: Boolean, default: false },
      status: { type: String, default: "approved" },
      rejectionReason: { type: String, default: null },
      isActive: { type: Boolean, default: true },
      viewsCount: { type: Number, default: 0 },
    },
    { timestamps: true, versionKey: false },
  );

  const User = mongoose.models.SeedUser || mongoose.model("SeedUser", userSchema, "users");
  const Listing =
    mongoose.models.SeedListing || mongoose.model("SeedListing", listingSchema, "listings");

  const sellers = [
    {
      name: "Aditi Rao",
      email: "seed-aditi@pawhub.test",
      role: "verifiedSeller",
      image: "https://res.cloudinary.com/demo/image/upload/v1681234567/sample.jpg",
      phone: "+91 98111 22110",
      city: "Mumbai",
      bio: "Verified breeder focused on ethical care.",
      isPhoneVerified: true,
    },
    {
      name: "Arjun Singh",
      email: "seed-arjun@pawhub.test",
      role: "user",
      image: "https://res.cloudinary.com/demo/image/upload/v1681234568/dog.jpg",
      phone: "+91 99221 77110",
      city: "Delhi",
      bio: "Rehoming pets from a loving family.",
      isPhoneVerified: true,
    },
    {
      name: "Nisha Kapoor",
      email: "seed-nisha@pawhub.test",
      role: "verifiedSeller",
      image: "https://res.cloudinary.com/demo/image/upload/v1681234569/cat.jpg",
      phone: "+91 97001 54321",
      city: "Bengaluru",
      bio: "Cattery partner with health-first focus.",
      isPhoneVerified: true,
    },
    {
      name: "Rahul Mehta",
      email: "seed-rahul@pawhub.test",
      role: "user",
      image: "https://res.cloudinary.com/demo/image/upload/v1681234570/kitten.jpg",
      phone: "+91 90000 11223",
      city: "Pune",
      bio: "Helping pets find safe forever homes.",
      isPhoneVerified: false,
    },
  ];

  const sellerDocs = [];

  for (const seller of sellers) {
    const doc = await User.findOneAndUpdate(
      { email: seller.email },
      { $set: seller },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    ).lean();
    sellerDocs.push(doc);
  }

  const dogBreeds = [
    "Golden Retriever",
    "Labrador",
    "Beagle",
    "Pug",
    "German Shepherd",
    "Shih Tzu",
    "Indie",
    "Husky",
    "Cocker Spaniel",
    "Doberman",
    "Boxer",
    "Great Dane",
    "Spitz",
  ];
  const catBreeds = [
    "Persian",
    "Maine Coon",
    "Siamese",
    "Bengal",
    "Ragdoll",
    "Indie",
    "British Shorthair",
    "Himalayan",
    "Scottish Fold",
  ];
  const dogNames = ["Bruno", "Rocky", "Simba", "Oreo", "Daisy", "Coco", "Milo"];
  const catNames = ["Luna", "Misty", "Neko", "Shadow", "Mochi", "Bella", "Leo"];
  const cities = [
    { city: "Mumbai", state: "Maharashtra" },
    { city: "Delhi", state: "Delhi" },
    { city: "Bengaluru", state: "Karnataka" },
    { city: "Pune", state: "Maharashtra" },
    { city: "Hyderabad", state: "Telangana" },
    { city: "Chennai", state: "Tamil Nadu" },
    { city: "Kolkata", state: "West Bengal" },
    { city: "Ahmedabad", state: "Gujarat" },
    { city: "Jaipur", state: "Rajasthan" },
    { city: "Lucknow", state: "Uttar Pradesh" },
    { city: "Chandigarh", state: "Chandigarh" },
    { city: "Kochi", state: "Kerala" },
    { city: "Indore", state: "Madhya Pradesh" },
    { city: "Nagpur", state: "Maharashtra" },
  ];

  const dogImages = [
    "https://res.cloudinary.com/demo/image/upload/dog.jpg",
    "https://res.cloudinary.com/demo/image/upload/balloons.jpg",
    "https://res.cloudinary.com/demo/image/upload/hiking_dog.jpg",
  ];
  const catImages = [
    "https://res.cloudinary.com/demo/image/upload/cat.jpg",
    "https://res.cloudinary.com/demo/image/upload/kitten.jpg",
    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  ];

  const listingTypes = ["sale", "adoption", "rehome"];
  const genders = ["male", "female"];
  const temperament = [
    "friendly and calm",
    "playful and energetic",
    "gentle with kids",
    "trained for basic commands",
    "healthy and vaccinated",
    "excellent for first-time pet parents",
    "great with other pets",
    "house-trained",
  ];

  const seedDogCount = Number(process.env.SEED_DOG_COUNT || "30");
  const seedCatCount = Number(process.env.SEED_CAT_COUNT || "30");

  const listings = [];

  function createListing(petCategory) {
    const name = petCategory === "dog" ? sample(dogNames) : sample(catNames);
    const breed = petCategory === "dog" ? sample(dogBreeds) : sample(catBreeds);
    const location = sample(cities);
    const listingType = sample(listingTypes);
    const ageInMonths = randomBetween(2, petCategory === "dog" ? 36 : 48);
    const gender = sample(genders);
    const priceInr =
      listingType === "adoption"
        ? randomBetween(0, 1500)
        : petCategory === "dog"
          ? randomBetween(7000, 75000)
          : randomBetween(6000, 55000);
    const seller = sample(sellerDocs);
    const isVerifiedSeller = seller?.role === "verifiedSeller" || seller?.role === "admin";
    const isPhoneVerified = Boolean(seller?.isPhoneVerified);
    const images = petCategory === "dog" ? dogImages : catImages;

    const title = `Seed - ${name} ${breed} for ${
      listingType === "sale" ? "Sale" : listingType === "rehome" ? "Rehome" : "Adoption"
    }`;

    const description = `Seed listing for ${name}, a ${ageInMonths}-month ${gender} ${breed} in ${
      location.city
    }. ${sample(temperament)}. Ready for a loving home.`;

    return {
      sellerId: seller?._id || new mongoose.Types.ObjectId(),
      listingType,
      petCategory,
      title,
      breed,
      description,
      ageInMonths,
      gender,
      priceInr,
      city: location.city,
      state: location.state,
      images: images.slice(0, 2),
      video: null,
      isVerifiedSeller,
      isPhoneVerified,
      status: "approved",
      isActive: true,
      viewsCount: randomBetween(10, 140),
    };
  }

  await Listing.deleteMany({ title: /^Seed - / });

  for (let i = 0; i < seedDogCount; i += 1) {
    listings.push(createListing("dog"));
  }

  for (let i = 0; i < seedCatCount; i += 1) {
    listings.push(createListing("cat"));
  }

  const inserted = await Listing.insertMany(listings);

  console.log(`Seeded ${inserted.length} listings.`);

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
