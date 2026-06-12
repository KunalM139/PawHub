import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import { ReportModel } from "@/server/models/report";

const reportPayloadSchema = z.object({
  listingId: z.string().min(1),
  reason: z.enum(["spam", "fake_listing", "scam", "abuse", "animal_welfare", "other"]),
  details: z.string().trim().max(1000).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const json = await request.json();
    const parsed = reportPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid report payload.",
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
          message: "You cannot report your own listing.",
        },
        { status: 400 },
      );
    }

    const report = await ReportModel.create({
      reporterId: session.user.id,
      listingId: parsed.data.listingId,
      reportedUserId: listing.sellerId,
      reason: parsed.data.reason,
      details: parsed.data.details ?? null,
      status: "open",
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      Number(error.code) === 11000
    ) {
      return NextResponse.json(
        {
          message: "You already have an open report for this listing.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ message: "Unable to submit report." }, { status: 500 });
  }
}
