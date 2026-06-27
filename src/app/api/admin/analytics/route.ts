import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { UserModel } from "@/server/models/user";
import { ListingModel } from "@/server/models/listing";
import { OrderModel } from "@/server/models/order";

export async function GET(request: NextRequest) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) return adminGuard.response;

  try {
    // Analytics: Last 30 days growth
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [usersByDay, listingsByDay, revenueByDay] = await Promise.all([
      UserModel.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      ListingModel.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      OrderModel.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: "paid" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return NextResponse.json({
      analytics: {
        usersByDay,
        listingsByDay,
        revenueByDay,
      },
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Failed to fetch analytics." }, { status: 500 });
  }
}
