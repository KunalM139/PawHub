import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { AdminUsersClient } from "@/components/admin/admin-users-client";

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectToDatabase();
  const currentUser = await UserModel.findById(session.user.id).select("role").lean();

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = typeof params.search === "string" ? params.search : "";
  const roleFilter = typeof params.role === "string" ? params.role : "";

  const query: any = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (roleFilter) {
    query.role = roleFilter;
  }

  const [totalCount, rawUsers] = await Promise.all([
    UserModel.countDocuments(query),
    UserModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("name email role strikeCount accountStatus createdAt image")
      .lean(),
  ]);

  const users = JSON.parse(JSON.stringify(rawUsers));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-on-surface)]">
          Users Management
        </h1>
        <p className="text-[var(--color-on-surface-variant)] mt-1">
          Search, filter, and manage all users on PawHub.
        </p>
      </div>

      <AdminUsersClient initialUsers={users} totalCount={totalCount} pageSize={limit} />
    </div>
  );
}
