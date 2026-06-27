"use client";

import { useState } from "react";
import { AdminDataTable, type ColumnDef } from "./admin-data-table";

type ActivityLog = {
  _id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType?: string;
  targetId?: string;
  notes?: string;
  ipAddress?: string;
  timestamp: string;
};

export function AdminActivityClient({
  initialActivities,
  totalCount,
  pageSize,
}: {
  initialActivities: ActivityLog[];
  totalCount: number;
  pageSize: number;
}) {
  const [activities, setActivities] = useState<ActivityLog[]>(initialActivities);

  useState(() => {
    setActivities(initialActivities);
  });

  if (initialActivities !== activities) {
    setActivities(initialActivities);
  }

  const columns: ColumnDef<ActivityLog>[] = [
    {
      header: "Timestamp",
      cell: (log) => (
        <span className="text-xs text-[var(--color-on-surface-variant)]" suppressHydrationWarning>
          {new Date(log.timestamp).toLocaleString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          })}
        </span>
      ),
    },
    {
      header: "Admin",
      cell: (log) => (
         <p className="font-bold text-[var(--color-on-surface)] text-sm">{log.adminName}</p>
      ),
    },
    {
      header: "Action",
      cell: (log) => (
        <div>
          <span className="px-2 py-0.5 rounded bg-[var(--color-surface-container-highest)] text-xs font-mono font-bold">
            {log.action}
          </span>
          {log.targetType && (
            <p className="text-[10px] uppercase tracking-wide font-semibold text-[var(--color-on-surface-variant)] mt-1">
              Target: {log.targetType} {log.targetId ? `(${log.targetId.slice(-6)})` : ""}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Notes",
      cell: (log) => (
        <p className="text-sm text-[var(--color-on-surface)] max-w-md truncate" title={log.notes}>
          {log.notes || "-"}
        </p>
      ),
    },
    {
      header: "IP",
      cell: (log) => (
         <span className="text-xs font-mono text-[var(--color-on-surface-variant)]">{log.ipAddress || "Unknown"}</span>
      ),
    },
  ];

  return (
    <AdminDataTable
      data={activities}
      columns={columns}
      totalCount={totalCount}
      pageSize={pageSize}
      searchPlaceholder="Search actions or admin..."
      filters={[]}
    />
  );
}
