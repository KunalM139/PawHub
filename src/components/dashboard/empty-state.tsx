import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/[0.06] bg-[var(--color-surface-muted)]/50 px-6 py-14 text-center">
      <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[var(--color-secondary)]">
        <Icon className="size-6 text-[var(--color-foreground-subtle)]" />
      </div>
      <h3 className="mt-4 text-base font-bold text-[var(--color-foreground)]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--color-foreground-muted)]">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[var(--shadow-soft)] transition hover:brightness-110"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
