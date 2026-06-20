"use client";

import { useState } from "react";

type Overview = {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  pendingVerification: number;
  openReports: number;
};

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "verifiedSeller" | "admin";
};

type AdminListing = {
  _id: string;
  title: string;
  city: string;
  listingType: string;
  status: "pending" | "approved" | "rejected" | "archived";
  sellerId: string;
  isVerifiedSeller?: boolean;
  isPhoneVerified?: boolean;
};

type VerificationRequest = {
  _id: string;
  legalName: string;
  status: "pending" | "approved" | "rejected";
  userId?: { _id?: string; name?: string; email?: string } | string;
};

type ReportRecord = {
  _id: string;
  reason: string;
  status: "open" | "in_review" | "resolved" | "dismissed";
  details?: string | null;
  reporterId?: { name?: string; email?: string } | string;
  listingId?: { _id?: string; title?: string } | string;
};

type Props = {
  initialOverview: Overview;
  initialUsers: AdminUser[];
  initialListings: AdminListing[];
  initialRequests: VerificationRequest[];
  initialReports: ReportRecord[];
};

function getUserName(value: VerificationRequest["userId"]) {
  if (!value || typeof value === "string") {
    return "User";
  }

  return value.name ?? "User";
}

function getReporterName(value: ReportRecord["reporterId"]) {
  if (!value || typeof value === "string") {
    return "Reporter";
  }

  return value.name ?? "Reporter";
}

function getListingTitle(value: ReportRecord["listingId"]) {
  if (!value || typeof value === "string") {
    return "Listing";
  }

  return value.title ?? "Listing";
}

function getListingId(value: ReportRecord["listingId"]) {
  if (!value || typeof value === "string") {
    return null;
  }

  return value._id ?? null;
}

export function AdminPanelWorkspace({
  initialOverview,
  initialUsers,
  initialListings,
  initialRequests,
  initialReports,
}: Props) {
  const [overview, setOverview] = useState(initialOverview);
  const [users, setUsers] = useState(initialUsers);
  const [listings, setListings] = useState(initialListings);
  const [requests, setRequests] = useState(initialRequests);
  const [reports, setReports] = useState(initialReports);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  async function updateUserRole(userId: string, role: AdminUser["role"]) {
    setError(null);
    setMessage(null);

    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, role }),
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Unable to update role.");
      return;
    }

    setUsers((current) =>
      current.map((user) => (user._id === userId ? { ...user, role } : user)),
    );
    setMessage("User role updated.");
  }

  async function updateListingStatus(
    listingId: string,
    status: AdminListing["status"],
    rejectionReason?: string,
  ) {
    setError(null);
    setMessage(null);

    const response = await fetch("/api/admin/listings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ listingId, status, rejectionReason: rejectionReason ?? null }),
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Unable to update listing status.");
      return;
    }

    setListings((current) =>
      current.map((listing) =>
        listing._id === listingId
          ? {
              ...listing,
              status,
            }
          : listing,
      ),
    );

    setOverview((current) => ({
      ...current,
      pendingListings:
        status === "pending"
          ? current.pendingListings
          : Math.max(0, current.pendingListings - 1),
    }));
    setMessage("Listing moderation updated.");
  }

  async function bulkUpdateListings(status: "approved" | "rejected") {
    if (selectedListings.size === 0) return;
    
    const rejectionReason = status === "rejected" ? window.prompt("Bulk rejection reason", "Does not meet guidelines") : undefined;
    
    for (const id of Array.from(selectedListings)) {
      await updateListingStatus(id, status, rejectionReason || undefined);
    }
    
    setSelectedListings(new Set());
  }

  async function reviewRequest(requestId: string, action: "approve" | "reject") {
    setError(null);
    setMessage(null);

    const rejectionReason =
      action === "reject" ? window.prompt("Rejection reason", "Details could not be verified") : null;

    const response = await fetch("/api/admin/verification-requests", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId,
        action,
        rejectionReason,
        adminNotes: adminNotes[requestId] || null,
      }),
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Unable to review request.");
      return;
    }

    setRequests((current) =>
      current.map((request) =>
        request._id === requestId
          ? {
              ...request,
              status: action === "approve" ? "approved" : "rejected",
            }
          : request,
      ),
    );

    setOverview((current) => ({
      ...current,
      pendingVerification: Math.max(0, current.pendingVerification - 1),
    }));

    setMessage(`Verification request ${action}d.`);
  }

  async function updateReportStatus(
    reportId: string,
    status: ReportRecord["status"],
    removeListing?: boolean,
    listingId?: string | null,
  ) {
    setError(null);
    setMessage(null);

    const response = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportId,
        status,
        removeListing: removeListing ?? false,
      }),
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Unable to update report.");
      return;
    }

    setReports((current) =>
      current.map((report) =>
        report._id === reportId
          ? {
              ...report,
              status,
            }
          : report,
      ),
    );

    if (removeListing && listingId) {
      setListings((current) =>
        current.map((listing) =>
          listing._id === listingId
            ? {
                ...listing,
                status: "archived",
              }
            : listing,
        ),
      );
    }

    setOverview((current) => ({
      ...current,
      openReports:
        status === "open" || status === "in_review"
          ? current.openReports
          : Math.max(0, current.openReports - 1),
    }));

    setMessage("Report updated.");
  }

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <article className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
          <p className="text-xs uppercase tracking-wide text-[var(--color-foreground-subtle)]">Users</p>
          <p className="mt-1 text-xl font-black">{overview.totalUsers}</p>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
          <p className="text-xs uppercase tracking-wide text-[var(--color-foreground-subtle)]">Listings</p>
          <p className="mt-1 text-xl font-black">{overview.totalListings}</p>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
          <p className="text-xs uppercase tracking-wide text-[var(--color-foreground-subtle)]">Pending Listings</p>
          <p className="mt-1 text-xl font-black">{overview.pendingListings}</p>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
          <p className="text-xs uppercase tracking-wide text-[var(--color-foreground-subtle)]">
            Pending Verification
          </p>
          <p className="mt-1 text-xl font-black">{overview.pendingVerification}</p>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
          <p className="text-xs uppercase tracking-wide text-[var(--color-foreground-subtle)]">Open Reports</p>
          <p className="mt-1 text-xl font-black">{overview.openReports}</p>
        </article>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-2xl font-black tracking-tight">Manage Users</h2>
        <div className="mt-4 space-y-3">
          {users.slice(0, 12).map((user) => (
            <article key={user._id} className="rounded-2xl bg-[var(--color-surface-muted)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold">{user.name}</h3>
                  <p className="text-sm text-[var(--color-foreground-muted)]">{user.email}</p>
                </div>
                <select
                  value={user.role}
                  onChange={(event) =>
                    void updateUserRole(
                      user._id,
                      event.target.value as "user" | "verifiedSeller" | "admin",
                    )
                  }
                  className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm"
                >
                  <option value="user">user</option>
                  <option value="verifiedSeller">verifiedSeller</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight">Manage Listings</h2>
          {selectedListings.size > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void bulkUpdateListings("approved")}
                className="rounded-lg bg-[#e8fff0] px-4 py-2 text-sm font-semibold text-[#176a37]"
              >
                Approve Selected ({selectedListings.size})
              </button>
              <button
                type="button"
                onClick={() => void bulkUpdateListings("rejected")}
                className="rounded-lg bg-[#fff1f1] px-4 py-2 text-sm font-semibold text-[#9d2222]"
              >
                Reject Selected ({selectedListings.size})
              </button>
            </div>
          )}
        </div>
        <div className="mt-4 space-y-3">
          {listings.slice(0, 15).map((listing) => (
            <article key={listing._id} className="rounded-2xl bg-[var(--color-surface-muted)] p-4 relative">
              <div className="absolute top-4 right-4">
                <input
                  type="checkbox"
                  checked={selectedListings.has(listing._id)}
                  onChange={(e) => {
                    const newSet = new Set(selectedListings);
                    if (e.target.checked) newSet.add(listing._id);
                    else newSet.delete(listing._id);
                    setSelectedListings(newSet);
                  }}
                  className="size-5 rounded border-gray-300"
                />
              </div>
              <h3 className="text-base font-bold pr-8">{listing.title}</h3>
              <p className="text-sm text-[var(--color-foreground-muted)]">
                {listing.city} • {listing.listingType} • {listing.status}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {listing.isVerifiedSeller ? (
                  <span className="rounded-full bg-[#e8fff0] px-2.5 py-1 font-semibold text-[#176a37]">
                    Verified Seller
                  </span>
                ) : (
                  <span className="rounded-full bg-white px-2.5 py-1 font-semibold">
                    Community Seller
                  </span>
                )}
                {listing.isPhoneVerified ? (
                  <span className="rounded-full bg-[#e8fff0] px-2.5 py-1 font-semibold text-[#176a37]">
                    Phone Verified
                  </span>
                ) : (
                  <span className="rounded-full bg-[#fff1f1] px-2.5 py-1 font-semibold text-[#9d2222]">
                    Phone Unverified
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void updateListingStatus(listing._id, "approved")}
                  className="rounded-lg bg-[#e8fff0] px-3 py-1.5 text-xs font-semibold text-[#176a37]"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const reason = window.prompt("Rejection reason", "Insufficient details");
                    void updateListingStatus(listing._id, "rejected", reason ?? undefined);
                  }}
                  className="rounded-lg bg-[#fff1f1] px-3 py-1.5 text-xs font-semibold text-[#9d2222]"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => void updateListingStatus(listing._id, "archived")}
                  className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
                >
                  Archive
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-2xl font-black tracking-tight">Approve Sellers</h2>
        <div className="mt-4 space-y-3">
          {requests.slice(0, 12).map((request) => (
            <article key={request._id} className="rounded-2xl bg-[var(--color-surface-muted)] p-4">
              <h3 className="text-base font-bold">{request.legalName}</h3>
              <p className="text-sm text-[var(--color-foreground-muted)]">
                {getUserName(request.userId)} • {request.status}
              </p>
              <div className="mt-2 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Admin notes (internal only)..."
                  value={adminNotes[request._id] || ""}
                  onChange={(e) => setAdminNotes({ ...adminNotes, [request._id]: e.target.value })}
                  className="w-full text-sm p-2 rounded-lg border border-black/10"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void reviewRequest(request._id, "approve")}
                    className="rounded-lg bg-[#e8fff0] px-3 py-1.5 text-xs font-semibold text-[#176a37]"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void reviewRequest(request._id, "reject")}
                    className="rounded-lg bg-[#fff1f1] px-3 py-1.5 text-xs font-semibold text-[#9d2222]"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-2xl font-black tracking-tight">Reports & Spam Control</h2>
        <div className="mt-4 space-y-3">
          {reports.slice(0, 15).map((report) => {
            const listingId = getListingId(report.listingId);

            return (
              <article key={report._id} className="rounded-2xl bg-[var(--color-surface-muted)] p-4">
                <h3 className="text-base font-bold">{report.reason}</h3>
                <p className="text-sm text-[var(--color-foreground-muted)]">
                  {getReporterName(report.reporterId)} • {getListingTitle(report.listingId)} •
                  {" "}
                  {report.status}
                </p>
                {report.details ? (
                  <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{report.details}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void updateReportStatus(report._id, "in_review")}
                    className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
                  >
                    In Review
                  </button>
                  <button
                    type="button"
                    onClick={() => void updateReportStatus(report._id, "resolved")}
                    className="rounded-lg bg-[#e8fff0] px-3 py-1.5 text-xs font-semibold text-[#176a37]"
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    onClick={() => void updateReportStatus(report._id, "dismissed")}
                    className="rounded-lg bg-[#fff1f1] px-3 py-1.5 text-xs font-semibold text-[#9d2222]"
                  >
                    Dismiss
                  </button>
                  {listingId ? (
                    <button
                      type="button"
                      onClick={() =>
                        void updateReportStatus(report._id, "resolved", true, listingId)
                      }
                      className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
                    >
                      Resolve + Remove Listing
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
