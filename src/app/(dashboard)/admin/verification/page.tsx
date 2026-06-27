import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { VerificationRequestModel } from "@/server/models/verification-request";
import { AdminVerificationClient } from "@/components/admin/admin-verification-client";

type AdminVerificationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminVerificationPage({ searchParams }: AdminVerificationPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectToDatabase();
  const currentUser = await UserModel.findById(session.user.id).select("role").lean();
  if (!currentUser || currentUser.role !== "admin") redirect("/dashboard");

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const status = typeof params.status === "string" ? params.status : "";
  const search = typeof params.search === "string" ? params.search : "";

  const query: any = {};
  if (status) query.status = status;
  if (search) query.storeName = { $regex: search, $options: "i" };

  const [totalCount, rawRequests] = await Promise.all([
    VerificationRequestModel.countDocuments(query),
    VerificationRequestModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "name email role verificationStatus")
      .lean(),
  ]);

  const requests = JSON.parse(JSON.stringify(rawRequests));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-on-surface)]">
          Seller Verification
        </h1>
        <p className="text-[var(--color-on-surface-variant)] mt-1">
          Review and approve commercial seller applications.
        </p>
      </div>
      <AdminVerificationClient initialRequests={requests} totalCount={totalCount} pageSize={limit} />
    </div>
  );
}
