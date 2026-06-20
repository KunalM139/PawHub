import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { NotificationModel } from "@/server/models/notification";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const query = { userId: currentUser.id };
    
    const total = await NotificationModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({ 
      notifications,
      pagination: { total, page, limit, totalPages }
    });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching notifications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    // Mark all as read
    await NotificationModel.updateMany(
      { userId: currentUser.id, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ message: "Marked as read" });
  } catch (error) {
    return NextResponse.json({ message: "Error updating notifications" }, { status: 500 });
  }
}
