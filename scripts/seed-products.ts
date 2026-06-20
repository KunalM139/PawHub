import { connectToDatabase } from "../src/server/db/connect";
import { UserModel } from "../src/server/models/user";
import { ProductModel } from "../src/server/models/product";
import mongoose from "mongoose";

const dummyProducts = [
  {
    category: "food",
    title: "Premium Adult Dog Food - Chicken & Rice (10kg)",
    description: "High-protein, grain-free kibble designed for active adult dogs. Enriched with Omega-3 and Omega-6 fatty acids for a shiny coat.",
    priceInr: 3500,
    stockQuantity: 24,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/dog.jpg"]
  },
  {
    category: "food",
    title: "Kitten Ocean Fish Dry Food (3kg)",
    description: "Formulated specifically for growing kittens with real ocean fish, DHA for brain development, and essential vitamins.",
    priceInr: 1200,
    stockQuantity: 40,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/kitten.jpg"]
  },
  {
    category: "accessories",
    title: "Leather Padded Dog Collar - Premium Brown",
    description: "Handcrafted genuine leather collar with soft interior padding for maximum comfort and durability during long walks.",
    priceInr: 1499,
    stockQuantity: 15,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/fat_cat.jpg"]
  },
  {
    category: "toys",
    title: "Interactive Smart Laser Toy for Cats",
    description: "Keep your indoor cat entertained for hours with this 360-degree rotating laser. Features multiple speed settings.",
    priceInr: 2199,
    stockQuantity: 10,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/cat.jpg"]
  },
  {
    category: "grooming",
    title: "Professional Pet Deshedding Brush & Comb",
    description: "Reduces shedding by up to 90%. Stainless steel edge reaches through topcoat to safely remove loose undercoat hair.",
    priceInr: 650,
    stockQuantity: 30,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/dog.jpg"]
  },
  {
    category: "accessories",
    title: "Orthopedic Memory Foam Pet Bed (Large)",
    description: "Provides maximum comfort for senior pets or those with joint pain. Removable, machine-washable plush cover.",
    priceInr: 4200,
    stockQuantity: 8,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/cld-sample.jpg"]
  },
  {
    category: "toys",
    title: "Indestructible Rubber Chew Bone",
    description: "Made from natural non-toxic rubber. Perfect for aggressive chewers and helps clean teeth and massage gums.",
    priceInr: 550,
    stockQuantity: 50,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/dog.jpg"]
  },
  {
    category: "grooming",
    title: "Oatmeal & Aloe Dog Shampoo (500ml)",
    description: "Hypoallergenic shampoo that soothes dry, itchy skin. Leaves your dog smelling fresh like vanilla and almond.",
    priceInr: 450,
    stockQuantity: 60,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/cat.jpg"]
  },
  {
    category: "food",
    title: "Grain-Free Salmon Dog Treats (200g)",
    description: "Delicious bite-sized treats made with real salmon. Perfect for training and rewarding good behavior.",
    priceInr: 399,
    stockQuantity: 120,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/dog.jpg"]
  },
  {
    category: "accessories",
    title: "Stainless Steel Anti-Slip Pet Bowl (Set of 2)",
    description: "Rust-proof, durable feeding bowls with rubber bases to prevent slipping and spilling.",
    priceInr: 600,
    stockQuantity: 45,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/kitten.jpg"]
  },
  {
    category: "accessories",
    title: "Automated Pet Water Fountain (2.5L)",
    description: "Provides continuous flowing, filtered water to encourage pets to drink more. Ultra-quiet pump mechanism.",
    priceInr: 2800,
    stockQuantity: 12,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/cat.jpg"]
  },
  {
    category: "grooming",
    title: "Pet Nail Clippers with Safety Guard",
    description: "Professional grade stainless steel clippers with a safety stop to prevent over-cutting nails.",
    priceInr: 499,
    stockQuantity: 55,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/dog.jpg"]
  },
  {
    category: "other",
    title: "Pet Training Pads - Ultra Absorbent (50 Pack)",
    description: "Leak-proof puppy training pads with quick-dry technology and advanced odor control.",
    priceInr: 899,
    stockQuantity: 35,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/kitten.jpg"]
  },
  {
    category: "food",
    title: "Dental Chews for Medium Dogs (14 Pieces)",
    description: "Clinically proven to reduce plaque and tartar buildup. Freshens breath and cleans down to the gumline.",
    priceInr: 750,
    stockQuantity: 65,
    images: ["https://res.cloudinary.com/demo/image/upload/v1684342084/dog.jpg"]
  }
];

async function seedProducts() {
  try {
    await connectToDatabase();

    let seller = await UserModel.findOne({ role: "verifiedSeller" }).lean();

    if (!seller) {
      console.log("No verified seller found. Creating a dummy verified seller...");
      const dummyUser = await UserModel.create({
        name: "PawHub Verified Pet Shop",
        email: "shop@pawhub.in",
        userIntent: "seller",
        role: "verifiedSeller",
        isPhoneVerified: true,
        city: "Mumbai",
        state: "Maharashtra"
      });
      seller = dummyUser;
    }

    console.log(`Assigning products to seller: ${seller.email}`);

    // Clear old products
    await ProductModel.deleteMany({});
    console.log("Cleared existing products.");

    const productsToInsert = dummyProducts.map(p => ({
      ...p,
      sellerId: seller._id,
      isVerifiedSeller: true,
      isActive: true
    }));

    const result = await ProductModel.insertMany(productsToInsert);
    
    console.log(`Successfully seeded ${result.length} products!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding products:", err);
    process.exit(1);
  }
}

seedProducts();
