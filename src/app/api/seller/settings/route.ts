import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.userType !== "seller" && currentUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { storeName, storeDescription, upiId, upiQrCode, storePolicies } = body;

    await connectToDatabase();

    const updatedUser = await UserModel.findByIdAndUpdate(
      currentUser.id,
      {
        $set: {
          storeName,
          storeDescription,
          upiId,
          upiQrCode,
          storePolicies,
        },
      },
      { returnDocument: "after", runValidators: true }
    ).select("-password").lean();

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error: any) {
    logger.error("Seller Settings PATCH Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
