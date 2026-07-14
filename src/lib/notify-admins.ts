import { UserModel } from "@/server/models/user";
import { NotificationModel } from "@/server/models/notification";

export async function notifyAdmins(title: string, message: string, link: string, type: "system" | "order" | "message" = "system") {
  try {
    const admins = await UserModel.find({ role: "admin" }).select("_id").lean();
    if (admins.length === 0) return;

    const notifications = admins.map((admin) => ({
      userId: admin._id,
      title,
      message,
      link,
      type,
    }));

    await NotificationModel.insertMany(notifications);

    const io = (globalThis as any).io;
    if (io) {
      admins.forEach((admin) => {
        const notif = {
          userId: admin._id.toString(),
          title,
          message,
          link,
          type,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        io.to(admin._id.toString()).emit("notification", notif);
      });
    }
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
}
