import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { listingInputSchema } from "@/lib/validators/listing";
import { connectToDatabase } from "@/server/db/connect";
import { buildPublicListingQuery, buildPublicListingSort, parseBrowseFilters } from "@/server/listings/browse-query";
import { ListingModel } from "@/server/models/listing";
import { UserModel } from "@/server/models/user";
import { notifyAdmins } from "@/lib/notify-admins";
import { searchListingsRateLimit, listingCreateRateLimit, getIp, checkRateLimit } from "@/lib/ratelimit";

export async function GET(request: Request) {
  try {
    const ip = getIp(request);
    const rateLimitError = await checkRateLimit(searchListingsRateLimit, `search_listings_${ip}`);
    if (rateLimitError) return rateLimitError;

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "true";

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    if (!mine) {
      const filters = parseBrowseFilters(searchParams);
      const query = buildPublicListingQuery(filters);
      const sort = buildPublicListingSort(filters);

      const total = await ListingModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      const listings = await ListingModel.find(query).sort(sort).skip(skip).limit(limit).lean();

      return NextResponse.json({ 
        listings, 
        pagination: { total, page, limit, totalPages } 
      }, { status: 200 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const total = await ListingModel.countDocuments({ sellerId: session.user.id });
    const totalPages = Math.ceil(total / limit);

    const listings = await ListingModel.find({ sellerId: session.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({ 
      listings, 
      pagination: { total, page, limit, totalPages } 
    }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to fetch listings.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const rateLimitError = await checkRateLimit(listingCreateRateLimit, session.user.id, session.user.role === "admin");
    if (rateLimitError) return rateLimitError;

    const json = await request.json();
    const parsed = listingInputSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid listing input.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const currentUser = await UserModel.findById(session.user.id)
      .select("role isPhoneVerified")
      .lean();

    if (!currentUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (!currentUser.isPhoneVerified) {
      return NextResponse.json(
        { message: "Phone verification is required to post listings." },
        { status: 403 },
      );
    }

    const listing = await ListingModel.create({
      ...parsed.data,
      video: parsed.data.video ?? null,
      sellerId: session.user.id,
      isVerifiedSeller: currentUser.role === "verifiedSeller" || currentUser.role === "admin",
      isPhoneVerified: currentUser.isPhoneVerified,
      status: (currentUser.role === "verifiedSeller" || currentUser.role === "admin") ? "approved" : "pending",
      isActive: true,
    });

    await notifyAdmins(
      "New Pet Listing",
      `${session.user.name || "A user"} created a new listing: ${parsed.data.title}`,
      "/admin/listings"
    );

    return NextResponse.json({ listing }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to create listing.",
      },
      { status: 500 },
    );
  }
}
