import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { UserModel } from "@/server/models/user";
import { VerificationRequestModel } from "@/server/models/verification-request";

const reviewVerificationSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().trim().max(300).optional().nullable(),
});

export async function GET() {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const requests = await VerificationRequestModel.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("userId", "name email role")
      .lean();

    return NextResponse.json({ requests }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Unable to fetch verification requests." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const json = await request.json();
    const parsed = reviewVerificationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid payload.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const verificationRequest = await VerificationRequestModel.findById(parsed.data.requestId);
    if (!verificationRequest) {
      return NextResponse.json({ message: "Request not found." }, { status: 404 });
    }

    if (parsed.data.action === "approve") {
      verificationRequest.set({
        status: "approved",
        reviewedBy: adminGuard.adminId,
        reviewedAt: new Date(),
        rejectionReason: null,
      });

      await Promise.all([
        verificationRequest.save(),
        UserModel.findByIdAndUpdate(verificationRequest.userId, {
          $set: {
            role: "verifiedSeller",
          },
        }),
      ]);
    } else {
      verificationRequest.set({
        status: "rejected",
        reviewedBy: adminGuard.adminId,
        reviewedAt: new Date(),
        rejectionReason: parsed.data.rejectionReason ?? "Details could not be verified.",
      });

      await verificationRequest.save();
    }

    return NextResponse.json({ request: verificationRequest }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Unable to review verification request." },
      { status: 500 },
    );
  }
}
