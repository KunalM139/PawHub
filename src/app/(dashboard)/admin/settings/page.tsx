import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { PlatformSettingsModel } from "@/server/models/platform-settings";
import { AdminSettingsClient } from "@/components/admin/admin-settings-client";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectToDatabase();
  const currentUser = await UserModel.findById(session.user.id).select("role").lean();
  if (!currentUser || currentUser.role !== "admin") redirect("/dashboard");

  let rawSettings = await PlatformSettingsModel.findOne().lean();
  if (!rawSettings) {
    rawSettings = await PlatformSettingsModel.create({});
  }

  const settings = JSON.parse(JSON.stringify(rawSettings));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-on-surface)]">
          Platform Settings
        </h1>
        <p className="text-[var(--color-on-surface-variant)] mt-1">
          Manage categories, report reasons, toggles, and global marketplace configuration.
        </p>
      </div>
      <AdminSettingsClient initialSettings={settings} />
    </div>
  );
}
