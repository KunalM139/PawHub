import { NextRequest } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { AdminActivityModel } from "@/server/models/admin-activity";

type LogAdminActivityParams = {
  adminId: string;
  adminName: string;
  action: string;
  targetId?: string;
  targetType?: string;
  notes?: string;
  req?: NextRequest;
};

export async function logAdminActivity({
  adminId,
  adminName,
  action,
  targetId,
  targetType,
  notes,
  req,
}: LogAdminActivityParams) {
  try {
    await connectToDatabase();

    let ipAddress = "";
    let userAgent = "";

    if (req) {
      ipAddress =
        req.headers.get("x-forwarded-for")?.split(",")[0] ||
        req.headers.get("x-real-ip") ||
        "";
      userAgent = req.headers.get("user-agent") || "";
    }

    await AdminActivityModel.create({
      adminId,
      adminName,
      action,
      targetId,
      targetType,
      notes,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Failed to log admin activity:", error);
    // We intentionally don't throw here so that activity logging failures 
    // don't break the main business logic (e.g. banning a user still works).
  }
}
