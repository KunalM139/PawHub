import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import { InterestRequestModel } from "@/server/models/interest-request";
import { NotificationModel } from "@/server/models/notification";
import { apiRateLimit } from "@/lib/ratelimit";

const createRequestSchema = z.object({
  listingId: z.string().min(1),
  message: z.string().trim().max(1000).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // "buyer" | "seller"

    const query: Record<string, unknown> = {};
    if (role === "buyer") {
      query.buyerId = session.user.id;
    } else if (role === "seller") {
      query.sellerId = session.user.id;
    } else {
      query.$or = [{ buyerId: session.user.id }, { sellerId: session.user.id }];
    }

    const requests = await InterestRequestModel.find(query)
      .sort({ createdAt: -1 })
      .populate("listingId", "title images listingType priceInr breed city")
      .populate("buyerId", "name image phone email")
      .lean();

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error("GET /api/requests error:", error);
    return NextResponse.json({ message: "Unable to fetch requests." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await apiRateLimit.limit(`request_${ip}`);
    if (!success) {
      return NextResponse.json({ message: "Too many requests. Try again later." }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const json = await request.json();
    const parsed = createRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid payload.", issues: parsed.error.flatten() },
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
    }).select("_id sellerId").lean();

    if (!listing) {
      return NextResponse.json({ message: "Listing not found." }, { status: 404 });
    }

    if (String(listing.sellerId) === session.user.id) {
      return NextResponse.json({ message: "Cannot request your own listing." }, { status: 400 });
    }

    // Upsert the request (in case they already sent one, maybe just return the existing one)
    const existingReq = await InterestRequestModel.findOne({
      listingId: parsed.data.listingId,
      buyerId: session.user.id,
    });

    if (existingReq) {
      return NextResponse.json({ message: "Request already exists." }, { status: 400 });
    }

    const interestRequest = await InterestRequestModel.create({
      listingId: parsed.data.listingId,
      buyerId: session.user.id,
      sellerId: listing.sellerId,
      message: parsed.data.message || "",
      status: "pending",
    });

    return NextResponse.json({ interestRequest }, { status: 201 });
  } catch (error) {
    console.error("POST /api/requests error:", error);
    return NextResponse.json({ message: "Unable to create request." }, { status: 500 });
  }
}
