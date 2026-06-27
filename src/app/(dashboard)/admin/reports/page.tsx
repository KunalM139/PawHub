import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { ReportModel } from "@/server/models/report";
import { AdminReportsClient } from "@/components/admin/admin-reports-client";

type AdminReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectToDatabase();
  const currentUser = await UserModel.findById(session.user.id).select("role").lean();
  if (!currentUser || currentUser.role !== "admin") redirect("/dashboard");

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const status = typeof params.status === "string" ? params.status : "";
  const type = typeof params.type === "string" ? params.type : "";

  const query: any = {};
  if (status) query.status = status;
  if (type) query.type = type;

  const [totalCount, rawReports] = await Promise.all([
    ReportModel.countDocuments(query),
    ReportModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("reporterId", "name email")
      .populate("reportedUserId", "name email strikeCount accountStatus")
      .lean(),
  ]);

  const reports = JSON.parse(JSON.stringify(rawReports));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-on-surface)]">
          Trust & Safety Reports
        </h1>
        <p className="text-[var(--color-on-surface-variant)] mt-1">
          Review and resolve user-submitted reports for listings and profiles.
        </p>
      </div>
      <AdminReportsClient initialReports={reports} totalCount={totalCount} pageSize={limit} />
    </div>
  );
}
