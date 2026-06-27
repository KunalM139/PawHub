"use client";

import { useState } from "react";
import { AdminDataTable, type ColumnDef } from "./admin-data-table";

type ReportRecord = {
  _id: string;
  type: string;
  status: string;
  reason: string;
  entityType: string;
  entityId: string;
  listingId?: string;
  reporterId?: { name: string; email: string };
  reportedUserId?: { name: string; email: string; strikeCount: number; accountStatus: string };
  createdAt: string;
  resolutionNote?: string;
};

export function AdminReportsClient({
  initialReports,
  totalCount,
  pageSize,
}: {
  initialReports: ReportRecord[];
  totalCount: number;
  pageSize: number;
}) {
  const [reports, setReports] = useState<ReportRecord[]>(initialReports);
  const [isUpdating, setIsUpdating] = useState(false);

  useState(() => {
    setReports(initialReports);
  });

  if (initialReports !== reports && !isUpdating) {
    setReports(initialReports);
  }

  async function updateStatus(reportId: string, status: string, action: string, reason?: string, violationConfirmed = false) {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status, resolutionNote: reason, actionToTake: action, violationConfirmed }),
      });
      if (res.ok) {
        setReports((current) =>
          current.map((r) => (r._id === reportId ? { ...r, status, resolutionNote: reason } : r)),
        );
      } else {
        alert("Failed to update report");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  const columns: ColumnDef<ReportRecord>[] = [
    {
      header: "Reason / Type",
      cell: (report) => (
        <div>
          <p className="font-bold text-[var(--color-on-surface)] leading-tight">{report.reason}</p>
          <p className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-wider font-semibold">{report.type} • {report.entityType}</p>
        </div>
      ),
    },
    {
      header: "Reported By",
      cell: (report) => (
         <p className="text-sm font-medium">{report.reporterId?.name || "Unknown"}</p>
      ),
    },
    {
      header: "Target User",
      cell: (report) => (
        <div>
          <p className="font-medium text-sm">{report.reportedUserId?.name || "N/A"}</p>
          {report.reportedUserId && (
             <p className="text-xs text-[var(--color-on-surface-variant)]">
               Strikes: <span className="font-bold text-red-600">{report.reportedUserId.strikeCount}</span>
             </p>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (report) => (
        <div className="flex items-center gap-2">
          {report.status === "resolved" ? (
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          ) : report.status === "open" ? (
             <span className="w-2 h-2 rounded-full bg-red-500"></span>
          ) : report.status === "in_review" ? (
             <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          ) : (
             <span className="w-2 h-2 rounded-full bg-slate-500"></span>
          )}
          <span className="capitalize font-semibold text-xs">{report.status.replace("_", " ")}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (report) => (
        <div className="flex flex-col gap-1">
           {report.status !== "resolved" && report.status !== "dismissed" ? (
             <>
               <div className="flex gap-2">
                 <button 
                   disabled={isUpdating}
                   onClick={() => updateStatus(report._id, "in_review", "none")}
                   className="px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100"
                 >
                   Review
                 </button>
                 <button 
                   disabled={isUpdating}
                   onClick={() => {
                      const note = prompt("Resolution Note (Optional):");
                      updateStatus(report._id, "dismissed", "none", note ?? undefined);
                   }}
                   className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                 >
                   Dismiss
                 </button>
               </div>
               <div className="flex gap-2">
                 <button 
                   disabled={isUpdating}
                   onClick={() => {
                      const note = prompt("Resolution Note (Required for Strike):");
                      if (note) updateStatus(report._id, "resolved", "remove_content", note, true);
                   }}
                   className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100"
                 >
                   Strike & Resolve
                 </button>
                 <button 
                   disabled={isUpdating}
                   onClick={() => {
                      const note = prompt("Resolution Note:");
                      if (note) updateStatus(report._id, "resolved", "warn", note, true);
                   }}
                   className="px-2 py-1 rounded bg-orange-50 text-orange-700 text-xs font-bold hover:bg-orange-100"
                 >
                   Warn & Resolve
                 </button>
               </div>
             </>
           ) : (
             <span className="text-xs text-[var(--color-on-surface-variant)]">{report.resolutionNote || "No notes"}</span>
           )}
           <a 
              href={report.entityType === "listing" ? `/listings/${report.entityId || report.listingId}` : "#"} 
              target="_blank" 
              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
           >
             View Content →
           </a>
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      data={reports}
      columns={columns}
      totalCount={totalCount}
      pageSize={pageSize}
      searchPlaceholder="Search not supported yet..."
      filters={[
        {
          key: "status",
          label: "All Status",
          options: [
            { label: "Open", value: "open" },
            { label: "In Review", value: "in_review" },
            { label: "Resolved", value: "resolved" },
            { label: "Dismissed", value: "dismissed" },
          ],
        },
        {
          key: "type",
          label: "All Types",
          options: [
            { label: "Listing", value: "listing" },
            { label: "User", value: "user" },
            { label: "Product", value: "product" },
            { label: "Message", value: "message" },
          ],
        }
      ]}
    />
  );
}
