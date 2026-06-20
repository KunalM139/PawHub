import { connectToDatabase } from "@/server/db/connect";
import { NotificationModel } from "@/server/models/notification";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await connectToDatabase();
  
  const notifications = await NotificationModel.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  function getIcon(type: string) {
    switch(type) {
      case "order": return <span className="material-symbols-outlined text-[20px] text-indigo-500">package_2</span>;
      case "message": return <span className="material-symbols-outlined text-[20px] text-sky-500">chat</span>;
      case "verification": return <span className="material-symbols-outlined text-[20px] text-emerald-500">verified</span>;
      case "review": return <span className="material-symbols-outlined text-[20px] text-amber-500">star</span>;
      case "wishlist": return <span className="material-symbols-outlined text-[20px] text-rose-500">favorite</span>;
      default: return <span className="material-symbols-outlined text-[20px] text-[var(--color-outline)]">notifications</span>;
    }
  }

  function getBgColor(type: string) {
    switch(type) {
      case "order": return "bg-indigo-500/10";
      case "message": return "bg-sky-500/10";
      case "verification": return "bg-emerald-500/10";
      case "review": return "bg-amber-500/10";
      case "wishlist": return "bg-rose-500/10";
      default: return "bg-[var(--color-surface-container)]";
    }
  }

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] space-y-8 max-w-[1000px] mx-auto w-full pb-24 px-4 sm:px-0">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] md:text-[36px] leading-[1.2] font-semibold text-[var(--color-on-surface)] tracking-tight">Notifications</h1>
        <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)] max-w-2xl">
          Stay updated on your store activity, messages, and important alerts.
        </p>
      </header>

      <div className="bg-[var(--color-surface-container-lowest)] rounded-[2rem] border border-[var(--color-outline-variant)]/20 card-shadow overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 rounded-bl-full -z-10 pointer-events-none" />
        
        {notifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="size-20 rounded-[1.5rem] bg-[var(--color-surface-container)] flex items-center justify-center mb-6 shadow-sm border border-[var(--color-outline-variant)]/20">
              <span className="material-symbols-outlined text-[40px] text-[var(--color-outline-variant)]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_off</span>
            </div>
            <h3 className="text-[24px] font-bold text-[var(--color-on-surface)] mb-2">You&apos;re all caught up!</h3>
            <p className="text-[16px] text-[var(--color-on-surface-variant)]">No new notifications to show right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-outline-variant)]/10">
            {notifications.map((n: any) => {
              const content = (
                <div className={`p-5 sm:p-6 flex gap-5 transition-colors duration-300 hover:bg-[var(--color-surface-container-low)] ${!n.isRead ? 'bg-[var(--color-primary)]/5 relative' : ''}`}>
                  {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)]" />}
                  <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${getBgColor(n.type)}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className={`text-[16px] font-bold ${!n.isRead ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface-variant)]'}`}>{n.title}</h3>
                      <span className="text-[12px] font-semibold text-[var(--color-outline)] whitespace-nowrap mt-1 uppercase tracking-wider">
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className={`text-[15px] mt-1.5 leading-relaxed ${!n.isRead ? 'text-[var(--color-on-surface-variant)]' : 'text-[var(--color-outline)]'}`}>{n.message}</p>
                  </div>
                </div>
              );

              return n.link ? (
                <Link href={n.link} key={n._id} className="block group">
                  {content}
                </Link>
              ) : (
                <div key={n._id}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
