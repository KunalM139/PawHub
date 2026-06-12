import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { FavoriteModel } from "@/server/models/favorite";
import { ListingModel } from "@/server/models/listing";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const favorites = await FavoriteModel.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ favorites }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to fetch favorites.",
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

    const json = (await request.json()) as { listingId?: string };

    if (!json.listingId || !Types.ObjectId.isValid(json.listingId)) {
      return NextResponse.json({ message: "Invalid listing id." }, { status: 400 });
    }

    await connectToDatabase();

    const listing = await ListingModel.findOne({
      _id: json.listingId,
      isActive: true,
      status: "approved",
    })
      .select("_id")
      .lean();

    if (!listing) {
      return NextResponse.json({ message: "Listing not found." }, { status: 404 });
    }

    await FavoriteModel.updateOne(
      {
        userId: session.user.id,
        listingId: json.listingId,
      },
      {
        $setOnInsert: {
          userId: session.user.id,
          listingId: json.listingId,
        },
      },
      {
        upsert: true,
      },
    );

    return NextResponse.json({ favorited: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to save favorite.",
      },
      { status: 500 },
    );
  }
}
