import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { InterestRequestModel } from "@/server/models/interest-request";

const updateRequestSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid request id." }, { status: 400 });
    }

    const json = await request.json();
    const parsed = updateRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid payload.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const interestRequest = await InterestRequestModel.findById(id);

    if (!interestRequest) {
      return NextResponse.json({ message: "Request not found." }, { status: 404 });
    }

    // Only the seller can approve or reject the request
    if (String(interestRequest.sellerId) !== session.user.id) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    interestRequest.status = parsed.data.status;
    await interestRequest.save();

    return NextResponse.json({ interestRequest }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/requests/[id] error:", error);
    return NextResponse.json({ message: "Unable to update request." }, { status: 500 });
  }
}
