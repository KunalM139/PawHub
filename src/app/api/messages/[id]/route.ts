import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { MessageModel } from "@/server/models/message";
import { logger } from "@/lib/logger";

const editMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid message id." }, { status: 400 });
    }

    const json = await request.json();
    const parsed = editMessageSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid message payload.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const message = await MessageModel.findOneAndUpdate(
      { _id: id, senderId: session.user.id },
      { 
        $set: { 
          body: parsed.data.body,
          isEdited: true
        } 
      },
      { new: true }
    ).lean();

    if (!message) {
      return NextResponse.json({ message: "Message not found or unauthorized." }, { status: 404 });
    }

    const io = (globalThis as any).io;
    if (io) {
      io.to(message.receiverId.toString()).emit("message-edited", message);
      io.to(message.senderId.toString()).emit("message-edited", message);
    }

    return NextResponse.json({ message: "Message edited", data: message }, { status: 200 });
  } catch (error) {
    logger.error("Failed to edit message:", error);
    return NextResponse.json({ message: "Unable to edit message." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid message id." }, { status: 400 });
    }

    await connectToDatabase();

    // Check if the message belongs to the user
    const message = await MessageModel.findOne({ _id: id, senderId: session.user.id }).lean();
    if (!message) {
      return NextResponse.json({ message: "Message not found or unauthorized." }, { status: 404 });
    }

    // Hard delete as requested
    await MessageModel.deleteOne({ _id: id });

    const io = (globalThis as any).io;
    if (io) {
      io.to(message.receiverId.toString()).emit("message-deleted", { messageId: id, listingId: message.listingId });
      io.to(message.senderId.toString()).emit("message-deleted", { messageId: id, listingId: message.listingId });
    }

    return NextResponse.json({ message: "Message deleted" }, { status: 200 });
  } catch (error) {
    logger.error("Failed to delete message:", error);
    return NextResponse.json({ message: "Unable to delete message." }, { status: 500 });
  }
}
