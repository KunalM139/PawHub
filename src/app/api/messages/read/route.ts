import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { MessageModel } from "@/server/models/message";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const json = await request.json();
    const { listingId, senderId } = json;

    if (!listingId || !senderId || !Types.ObjectId.isValid(listingId) || !Types.ObjectId.isValid(senderId)) {
      return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
    }

    await connectToDatabase();

    // Mark all messages in this conversation (where current user is receiver) as read
    await MessageModel.updateMany(
      {
        listingId,
        senderId,
        receiverId: session.user.id,
        status: { $ne: "read" }
      },
      {
        $set: { status: "read", readAt: new Date() }
      }
    );

    const io = (globalThis as any).io;
    if (io) {
      // Notify the sender that their messages were read
      io.to(senderId).emit("messages-read", {
        listingId,
        receiverId: session.user.id // The user who just read them
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Failed to mark messages as read:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
