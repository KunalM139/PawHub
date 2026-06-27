import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { ListingModel } from "@/server/models/listing";
import { ReportModel } from "@/server/models/report";
import { VerificationRequestModel } from "@/server/models/verification-request";
import { AdminActivityModel } from "@/server/models/admin-activity";
import { logAdminActivity } from "@/lib/admin-activity";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectToDatabase();

  const user = await UserModel.findById(session.user.id).select("name role").lean();

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  // --- Login Logging Logic ---
  // Check if there's a recent login log within the last 30 minutes
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const recentLogin = await AdminActivityModel.findOne({
    adminId: session.user.id,
    action: "ADMIN_LOGIN",
    timestamp: { $gte: thirtyMinutesAgo },
  }).lean();

  if (!recentLogin) {
    // We don't have NextRequest here, but we can extract headers using Next.js headers()
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "";
    const userAgent = headersList.get("user-agent") || "";
    
    await AdminActivityModel.create({
      adminId: session.user.id,
      adminName: user.name || "Admin",
      action: "ADMIN_LOGIN",
      notes: "Admin accessed the dashboard",
      ipAddress,
      userAgent,
    });
  }
  // ---------------------------

  const [totalUsers, totalListings, pendingVerifications, openReports] = await Promise.all([
    UserModel.countDocuments(),
    ListingModel.countDocuments(),
    VerificationRequestModel.countDocuments({ status: "pending" }),
    ReportModel.countDocuments({ status: { $in: ["open", "in_review"] } }),
  ]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--color-on-surface)]">
            Admin Dashboard
          </h1>
          <p className="text-[var(--color-on-surface-variant)] mt-1">
            Manage users, seller verification requests, reports, and the overall PawHub marketplace.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl card-shadow border border-[var(--color-outline-variant)]/30">
           <h3 className="text-[var(--color-on-surface-variant)] font-semibold text-sm">Total Users</h3>
           <p className="text-3xl font-black mt-2 text-[var(--color-on-surface)]">{totalUsers}</p>
        </div>
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl card-shadow border border-[var(--color-outline-variant)]/30">
           <h3 className="text-[var(--color-on-surface-variant)] font-semibold text-sm">Active Listings</h3>
           <p className="text-3xl font-black mt-2 text-[var(--color-on-surface)]">{totalListings}</p>
        </div>
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl card-shadow border border-[var(--color-outline-variant)]/30">
           <h3 className="text-[var(--color-on-surface-variant)] font-semibold text-sm">Pending Verifications</h3>
           <p className="text-3xl font-black mt-2 text-amber-600">{pendingVerifications}</p>
        </div>
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl card-shadow border border-[var(--color-outline-variant)]/30">
           <h3 className="text-[var(--color-on-surface-variant)] font-semibold text-sm">Open Reports</h3>
           <p className="text-3xl font-black mt-2 text-red-600">{openReports}</p>
        </div>
      </div>
    </div>
  );
}
