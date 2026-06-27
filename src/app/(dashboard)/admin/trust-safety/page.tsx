import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { AdminTrustSafetyClient } from "@/components/admin/admin-trust-safety-client";

type AdminTrustSafetyPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTrustSafetyPage({ searchParams }: AdminTrustSafetyPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectToDatabase();
  const currentUser = await UserModel.findById(session.user.id).select("role").lean();
  if (!currentUser || currentUser.role !== "admin") redirect("/dashboard");

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = typeof params.search === "string" ? params.search : "";

  // Trust & safety usually filters for users with strikes or specific account statuses
  const query: any = {
    $or: [
      { strikeCount: { $gt: 0 } },
      { warningCount: { $gt: 0 } },
      { accountStatus: { $ne: "active" } }
    ]
  };
  
  if (search) {
    query.$and = [
      {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ]
      }
    ];
  }

  const [totalCount, rawUsers] = await Promise.all([
    UserModel.countDocuments(query),
    UserModel.find(query)
      .sort({ strikeCount: -1, warningCount: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("name email role strikeCount accountStatus warningCount")
      .lean(),
  ]);

  const users = JSON.parse(JSON.stringify(rawUsers));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-on-surface)]">
          Trust & Safety Moderation
        </h1>
        <p className="text-[var(--color-on-surface-variant)] mt-1">
          Take manual moderation actions and monitor high-risk accounts.
        </p>
      </div>
      <AdminTrustSafetyClient initialUsers={users} totalCount={totalCount} pageSize={limit} />
    </div>
  );
}
