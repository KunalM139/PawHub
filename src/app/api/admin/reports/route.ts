import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { ListingModel } from "@/server/models/listing";
import { ProductModel } from "@/server/models/product";
import { UserModel } from "@/server/models/user";
import { ReviewModel } from "@/server/models/review";
import { ReportModel } from "@/server/models/report";
import { ModerationLogModel } from "@/server/models/moderation-log";
import { NotificationModel } from "@/server/models/notification";
import { logger } from "@/lib/logger";

const updateReportSchema = z.object({
  reportId: z.string().min(1),
  status: z.enum(["open", "in_review", "resolved", "dismissed"]),
  resolutionNote: z.string().trim().max(500).optional().nullable(),
  violationConfirmed: z.boolean().optional(),
  actionToTake: z.enum(["none", "warn", "remove_content", "ban"]).optional(),
});

export async function GET() {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const reports = await ReportModel.find()
      .sort({ status: 1, createdAt: -1 })
      .limit(120)
      .populate("reporterId", "name email")
      .populate("reportedUserId", "name email accountStatus strikeCount")
      .lean();

    // Since entityType is polymorphic, we can't cleanly populate a single ref across different collections in one go without Mongoose discriminator magic. 
    // For the dashboard, we return the entityType/entityId and let the frontend link it or we can manually stitch it.
    // For simplicity, we just return the raw reports here.
    return NextResponse.json({ reports }, { status: 200 });
  } catch (err) {
    logger.error("GET reports failed:", err);
    return NextResponse.json({ message: "Unable to fetch reports." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const json = await request.json();
    const parsed = updateReportSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid payload.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const report = await ReportModel.findById(parsed.data.reportId);
    if (!report) {
      return NextResponse.json({ message: "Report not found." }, { status: 404 });
    }

    report.set({
      status: parsed.data.status,
      reviewedBy: adminGuard.adminId,
      reviewedAt: new Date(),
      resolutionNote: parsed.data.resolutionNote ?? null,
    });

    await report.save();

    // Trust & Safety: Strike System Logic
    if (parsed.data.status === "resolved" && parsed.data.violationConfirmed && report.reportedUserId) {
      const reportedUser = await UserModel.findById(report.reportedUserId);
      if (reportedUser) {
        let strikeDelta = 0;
        let moderationAction = "resolve_report";
        
        // 1. Execute Content Action & Determine Strikes
        if (parsed.data.actionToTake === "remove_content") {
          if (report.entityType === "listing") {
            await ListingModel.findByIdAndUpdate(report.entityId || report.listingId, { $set: { status: "archived", isActive: false } });
            strikeDelta = 1;
            moderationAction = "remove_listing";
          } else if (report.entityType === "product") {
            await ProductModel.findByIdAndUpdate(report.entityId, { $set: { isActive: false } });
            strikeDelta = 1;
            moderationAction = "remove_product";
          } else if (report.entityType === "review") {
            await ReviewModel.findByIdAndDelete(report.entityId);
            strikeDelta = 1;
            moderationAction = "remove_review";
          } else if (report.entityType === "message") {
            // Messages typically trigger higher strikes for harassment
            strikeDelta = 2;
          }
        } else if (parsed.data.actionToTake === "ban") {
          strikeDelta = 5; // Immediate ban
        } else if (parsed.data.actionToTake === "warn") {
          reportedUser.warningCount += 1;
          moderationAction = "warn";
        }

        // Add additional strikes based on severe reasons
        if (report.reason === "scam" || report.reason === "fraud" || report.reason === "harassment" || report.reason === "threat") {
          strikeDelta += 2;
        }

        reportedUser.strikeCount += strikeDelta;

        let statusNote = parsed.data.resolutionNote || "Violation of Terms of Service";

        // 2. Automated Punishment Rules
        if (reportedUser.strikeCount >= 5 && reportedUser.accountStatus !== "banned") {
          reportedUser.accountStatus = "banned";
          reportedUser.bannedAt = new Date();
          reportedUser.bannedReason = `Accumulated ${reportedUser.strikeCount} strikes. Latest reason: ${statusNote}`;
          moderationAction = "ban";
          
          await NotificationModel.create({
            userId: reportedUser._id,
            title: "Account Permanently Banned",
            message: "Your account has been permanently banned due to repeated severe violations of our Trust & Safety policies.",
            type: "system"
          });
        } else if (reportedUser.strikeCount >= 3 && reportedUser.accountStatus !== "suspended" && reportedUser.accountStatus !== "banned") {
          reportedUser.accountStatus = "suspended";
          const suspendDays = 7;
          const until = new Date();
          until.setDate(until.getDate() + suspendDays);
          reportedUser.suspendedUntil = until;
          reportedUser.suspensionReason = `Accumulated ${reportedUser.strikeCount} strikes.`;
          moderationAction = "suspend";

          await NotificationModel.create({
            userId: reportedUser._id,
            title: "Account Suspended",
            message: `Your account has been suspended for ${suspendDays} days due to accumulating ${reportedUser.strikeCount} strikes.`,
            type: "system"
          });
        } else if (parsed.data.actionToTake === "warn") {
           await NotificationModel.create({
            userId: reportedUser._id,
            title: "Official Warning",
            message: `Your content was flagged. Reason: ${statusNote}. Please adhere to our guidelines.`,
            type: "system"
          });
        } else if (strikeDelta > 0 && reportedUser.accountStatus === "active") {
           await NotificationModel.create({
            userId: reportedUser._id,
            title: "Community Guidelines Strike",
            message: `Your content was removed and you received a strike. Total strikes: ${reportedUser.strikeCount}. Continued violations will result in suspension.`,
            type: "system"
          });
        }

        await reportedUser.save();

        // 3. Audit Log
        await ModerationLogModel.create({
          adminId: adminGuard.adminId,
          targetUserId: reportedUser._id,
          actionType: moderationAction,
          entityType: report.entityType,
          entityId: report.entityId || report.listingId,
          reason: report.reason,
          notes: parsed.data.resolutionNote,
        });
      }
    } else if (parsed.data.status === "dismissed" && report.reportedUserId) {
       await ModerationLogModel.create({
          adminId: adminGuard.adminId,
          targetUserId: report.reportedUserId,
          actionType: "dismiss_report",
          entityType: report.entityType,
          entityId: report.entityId || report.listingId,
          notes: parsed.data.resolutionNote,
       });
    }

    return NextResponse.json({ report }, { status: 200 });
  } catch (err) {
    logger.error("PATCH report failed:", err);
    return NextResponse.json({ message: "Unable to update report." }, { status: 500 });
  }
}
