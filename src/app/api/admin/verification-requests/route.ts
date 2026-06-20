import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { UserModel } from "@/server/models/user";
import { VerificationRequestModel } from "@/server/models/verification-request";
import { NotificationModel } from "@/server/models/notification";

const reviewVerificationSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().trim().max(300).optional().nullable(),
  adminNotes: z.string().trim().max(500).optional().nullable(),
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
        adminNotes: parsed.data.adminNotes ?? verificationRequest.adminNotes,
      });

      await Promise.all([
        verificationRequest.save(),
        (async () => {
          const updatedUser = await UserModel.findByIdAndUpdate(verificationRequest.userId, {
            $set: {
              role: "verifiedSeller",
            },
          });

          if (!updatedUser) {
            throw new Error("Failed to update user role");
          }

          await NotificationModel.create({
            userId: verificationRequest.userId,
            title: "Seller Verification Approved!",
            message: "Congratulations! Your account has been verified. You can now start selling on PawHub.",
            type: "verification",
            link: "/seller-dashboard"
          });
        })(),
      ]);
    } else {
      verificationRequest.set({
        status: "rejected",
        reviewedBy: adminGuard.adminId,
        reviewedAt: new Date(),
        rejectionReason: parsed.data.rejectionReason ?? "Details could not be verified.",
        adminNotes: parsed.data.adminNotes ?? verificationRequest.adminNotes,
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
