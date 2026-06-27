import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { AdminActivityModel } from "@/server/models/admin-activity";
import { AdminActivityClient } from "@/components/admin/admin-activity-client";

type AdminActivityPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminActivityPage({ searchParams }: AdminActivityPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectToDatabase();
  const currentUser = await UserModel.findById(session.user.id).select("role").lean();
  if (!currentUser || currentUser.role !== "admin") redirect("/dashboard");

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;
  const search = typeof params.search === "string" ? params.search : "";

  const query: any = {};
  if (search) {
    query.$or = [
      { action: { $regex: search, $options: "i" } },
      { adminName: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
    ];
  }

  const [totalCount, rawActivities] = await Promise.all([
    AdminActivityModel.countDocuments(query),
    AdminActivityModel.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  const activities = JSON.parse(JSON.stringify(rawActivities));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-on-surface)]">
          Admin Activity Log
        </h1>
        <p className="text-[var(--color-on-surface-variant)] mt-1">
          Immutable log of all administrative actions and logins.
        </p>
      </div>
      <AdminActivityClient initialActivities={activities} totalCount={totalCount} pageSize={limit} />
    </div>
  );
}
