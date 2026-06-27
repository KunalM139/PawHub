import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { ListingModel } from "@/server/models/listing";
import { ProductModel } from "@/server/models/product";
import { UserModel } from "@/server/models/user";
import { ReviewModel } from "@/server/models/review";
import { ReportModel } from "@/server/models/report";
import { ModerationLogModel } from "@/server/models/moderation-log";
import { NotificationModel } from "@/server/models/notification";
import { logAdminActivity } from "@/lib/admin-activity";
import { logger } from "@/lib/logger";

const updateReportSchema = z.object({
  reportId: z.string().min(1),
  status: z.enum(["open", "in_review", "resolved", "dismissed"]),
  resolutionNote: z.string().trim().max(500).optional().nullable(),
  violationConfirmed: z.boolean().optional(),
  actionToTake: z.enum(["none", "warn", "remove_content", "ban"]).optional(),
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
    const type = searchParams.get("type") || "";

    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    const [totalCount, reports] = await Promise.all([
      ReportModel.countDocuments(query),
      ReportModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("reporterId", "name email")
        .populate("reportedUserId", "name email strikeCount accountStatus")
        .lean(),
    ]);

    return NextResponse.json({ reports, totalCount, page, limit }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to fetch reports." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const json = await request.json();
    const parsed = updateReportSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid payload.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const report = await ReportModel.findById(parsed.data.reportId);
    if (!report) {
      return NextResponse.json({ message: "Report not found." }, { status: 404 });
    }

    report.set({
      status: parsed.data.status,
      resolutionNote: parsed.data.resolutionNote ?? null,
      resolvedBy: adminGuard.adminId,
      resolvedAt: new Date(),
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
          
          const notification = await NotificationModel.create({
            userId: reportedUser._id,
            title: "Account Permanently Banned",
            message: "Your account has been permanently banned due to repeated severe violations of our Trust & Safety policies.",
            type: "system"
          });
          const io = (globalThis as any).io;
          if (io) io.to(reportedUser._id.toString()).emit("notification", notification);
        } else if (reportedUser.strikeCount >= 3 && reportedUser.accountStatus !== "suspended" && reportedUser.accountStatus !== "banned") {
          reportedUser.accountStatus = "suspended";
          const suspendDays = 7;
          const until = new Date();
          until.setDate(until.getDate() + suspendDays);
          reportedUser.suspendedUntil = until;
          reportedUser.suspensionReason = `Accumulated ${reportedUser.strikeCount} strikes.`;
          moderationAction = "suspend";

          const notification = await NotificationModel.create({
            userId: reportedUser._id,
            title: "Account Suspended",
            message: `Your account has been suspended for ${suspendDays} days due to accumulating ${reportedUser.strikeCount} strikes.`,
            type: "system"
          });
          const io = (globalThis as any).io;
          if (io) io.to(reportedUser._id.toString()).emit("notification", notification);
        } else if (parsed.data.actionToTake === "warn") {
           const notification = await NotificationModel.create({
            userId: reportedUser._id,
            title: "Official Warning",
            message: `Your content was flagged. Reason: ${statusNote}. Please adhere to our guidelines.`,
            type: "system"
          });
          const io = (globalThis as any).io;
          if (io) io.to(reportedUser._id.toString()).emit("notification", notification);
        } else if (strikeDelta > 0 && reportedUser.accountStatus === "active") {
           const notification = await NotificationModel.create({
            userId: reportedUser._id,
            title: "Community Guidelines Strike",
            message: `Your content was removed and you received a strike. Total strikes: ${reportedUser.strikeCount}. Continued violations will result in suspension.`,
            type: "system"
          });
          const io = (globalThis as any).io;
          if (io) io.to(reportedUser._id.toString()).emit("notification", notification);
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

    const adminUser = await UserModel.findById(adminGuard.adminId).select("name").lean();
    await logAdminActivity({
      adminId: adminGuard.adminId,
      adminName: adminUser?.name || "Admin",
      action: "REPORT_RESOLVED",
      targetId: report._id.toString(),
      targetType: "Report",
      notes: `Status: ${parsed.data.status}, Note: ${parsed.data.resolutionNote}`,
      req: request,
    });

    return NextResponse.json({ report }, { status: 200 });
  } catch (err) {
    logger.error("PATCH report failed:", err);
    return NextResponse.json({ message: "Unable to update report." }, { status: 500 });
  }
}

