import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { ProductModel } from "@/server/models/product";
import { getCurrentUser } from "@/lib/auth";
import { searchProductsRateLimit, productCreateRateLimit, getIp, checkRateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const ip = getIp(request);
    const rateLimitError = await checkRateLimit(searchProductsRateLimit, `search_products_${ip}`);
    if (rateLimitError) return rateLimitError;

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "true";
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");

    const currentUser = await getCurrentUser();

    let query: Record<string, any> = { isActive: true };

    if (mine) {
      if (!currentUser) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
      }
      query = { sellerId: currentUser.id };
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    let sortOption: any = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { priceInr: 1 };
    else if (sort === "price_desc") sortOption = { priceInr: -1 };
    else if (sort === "rating_desc") sortOption = { averageRating: -1 };

    const total = await ProductModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const products = await ProductModel.find(query)
      .populate("sellerId", "name email phone city image role isPhoneVerified")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({ 
      products, 
      pagination: { total, page, limit, totalPages } 
    }, { status: 200 });
  } catch (error) {
    logger.error("Products GET Error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const rateLimitError = await checkRateLimit(productCreateRateLimit, currentUser.id, currentUser.role === "admin");
    if (rateLimitError) return rateLimitError;

    await connectToDatabase();

    if (currentUser.role !== "verifiedSeller" && currentUser.role !== "admin") {
      return NextResponse.json({ message: "Only verified sellers can add products." }, { status: 403 });
    }

    const body = await request.json();

    // Basic validation
    if (!body.title || !body.description || !body.priceInr || !body.category) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const newProduct = await ProductModel.create({
      ...body,
      sellerId: currentUser.id,
      isVerifiedSeller: true,
      status: "approved",
    });

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error: any) {
    logger.error("Products POST Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create product." },
      { status: 500 }
    );
  }
}
