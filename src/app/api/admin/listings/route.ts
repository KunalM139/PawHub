import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { ListingModel } from "@/server/models/listing";
import { logAdminActivity } from "@/lib/admin-activity";
import { UserModel } from "@/server/models/user";
import { ReportModel } from "@/server/models/report";

const updateListingSchema = z.object({
  listingIds: z.array(z.string().min(1)),
  status: z.enum(["pending", "approved", "rejected", "archived", "deleted"]),
  rejectionReason: z.string().trim().max(300).optional().nullable(),
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
      query.title = { $regex: search, $options: "i" };
    }

    const [totalCount, listingsRaw] = await Promise.all([
      ListingModel.countDocuments(query),
      ListingModel.find(query)
        .sort({ isPhoneVerified: -1, isVerifiedSeller: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const listingIds = listingsRaw.map(l => l._id.toString());
    
    // Fetch report counts for these listings
    const reportCounts = await ReportModel.aggregate([
      { $match: { entityType: "listing", entityId: { $in: listingIds }, status: { $ne: "resolved" } } },
      { $group: { _id: "$entityId", count: { $sum: 1 } } }
    ]);

    const reportCountMap = new Map<string, number>();
    reportCounts.forEach(r => reportCountMap.set(r._id.toString(), r.count));

    const listings = listingsRaw.map((listing: any) => ({
      ...listing,
      reportsCount: reportCountMap.get(listing._id.toString()) || 0
    }));

    return NextResponse.json({ listings, totalCount, page, limit }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Unable to fetch listings." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const json = await request.json();
    
    // Handle backwards compatibility for single listingId
    if (json.listingId && !json.listingIds) {
      json.listingIds = [json.listingId];
    }
    
    const parsed = updateListingSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid payload.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const adminUser = await UserModel.findById(adminGuard.adminId).select("name").lean();
    const adminName = adminUser?.name || "Admin";

    const updatePayload = {
      status: parsed.data.status,
      rejectionReason: parsed.data.status === "rejected" ? parsed.data.rejectionReason ?? null : null,
      isActive: parsed.data.status === "approved" || parsed.data.status === "pending",
    };

    await ListingModel.updateMany(
      { _id: { $in: parsed.data.listingIds } },
      { $set: updatePayload }
    );

    // Log activity for each updated listing
    const activities = parsed.data.listingIds.map(id => ({
      adminId: adminGuard.adminId,
      adminName,
      action: "LISTING_" + parsed.data.status.toUpperCase(),
      targetType: "Listing",
      targetId: id,
      notes: parsed.data.status === "rejected" ? (parsed.data.rejectionReason ?? undefined) : `Listing marked as ${parsed.data.status}`,
      timestamp: new Date(),
    }));

    const { AdminActivityModel } = await import("@/server/models/admin-activity");
    await AdminActivityModel.insertMany(activities);

    return NextResponse.json({ message: "Listings updated successfully." }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Unable to update listings." }, { status: 500 });
  }
}
