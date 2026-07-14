"use client";

import { useState } from "react";
import { AdminDataTable, type ColumnDef } from "./admin-data-table";

type UserRecord = {
  _id: string;
  name: string;
  email: string;
  role: string;
  strikeCount: number;
  accountStatus: string;
  warningCount: number;
};

export function AdminTrustSafetyClient({
  initialUsers,
  totalCount,
  pageSize,
}: {
  initialUsers: UserRecord[];
  totalCount: number;
  pageSize: number;
}) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [isUpdating, setIsUpdating] = useState(false);

  useState(() => {
    setUsers(initialUsers);
  });

  if (initialUsers !== users && !isUpdating) {
    setUsers(initialUsers);
  }

  async function takeAction(targetUserId: string, actionType: string) {
    const reason = prompt(`Reason for ${actionType} (optional):`);
    if (reason === null) return; // Cancelled

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, actionType, reason }),
      });
      if (res.ok) {
        const { user: updatedData } = await res.json();
        setUsers((current) =>
          current.map((u) => (u._id === targetUserId ? { ...u, ...updatedData } : u)),
        );
      } else {
        alert("Failed to execute moderation action.");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  const columns: ColumnDef<UserRecord>[] = [
    {
      header: "User",
      cell: (user) => (
        <div>
          <p className="font-bold text-[var(--color-on-surface)] leading-tight">{user.name}</p>
          <p className="text-xs text-[var(--color-on-surface-variant)]">{user.email}</p>
        </div>
      ),
    },
    {
      header: "Strikes",
      cell: (user) => (
        <span className={`font-bold ${user.strikeCount >= 3 ? "text-red-600" : "text-amber-600"}`}>
          {user.strikeCount}
        </span>
      ),
    },
    {
      header: "Warnings",
      cell: (user) => (
        <span className="font-bold text-[var(--color-on-surface-variant)]">{user.warningCount || 0}</span>
      ),
    },
    {
      header: "Status",
      cell: (user) => (
        <div className="flex items-center gap-2">
          {user.accountStatus === "active" ? (
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          ) : user.accountStatus === "suspended" ? (
             <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          ) : (
             <span className="w-2 h-2 rounded-full bg-red-500"></span>
          )}
          <span className="capitalize font-semibold text-xs">{user.accountStatus}</span>
        </div>
      ),
    },
    {
      header: "Manual Actions",
      cell: (user) => (
        <div className="flex flex-wrap gap-2">
           <button 
             disabled={isUpdating}
             onClick={() => takeAction(user._id, "warn")}
             className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
           >
             Warn
           </button>
           <button 
             disabled={isUpdating}
             onClick={() => takeAction(user._id, "add_strike")}
             className="px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100"
           >
             + Strike
           </button>
           {user.accountStatus === "active" && (
             <button 
               disabled={isUpdating}
               onClick={() => takeAction(user._id, "suspend")}
               className="px-2 py-1 rounded bg-orange-50 text-orange-700 text-xs font-bold hover:bg-orange-100"
             >
               Suspend
             </button>
           )}
           {user.accountStatus === "suspended" && (
             <button 
               disabled={isUpdating}
               onClick={() => takeAction(user._id, "unsuspend")}
               className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100"
             >
               Unsuspend
             </button>
           )}
           {user.accountStatus !== "banned" && (
             <button 
               disabled={isUpdating}
               onClick={() => takeAction(user._id, "ban")}
               className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100"
             >
               Ban
             </button>
           )}
           {user.accountStatus === "banned" && (
             <button 
               disabled={isUpdating}
               onClick={() => takeAction(user._id, "unban")}
               className="px-2 py-1 rounded bg-slate-800 text-white text-xs font-bold hover:bg-black"
             >
               Unban
             </button>
           )}
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      data={users}
      columns={columns}
      totalCount={totalCount}
      pageSize={pageSize}
      searchPlaceholder="Search users by name or email..."
      filters={[]}
    />
  );
}
