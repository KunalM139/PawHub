import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import { ReviewModel } from "@/server/models/review";
import { UserModel } from "@/server/models/user";
import { reviewRateLimit, checkRateLimit, apiRateLimit } from "@/lib/ratelimit";

const reviewPayloadSchema = z.object({
  listingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().nullable(),
  comment: z.string().trim().min(4).max(800),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    if (!listingId || !Types.ObjectId.isValid(listingId)) {
      return NextResponse.json({ message: "Invalid listing id." }, { status: 400 });
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const total = await ReviewModel.countDocuments({ listingId, isVisible: true });
    const totalPages = Math.ceil(total / limit);

    const reviews = await ReviewModel.find({ listingId, isVisible: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reviewerId", "name")
      .lean();

    return NextResponse.json({ 
      reviews,
      pagination: { total, page, limit, totalPages }
    }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to fetch reviews." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await apiRateLimit.limit(`review_${ip}`);
    if (!success) {
      return NextResponse.json({ message: "Too many reviews submitted. Try again later." }, { status: 429 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const rateLimitError = await checkRateLimit(reviewRateLimit, session.user.id, session.user.role === "admin");
    if (rateLimitError) return rateLimitError;

    const json = await request.json();
    const parsed = reviewPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid review payload.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    if (!Types.ObjectId.isValid(parsed.data.listingId)) {
      return NextResponse.json({ message: "Invalid listing id." }, { status: 400 });
    }

    await connectToDatabase();

    const listing = await ListingModel.findOne({
      _id: parsed.data.listingId,
      isActive: true,
      status: "approved",
    })
      .select("sellerId")
      .lean();

    if (!listing) {
      return NextResponse.json({ message: "Listing not found." }, { status: 404 });
    }

    if (String(listing.sellerId) === session.user.id) {
      return NextResponse.json(
        {
          message: "You cannot review your own listing.",
        },
        { status: 400 },
      );
    }

    const review = await ReviewModel.findOneAndUpdate(
      {
        listingId: parsed.data.listingId,
        reviewerId: session.user.id,
      },
      {
        $set: {
          sellerId: listing.sellerId,
          rating: parsed.data.rating,
          title: parsed.data.title ?? null,
          comment: parsed.data.comment,
          isVisible: true,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      },
    );

    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to submit review." }, { status: 500 });
  }
}
