import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { AdminPanelWorkspace } from "@/components/admin/admin-panel-workspace";
import { Container } from "@/components/ui/container";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import { ReportModel } from "@/server/models/report";
import { UserModel } from "@/server/models/user";
import { VerificationRequestModel } from "@/server/models/verification-request";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Moderate users, listings, verification requests, and reports in PawHub admin panel.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  await connectToDatabase();

  const currentUser = await UserModel.findById(session.user.id).select("role").lean();

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <section className="py-14">
        <Container>
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
            <h1 className="text-3xl font-black tracking-tight">Admin Panel</h1>
            <p className="mt-3 text-sm text-[var(--color-foreground-muted)]">
              Admin access is required to view this panel.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  const [totalUsers, totalListings, pendingListings, pendingVerification, openReports] =
    await Promise.all([
      UserModel.countDocuments(),
      ListingModel.countDocuments(),
      ListingModel.countDocuments({ status: "pending" }),
      VerificationRequestModel.countDocuments({ status: "pending" }),
      ReportModel.countDocuments({ status: { $in: ["open", "in_review"] } }),
    ]);

  const [users, listings, requests, reports] = await Promise.all([
    UserModel.find().sort({ createdAt: -1 }).limit(100).select("name email role").lean(),
    ListingModel.find().sort({ isPhoneVerified: -1, isVerifiedSeller: -1, createdAt: -1 }).limit(120).lean(),
    VerificationRequestModel.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("userId", "name email role")
      .lean(),
    ReportModel.find()
      .sort({ createdAt: -1 })
      .limit(120)
      .populate("reporterId", "name email")
      .populate("listingId", "title")
      .lean(),
  ]);

  return (
    <section className="py-14">
      <Container>
        <div className="mb-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h1 className="text-3xl font-black tracking-tight">Admin Panel</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--color-foreground-muted)]">
            Moderate listings, approve sellers, manage users, and resolve reports.
          </p>
        </div>

        <AdminPanelWorkspace
          initialOverview={{
            totalUsers,
            totalListings,
            pendingListings,
            pendingVerification,
            openReports,
          }}
          initialUsers={JSON.parse(JSON.stringify(users))}
          initialListings={JSON.parse(JSON.stringify(listings))}
          initialRequests={JSON.parse(JSON.stringify(requests))}
          initialReports={JSON.parse(JSON.stringify(reports))}
        />
      </Container>
    </section>
  );
}
