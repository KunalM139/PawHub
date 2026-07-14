import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { MessageModel } from "@/server/models/message";
import { logger } from "@/lib/logger";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");
    const customerId = searchParams.get("customerId");

    if (!listingId || !customerId || !Types.ObjectId.isValid(listingId) || !Types.ObjectId.isValid(customerId)) {
      return NextResponse.json({ message: "Invalid parameters." }, { status: 400 });
    }

    await connectToDatabase();

    // Since the seller could be either the sender or receiver in the conversation,
    // we need to mark deletedByReceiver if they are the receiver, and deletedBySender if they are the sender.

    // 1. Where seller is receiver (customer is sender)
    await MessageModel.updateMany(
      {
        listingId,
        senderId: customerId,
        receiverId: session.user.id
      },
      {
        $set: { deletedByReceiver: true }
      }
    );

    // 2. Where seller is sender (customer is receiver)
    await MessageModel.updateMany(
      {
        listingId,
        senderId: session.user.id,
        receiverId: customerId
      },
      {
        $set: { deletedBySender: true }
      }
    );

    return NextResponse.json({ message: "Conversation deleted" }, { status: 200 });
  } catch (error) {
    logger.error("Failed to delete conversation:", error);
    return NextResponse.json({ message: "Unable to delete conversation." }, { status: 500 });
  }
}
