import { LucideIcon } from "lucide-react";
import Link from "next/link";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-12 text-center shadow-sm">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-6">
        <Icon className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-[280px] mb-8 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && actionOnClick && !actionHref && (
        <button
          onClick={actionOnClick}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
