import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { FavoriteModel } from "@/server/models/favorite";

type Params = {
  params: Promise<{ listingId: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { listingId } = await params;

    if (!Types.ObjectId.isValid(listingId)) {
      return NextResponse.json({ message: "Invalid listing id." }, { status: 400 });
    }

    await connectToDatabase();

    await FavoriteModel.deleteOne({
      userId: session.user.id,
      listingId,
    });

    return NextResponse.json({ favorited: false }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to remove favorite.",
      },
      { status: 500 },
    );
  }
}
