import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { PlatformSettingsModel } from "@/server/models/platform-settings";
import { UserModel } from "@/server/models/user";
import { logAdminActivity } from "@/lib/admin-activity";

export async function GET() {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) return adminGuard.response;

  try {
    let settings = await PlatformSettingsModel.findOne().lean();
    if (!settings) {
      // Create defaults if they don't exist
      settings = await PlatformSettingsModel.create({});
    }
    return NextResponse.json({ settings }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Failed to fetch settings." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) return adminGuard.response;

  try {
    const json = await request.json();
    
    // In a real app we would use Zod here. 
    // We are directly updating for brevity.
    let settings = await PlatformSettingsModel.findOne();
    if (!settings) {
      settings = new PlatformSettingsModel();
    }

    // Merge updates safely
    if (typeof json.isMaintenanceMode === "boolean") settings.isMaintenanceMode = json.isMaintenanceMode;
    if (json.announcementBanner) settings.announcementBanner = { ...settings.announcementBanner, ...json.announcementBanner };
    if (Array.isArray(json.allowedPetCategories)) settings.allowedPetCategories = json.allowedPetCategories;
    if (Array.isArray(json.allowedProductCategories)) settings.allowedProductCategories = json.allowedProductCategories;
    if (Array.isArray(json.reportReasons)) settings.reportReasons = json.reportReasons;
    if (Array.isArray(json.verificationRequiredDocs)) settings.verificationRequiredDocs = json.verificationRequiredDocs;
    if (json.featureToggles) settings.featureToggles = { ...settings.featureToggles, ...json.featureToggles };

    await settings.save();

    const adminUser = await UserModel.findById(adminGuard.adminId).select("name").lean();
    await logAdminActivity({
      adminId: adminGuard.adminId,
      adminName: adminUser?.name || "Admin",
      action: "UPDATE_SETTINGS",
      targetType: "Platform Settings",
      notes: "Admin updated global platform settings",
      req: request,
    });

    return NextResponse.json({ settings }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Failed to update settings." }, { status: 500 });
  }
}
