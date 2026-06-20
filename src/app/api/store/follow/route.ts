import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { sellerId } = await request.json();
    if (!sellerId) return NextResponse.json({ message: "Seller ID required" }, { status: 400 });

    await connectToDatabase();
    
    const user = await UserModel.findById(currentUser.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const isFollowing = user.followedStores?.includes(sellerId);
    
    if (isFollowing) {
      await UserModel.findByIdAndUpdate(currentUser.id, {
        $pull: { followedStores: sellerId }
      });
    } else {
      await UserModel.findByIdAndUpdate(currentUser.id, {
        $addToSet: { followedStores: sellerId }
      });
    }

    return NextResponse.json({ isFollowing: !isFollowing });
  } catch (error) {
    return NextResponse.json({ message: "Error following store" }, { status: 500 });
  }
}
