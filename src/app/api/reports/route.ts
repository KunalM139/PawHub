import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import { ProductModel } from "@/server/models/product";
import { UserModel } from "@/server/models/user";
import { MessageModel } from "@/server/models/message";
import { ReviewModel } from "@/server/models/review";
import { ReportModel } from "@/server/models/report";
import { authRateLimit } from "@/lib/ratelimit";

const reportPayloadSchema = z.object({
  listingId: z.string().min(1).optional(), // Legacy support
  entityType: z.enum(["listing", "product", "user", "message", "review"]).optional(),
  entityId: z.string().min(1).optional(),
  reason: z.enum([
    "spam", "fake_listing", "scam", "abuse", "animal_welfare", 
    "wrong_information", "duplicate", "fake_product", "counterfeit",
    "fraud", "fake_identity", "harassment", "threat", "inappropriate_content",
    "fake_review", "abusive_language", "misleading_information", "other"
  ]),
  details: z.string().trim().max(1000).optional().nullable(),
}).refine(data => {
  return data.listingId || (data.entityType && data.entityId);
}, {
  message: "Must provide either listingId or both entityType and entityId",
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const { success } = await authRateLimit.limit(`reports_${session.user.id}_${ip}`);
    if (!success) {
      return NextResponse.json({ message: "Too many reports. Please try again later." }, { status: 429 });
    }

    const json = await request.json();
    const parsed = reportPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid report payload.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    let entityType = parsed.data.entityType || "listing";
    let entityId = parsed.data.entityId || parsed.data.listingId;

    if (!Types.ObjectId.isValid(entityId as string)) {
      return NextResponse.json({ message: "Invalid entity id." }, { status: 400 });
    }

    await connectToDatabase();

    let reportedUserId: Types.ObjectId | string | null = null;

    if (entityType === "listing") {
      const listing = await ListingModel.findById(entityId).select("sellerId").lean();
      if (!listing) return NextResponse.json({ message: "Listing not found." }, { status: 404 });
      reportedUserId = listing.sellerId;
    } else if (entityType === "product") {
      const product = await ProductModel.findById(entityId).select("sellerId").lean();
      if (!product) return NextResponse.json({ message: "Product not found." }, { status: 404 });
      reportedUserId = product.sellerId;
    } else if (entityType === "user") {
      const user = await UserModel.findById(entityId).select("_id").lean();
      if (!user) return NextResponse.json({ message: "User not found." }, { status: 404 });
      reportedUserId = user._id;
    } else if (entityType === "message") {
      const message = await MessageModel.findById(entityId).select("senderId").lean();
      if (!message) return NextResponse.json({ message: "Message not found." }, { status: 404 });
      reportedUserId = message.senderId;
    } else if (entityType === "review") {
      const review = await ReviewModel.findById(entityId).select("reviewerId").lean();
      if (!review) return NextResponse.json({ message: "Review not found." }, { status: 404 });
      reportedUserId = review.reviewerId;
    }

    if (String(reportedUserId) === session.user.id) {
      return NextResponse.json({ message: "You cannot report yourself or your own content." }, { status: 400 });
    }

    const report = await ReportModel.create({
      reporterId: session.user.id,
      entityType,
      entityId,
      listingId: entityType === "listing" ? entityId : undefined, // For database legacy UI compatibility
      reportedUserId,
      reason: parsed.data.reason,
      details: parsed.data.details ?? null,
      status: "open",
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && Number(error.code) === 11000) {
      return NextResponse.json({ message: "You already have an open report for this content." }, { status: 409 });
    }
    return NextResponse.json({ message: "Unable to submit report." }, { status: 500 });
  }
}
