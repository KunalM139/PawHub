import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { AdminAnalyticsClient } from "@/components/admin/admin-analytics-client";

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectToDatabase();
  const currentUser = await UserModel.findById(session.user.id).select("role").lean();
  if (!currentUser || currentUser.role !== "admin") redirect("/dashboard");

  // Fetch analytics from API route since aggregation is complex, or do it directly here.
  // We already created the API route, let's just do it directly here to save an internal fetch hop.
  
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  // Hardcoded localhost for build compatibility without env vars, but better to just fetch directly from DB in Server Components
  
  // Re-implementing the DB query here to avoid absolute URL fetch issues in Next.js build
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [usersByDay, listingsByDay, revenueByDay] = await Promise.all([
    UserModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    // We dynamically import ListingModel and OrderModel to prevent circular dependencies if they exist
    (await import("@/server/models/listing")).ListingModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    (await import("@/server/models/order")).OrderModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: "paid" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, totalRevenue: { $sum: "$totalAmount" } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const analytics = {
    usersByDay: JSON.parse(JSON.stringify(usersByDay)),
    listingsByDay: JSON.parse(JSON.stringify(listingsByDay)),
    revenueByDay: JSON.parse(JSON.stringify(revenueByDay)),
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-on-surface)]">
          Analytics & Growth
        </h1>
        <p className="text-[var(--color-on-surface-variant)] mt-1">
          Monitor marketplace growth, user acquisition, and sales trends.
        </p>
      </div>
      <AdminAnalyticsClient analytics={analytics} />
    </div>
  );
}
