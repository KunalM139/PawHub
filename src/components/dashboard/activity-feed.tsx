import { cn } from "@/lib/utils";

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  dotColor?: string;
};

type ActivityFeedProps = {
  items: ActivityItem[];
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[var(--color-foreground-muted)]">
        No recent activity.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((item, idx) => (
        <div key={item.id} className="relative flex gap-4 py-3">
          {/* Timeline line */}
          {idx < items.length - 1 && (
            <div className="absolute left-[9px] top-8 h-[calc(100%-12px)] w-px bg-black/[0.06]" />
          )}
          {/* Dot */}
          <div
            className={cn(
              "mt-1.5 size-[18px] shrink-0 rounded-full border-[3px] border-white",
              item.dotColor ?? "bg-[var(--color-primary)]",
            )}
            style={{ boxShadow: "0 0 0 2px rgba(0,0,0,0.04)" }}
          />
          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--color-foreground)]">
              {item.title}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-foreground-muted)]">
              {item.description}
            </p>
            <p className="mt-1 text-[10px] font-medium text-[var(--color-foreground-subtle)]">
              {item.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
