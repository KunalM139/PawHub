import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  gradient?: string;
  iconBg?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  gradient = "bg-orange-50/50",
  iconBg = "bg-orange-100 text-orange-600",
}: StatCardProps) {
  return (
    <div className={cn("group relative overflow-hidden rounded-[2rem] border border-slate-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md", gradient)}>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
            {label}
          </p>
          <div className={cn("inline-flex size-12 items-center justify-center rounded-2xl shadow-sm", iconBg)}>
            <Icon className="size-6" />
          </div>
        </div>
        <p className="text-4xl font-black tracking-tight text-slate-900">
          {value}
        </p>
        {trend && (
          <p
            className={cn(
              "mt-2 text-sm font-bold",
              trendUp ? "text-emerald-600" : "text-slate-500",
            )}
          >
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
