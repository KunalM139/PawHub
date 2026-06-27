import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { UserModel } from "@/server/models/user";
import { VerificationRequestModel } from "@/server/models/verification-request";
import { NotificationModel } from "@/server/models/notification";
import { logAdminActivity } from "@/lib/admin-activity";

const reviewVerificationSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(["approve", "reject", "more_info_required"]),
  rejectionReason: z.string().trim().max(300).optional().nullable(),
  adminNotes: z.string().trim().max(500).optional().nullable(),
});

export async function GET(request: NextRequest) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.storeName = { $regex: search, $options: "i" };
    }

    const [totalCount, requests] = await Promise.all([
      VerificationRequestModel.countDocuments(query),
      VerificationRequestModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "name email role verificationStatus")
        .lean(),
    ]);

    return NextResponse.json({ requests, totalCount, page, limit }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Unable to fetch verification requests." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const actionMap = {
      approve: "approved",
      reject: "rejected",
      more_info_required: "more_info_required",
    } as const;

    const newStatus = actionMap[parsed.data.action];

    verificationRequest.set({
      status: newStatus,
      reviewedBy: adminGuard.adminId,
      reviewedAt: new Date(),
      rejectionReason: parsed.data.action !== "approve" ? (parsed.data.rejectionReason ?? "Details could not be verified.") : null,
      adminNotes: parsed.data.adminNotes ?? verificationRequest.adminNotes,
    });

    // Add to history
    verificationRequest.history.push({
      action: parsed.data.action === "more_info_required" ? "requested_more_info" : (parsed.data.action === "approve" ? "approved" : "rejected"),
      timestamp: new Date(),
      adminId: adminGuard.adminId,
      notes: parsed.data.adminNotes ?? null,
    });

    await verificationRequest.save();

    // Update UserModel
    const userUpdatePayload: any = {
      verificationStatus: newStatus,
      verificationAdminNotes: parsed.data.adminNotes ?? null,
    };

    if (parsed.data.action === "approve") {
      userUpdatePayload.role = "verifiedSeller";
      userUpdatePayload.verifiedAt = new Date();
      userUpdatePayload.verifiedBy = adminGuard.adminId;
      userUpdatePayload.verificationRejectionReason = null;
      userUpdatePayload.storeName = verificationRequest.storeName;
    } else {
      userUpdatePayload.verificationRejectionReason = parsed.data.rejectionReason ?? "Details could not be verified.";
    }

    await UserModel.findByIdAndUpdate(verificationRequest.userId, { $set: userUpdatePayload });

    // Send Notification
    let notificationTitle = "";
    let notificationMessage = "";

    if (parsed.data.action === "approve") {
      notificationTitle = "Seller Verification Approved!";
      notificationMessage = "Congratulations! Your account has been verified. You can now start selling on PawHub.";
    } else if (parsed.data.action === "more_info_required") {
      notificationTitle = "Verification Needs More Info";
      notificationMessage = `Please review and update your application. Reason: ${parsed.data.rejectionReason}`;
    } else {
      notificationTitle = "Verification Rejected";
      notificationMessage = `Your verification was rejected. Reason: ${parsed.data.rejectionReason}`;
    }

    const notification = await NotificationModel.create({
      userId: verificationRequest.userId,
      title: notificationTitle,
      message: notificationMessage,
      type: "verification",
      link: "/seller-dashboard/verification",
    });

    const io = (globalThis as any).io;
    if (io) {
      io.to(verificationRequest.userId.toString()).emit("notification", notification);
    }

    const adminUser = await UserModel.findById(adminGuard.adminId).select("name").lean();
    await logAdminActivity({
      adminId: adminGuard.adminId,
      adminName: adminUser?.name || "Admin",
      action: "VERIFICATION_" + parsed.data.action.toUpperCase(),
      targetId: verificationRequest._id.toString(),
      targetType: "VerificationRequest",
      notes: parsed.data.adminNotes || parsed.data.rejectionReason || "Verification reviewed",
      req: request,
    });

    return NextResponse.json({ request: verificationRequest }, { status: 200 });
  } catch (error) {
    console.error("Verification update error:", error);
    return NextResponse.json(
      { message: "Unable to review verification request." },
      { status: 500 },
    );
  }
}
