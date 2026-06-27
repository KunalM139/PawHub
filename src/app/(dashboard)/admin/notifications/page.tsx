import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";

export default async function AdminNotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectToDatabase();
  const currentUser = await UserModel.findById(session.user.id).select("role").lean();
  if (!currentUser || currentUser.role !== "admin") redirect("/dashboard");

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-on-surface)]">
          Notifications
        </h1>
        <p className="text-[var(--color-on-surface-variant)] mt-1">
          System alerts, unread reports, and failed uploads.
        </p>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-[var(--color-outline-variant)]/30 card-shadow">
        <p className="text-[var(--color-on-surface-variant)]">Notifications client component goes here...</p>
      </div>
    </div>
  );
}
