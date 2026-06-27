"use client";

import { useState } from "react";
import { AdminDataTable, type ColumnDef } from "./admin-data-table";

type VerificationRequest = {
  _id: string;
  userId: { _id: string; name: string; email: string; role: string; verificationStatus: string };
  storeName: string;
  panNumber: string;
  status: string;
  createdAt: string;
};

export function AdminVerificationClient({
  initialRequests,
  totalCount,
  pageSize,
}: {
  initialRequests: VerificationRequest[];
  totalCount: number;
  pageSize: number;
}) {
  const [requests, setRequests] = useState<VerificationRequest[]>(initialRequests);
  const [isUpdating, setIsUpdating] = useState(false);

  useState(() => {
    setRequests(initialRequests);
  });

  if (initialRequests !== requests && !isUpdating) {
    setRequests(initialRequests);
  }

  async function updateStatus(requestId: string, action: string, reason?: string) {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/verification-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action, rejectionReason: reason, adminNotes: "Processed via data table" }),
      });
      if (res.ok) {
        // Optimistic local update
        const newStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "more_info_required";
        setRequests((current) =>
          current.map((r) => (r._id === requestId ? { ...r, status: newStatus } : r)),
        );
      } else {
        alert("Failed to update request");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  const columns: ColumnDef<VerificationRequest>[] = [
    {
      header: "Store / User",
      cell: (req) => (
        <div>
          <p className="font-bold text-[var(--color-on-surface)] leading-tight">{req.storeName}</p>
          <p className="text-xs text-[var(--color-on-surface-variant)]">{req.userId?.name} ({req.userId?.email})</p>
        </div>
      ),
    },
    {
      header: "PAN",
      accessorKey: "panNumber",
      className: "font-mono text-xs",
    },
    {
      header: "Status",
      cell: (req) => (
        <div className="flex items-center gap-2">
          {req.status === "approved" ? (
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          ) : req.status === "pending" ? (
             <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          ) : req.status === "more_info_required" ? (
             <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          ) : (
             <span className="w-2 h-2 rounded-full bg-red-500"></span>
          )}
          <span className="capitalize font-semibold text-xs">{req.status.replace(/_/g, " ")}</span>
        </div>
      ),
    },
    {
      header: "Date",
      cell: (req) => new Date(req.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      cell: (req) => (
        <div className="flex items-center gap-2">
           {req.status === "pending" || req.status === "more_info_required" ? (
             <>
               <button 
                 disabled={isUpdating}
                 onClick={() => updateStatus(req._id, "approve")}
                 className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
               >
                 Approve
               </button>
               <button 
                 disabled={isUpdating}
                 onClick={() => {
                    const reason = prompt("Enter info required:");
                    if (reason) updateStatus(req._id, "more_info_required", reason);
                 }}
                 className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
               >
                 Ask Info
               </button>
               <button 
                 disabled={isUpdating}
                 onClick={() => {
                    const reason = prompt("Enter rejection reason:");
                    if (reason) updateStatus(req._id, "reject", reason);
                 }}
                 className="px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors"
               >
                 Reject
               </button>
             </>
           ) : (
             <span className="text-xs text-[var(--color-on-surface-variant)]">Resolved</span>
           )}
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      data={requests}
      columns={columns}
      totalCount={totalCount}
      pageSize={pageSize}
      searchPlaceholder="Search store name..."
      filters={[
        {
          key: "status",
          label: "All Status",
          options: [
            { label: "Pending", value: "pending" },
            { label: "More Info Req", value: "more_info_required" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ],
        },
      ]}
    />
  );
}
