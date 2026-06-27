"use client";

import { useState } from "react";
import Image from "next/image";
import { AdminDataTable, type ColumnDef } from "./admin-data-table";

type UserRecord = {
  _id: string;
  name: string;
  email: string;
  role: string;
  strikeCount: number;
  accountStatus: string;
  createdAt: string;
  image?: string;
};

export function AdminUsersClient({
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

  // When initialUsers change (due to URL change), update local state
  // We use key on the parent or just useEffect
  useState(() => {
    setUsers(initialUsers);
  });

  if (initialUsers !== users && !isUpdating) {
     setUsers(initialUsers);
  }

  async function updateRole(userId: string, newRole: string) {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers((current) =>
          current.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
        );
      } else {
        alert("Failed to update role");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  async function updateStatus(userId: string, action: string) {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, notes: `Admin manual action: ${action}` }),
      });
      if (res.ok) {
        // Refresh page or update local state
        const data = await res.json();
        setUsers((current) =>
          current.map((u) => {
            if (u._id === userId) {
               return { ...u, accountStatus: data.accountStatus || u.accountStatus, strikeCount: data.strikeCount ?? u.strikeCount };
            }
            return u;
          }),
        );
      } else {
        alert("Failed to perform moderation action");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  const columns: ColumnDef<UserRecord>[] = [
    {
      header: "User",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-[var(--color-surface-container-high)] overflow-hidden shrink-0">
             {user.image ? (
               <Image src={user.image} alt={user.name} fill className="object-cover" />
             ) : (
               <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]">person</span>
             )}
          </div>
          <div>
            <p className="font-bold text-[var(--color-on-surface)] leading-tight">{user.name}</p>
            <p className="text-xs text-[var(--color-on-surface-variant)]">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (user) => (
        <select
          disabled={isUpdating}
          value={user.role}
          onChange={(e) => updateRole(user._id, e.target.value)}
          className="bg-transparent border border-[var(--color-outline-variant)] rounded-lg px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
        >
          <option value="user">User</option>
          <option value="verifiedSeller">Verified Seller</option>
          <option value="admin">Admin</option>
        </select>
      ),
    },
    {
      header: "Status",
      cell: (user) => (
        <div className="flex items-center gap-2">
          {user.accountStatus === "active" ? (
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          ) : user.accountStatus === "suspended" ? (
             <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          ) : (
             <span className="w-2 h-2 rounded-full bg-red-500"></span>
          )}
          <span className="capitalize font-semibold text-xs">{user.accountStatus}</span>
        </div>
      ),
    },
    {
      header: "Strikes",
      cell: (user) => (
        <span className={`font-bold ${user.strikeCount > 0 ? "text-red-600" : "text-[var(--color-on-surface-variant)]"}`}>
          {user.strikeCount}
        </span>
      ),
    },
    {
      header: "Joined",
      cell: (user) => new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    },
    {
      header: "Actions",
      cell: (user) => (
        <div className="flex items-center gap-2">
           <button 
             disabled={isUpdating}
             onClick={() => updateStatus(user._id, "warn")}
             className="px-3 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-bold hover:bg-orange-100 transition-colors"
           >
             Warn
           </button>
           <button 
             disabled={isUpdating}
             onClick={() => updateStatus(user._id, "add_strike")}
             className="px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors"
           >
             + Strike
           </button>
           {user.accountStatus === "banned" ? (
             <button 
               disabled={isUpdating}
               onClick={() => updateStatus(user._id, "unban")}
               className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
             >
               Unban
             </button>
           ) : (
             <button 
               disabled={isUpdating}
               onClick={() => updateStatus(user._id, "ban")}
               className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
             >
               Ban
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
      searchPlaceholder="Search name or email..."
      filters={[
        {
          key: "role",
          label: "All Roles",
          options: [
            { label: "User", value: "user" },
            { label: "Verified Seller", value: "verifiedSeller" },
            { label: "Admin", value: "admin" },
          ],
        },
      ]}
    />
  );
}
