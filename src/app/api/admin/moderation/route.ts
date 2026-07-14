import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { UserModel } from "@/server/models/user";
import { ModerationLogModel } from "@/server/models/moderation-log";
import { NotificationModel } from "@/server/models/notification";
import { logger } from "@/lib/logger";
import { logAdminActivity } from "@/lib/admin-activity";

const moderationActionSchema = z.object({
  targetUserId: z.string().min(1),
  actionType: z.enum([
    "add_strike", "remove_strike", "reset_strikes", 
    "suspend", "ban", "unban", "unsuspend", "warn"
  ]),
  reason: z.string().trim().max(1000).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const json = await request.json();
    const parsed = moderationActionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid payload.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(parsed.data.targetUserId);
    if (!user) {
      return NextResponse.json({ message: "Target user not found." }, { status: 404 });
    }

    const { actionType, reason } = parsed.data;

    let notifyTitle = "";
    let notifyMessage = "";

    if (actionType === "add_strike") {
      user.strikeCount += 1;
      notifyTitle = "Community Guidelines Strike";
      notifyMessage = `You have received a manual moderation strike. Reason: ${reason}. Total strikes: ${user.strikeCount}.`;
    } else if (actionType === "remove_strike") {
      user.strikeCount = Math.max(0, user.strikeCount - 1);
    } else if (actionType === "reset_strikes") {
      user.strikeCount = 0;
    } else if (actionType === "suspend") {
      user.accountStatus = "suspended";
      const until = new Date();
      until.setDate(until.getDate() + 7); // Default 7 days for manual
      user.suspendedUntil = until;
      user.suspensionReason = reason;
      notifyTitle = "Account Suspended";
      notifyMessage = `Your account has been suspended by a moderator. Reason: ${reason}`;
    } else if (actionType === "unsuspend") {
      if (user.accountStatus === "suspended") {
        user.accountStatus = "active";
        user.suspendedUntil = null;
        user.suspensionReason = null;
        notifyTitle = "Account Unsuspended";
        notifyMessage = "Your account has been unsuspended. You can now access your dashboard.";
      }
    } else if (actionType === "ban") {
      user.accountStatus = "banned";
      user.bannedAt = new Date();
      user.bannedReason = reason;
      notifyTitle = "Account Permanently Banned";
      notifyMessage = `Your account has been permanently banned. Reason: ${reason}`;
    } else if (actionType === "unban") {
      if (user.accountStatus === "banned") {
        user.accountStatus = "active";
        user.bannedAt = null;
        user.bannedReason = null;
        notifyTitle = "Account Unbanned";
        notifyMessage = "Your account has been unbanned. You can now access your dashboard.";
      }
    } else if (actionType === "warn") {
      user.warningCount += 1;
      notifyTitle = "Official Warning";
      notifyMessage = `You have received a warning from moderation. Reason: ${reason}. Please follow our community guidelines.`;
    }

    // Process auto-bans only when adding strikes
    if (actionType === "add_strike" && user.strikeCount >= 5 && user.accountStatus !== "banned") {
      user.accountStatus = "banned";
      user.bannedAt = new Date();
      user.bannedReason = "Accumulated 5 or more strikes.";
      notifyTitle = "Account Permanently Banned";
      notifyMessage = "Your account has been permanently banned due to accumulating maximum strikes.";
    }

    await user.save();

    // Log the moderation action
    await ModerationLogModel.create({
      adminId: adminGuard.adminId,
      targetUserId: user._id,
      actionType,
      reason,
      notes: "Manual action from dashboard",
    });

    const adminUser = await UserModel.findById(adminGuard.adminId).select("name").lean();
    await logAdminActivity({
      adminId: adminGuard.adminId,
      adminName: adminUser?.name || "Admin",
      action: actionType.toUpperCase(),
      targetId: user._id.toString(),
      targetType: "User",
      notes: reason || "Manual action from dashboard",
      req: request,
    });

    // Send notification if applicable
    if (notifyTitle) {
      const notification = await NotificationModel.create({
        userId: user._id,
        title: notifyTitle,
        message: notifyMessage,
        type: "system"
      });

      const io = (globalThis as any).io;
      if (io) {
        io.to(user._id.toString()).emit("notification", notification);
        io.to(user._id.toString()).emit("account-updated", { action: actionType });
      }
    } else {
      const io = (globalThis as any).io;
      if (io) {
        io.to(user._id.toString()).emit("account-updated", { action: actionType });
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: { 
        strikeCount: user.strikeCount, 
        accountStatus: user.accountStatus,
        warningCount: user.warningCount 
      } 
    }, { status: 200 });
  } catch (err) {
    logger.error("POST manual moderation failed:", err);
    return NextResponse.json({ message: "Unable to execute moderation action." }, { status: 500 });
  }
}
