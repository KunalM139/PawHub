import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const user = await UserModel.findById(currentUser.id).select("savedAddresses").lean();
    
    return NextResponse.json({ addresses: user?.savedAddresses || [] });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching addresses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const addressData = await request.json();
    if (!addressData.city || !addressData.pincode) {
      return NextResponse.json({ message: "Incomplete address" }, { status: 400 });
    }

    if (!addressData.tag) addressData.tag = "Home";

    await connectToDatabase();
    
    const user = await UserModel.findByIdAndUpdate(
      currentUser.id,
      { $push: { savedAddresses: addressData } },
      { returnDocument: "after" }
    );

    return NextResponse.json({ addresses: user.savedAddresses });
  } catch (error) {
    return NextResponse.json({ message: "Error adding address" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("id");
    if (!addressId) return NextResponse.json({ message: "Address ID required" }, { status: 400 });

    await connectToDatabase();
    
    const user = await UserModel.findByIdAndUpdate(
      currentUser.id,
      { $pull: { savedAddresses: { _id: addressId } } },
      { returnDocument: "after" }
    );

    return NextResponse.json({ addresses: user.savedAddresses });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting address" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const addressData = await request.json();
    if (!addressData._id) return NextResponse.json({ message: "Address ID required" }, { status: 400 });

    await connectToDatabase();
    
    const user = await UserModel.findOneAndUpdate(
      { _id: currentUser.id, "savedAddresses._id": addressData._id },
      { $set: { "savedAddresses.$": addressData } },
      { returnDocument: "after" }
    );

    if (!user) return NextResponse.json({ message: "User or address not found" }, { status: 404 });

    return NextResponse.json({ addresses: user.savedAddresses });
  } catch (error) {
    return NextResponse.json({ message: "Error updating address" }, { status: 500 });
  }
}
