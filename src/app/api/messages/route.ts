import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import { MessageModel } from "@/server/models/message";

const sendMessageSchema = z.object({
  listingId: z.string().min(1),
  receiverId: z.string().min(1),
  body: z.string().trim().min(1).max(2000),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    const query: Record<string, unknown> = {
      $or: [{ senderId: session.user.id }, { receiverId: session.user.id }],
    };

    if (listingId && Types.ObjectId.isValid(listingId)) {
      query.listingId = listingId;
    }

    const messages = await MessageModel.find(query)
      .sort({ createdAt: -1 })
      .limit(80)
      .populate("senderId", "name")
      .populate("receiverId", "name")
      .populate("listingId", "title")
      .lean();

    return NextResponse.json({ messages }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to fetch messages." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const json = await request.json();
    const parsed = sendMessageSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid message payload.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    if (!Types.ObjectId.isValid(parsed.data.listingId) || !Types.ObjectId.isValid(parsed.data.receiverId)) {
      return NextResponse.json({ message: "Invalid listing or receiver id." }, { status: 400 });
    }

    if (parsed.data.receiverId === session.user.id) {
      return NextResponse.json({ message: "Cannot send a message to yourself." }, { status: 400 });
    }

    await connectToDatabase();

    const listing = await ListingModel.findOne({
      _id: parsed.data.listingId,
      isActive: true,
      status: "approved",
    })
      .select("_id")
      .lean();

    if (!listing) {
      return NextResponse.json({ message: "Listing not found." }, { status: 404 });
    }

    const message = await MessageModel.create({
      listingId: parsed.data.listingId,
      senderId: session.user.id,
      receiverId: parsed.data.receiverId,
      body: parsed.data.body,
      status: "sent",
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to send message." }, { status: 500 });
  }
}
