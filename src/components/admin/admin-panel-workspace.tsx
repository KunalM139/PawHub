"use client";

import { useState } from "react";
import { VerifiedSellerBadge } from "@/components/verified-seller-badge";

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
  strikeCount: number;
  accountStatus: "active" | "warned" | "suspended" | "banned";
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
  storeName: string;
  phone: string;
  city: string;
  state: string;
  address: string;
  pincode: string;
  status: "pending" | "more_info_required" | "approved" | "rejected";
  userId?: { _id?: string; name?: string; email?: string } | string;
  idProofUrl: string;
  businessProofUrl?: string | null;
  selfieUrl?: string | null;
  gstNumber?: string | null;
  businessRegistrationNumber?: string | null;
  dateOfBirth: string | Date;
};

type ReportRecord = {
  _id: string;
  reason: string;
  status: "open" | "in_review" | "resolved" | "dismissed";
  details?: string | null;
  entityType: string;
  entityId: string;
  reporterId?: { name?: string; email?: string } | string;
  reportedUserId?: { name?: string; email?: string; strikeCount: number; accountStatus: string } | string;
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

function getReportedUserName(value: ReportRecord["reportedUserId"]) {
  if (!value || typeof value === "string") return "Unknown";
  return value.name ?? "Unknown";
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

  async function manualModeration(targetUserId: string, actionType: string, reason?: string) {
    setError(null);
    setMessage(null);
    const response = await fetch("/api/admin/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, actionType, reason: reason || "Admin manual action" }),
    });

    if (!response.ok) {
      setError("Failed to execute moderation action.");
      return;
    }
    const { user: updatedUser } = await response.json();
    setUsers((current) => current.map((user) => 
      user._id === targetUserId ? { ...user, strikeCount: updatedUser.strikeCount, accountStatus: updatedUser.accountStatus } : user
    ));
    setMessage(`Action ${actionType} successful.`);
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

  async function reviewRequest(requestId: string, action: "approve" | "reject" | "more_info_required") {
    setError(null);
    setMessage(null);

    let rejectionReason = null;
    if (action === "reject" || action === "more_info_required") {
      rejectionReason = window.prompt(action === "reject" ? "Rejection reason" : "Required Info Details", action === "reject" ? "Details could not be verified" : "Please provide clear photos");
      if (!rejectionReason) return; // User cancelled
    }

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
              status: action === "approve" ? "approved" : (action === "reject" ? "rejected" : "more_info_required"),
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
    violationConfirmed?: boolean,
    actionToTake?: "none" | "warn" | "remove_content" | "ban"
  ) {
    setError(null);
    setMessage(null);

    const resolutionNote = violationConfirmed ? window.prompt("Resolution Note (Optional):", "") : undefined;

    const response = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId,
        status,
        violationConfirmed,
        actionToTake,
        resolutionNote: resolutionNote || undefined,
      }),
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Unable to update report.");
      return;
    }

    setReports((current) =>
      current.map((report) => (report._id === reportId ? { ...report, status } : report)),
    );

    setOverview((current) => ({
      ...current,
      openReports:
        status === "open" || status === "in_review"
          ? current.openReports
          : Math.max(0, current.openReports - 1),
    }));

    setMessage("Report resolved successfully.");
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
                  <div className="mt-1 flex gap-2 text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-orange-600">Strikes: {user.strikeCount || 0}</span>
                    <span className={user.accountStatus === "active" ? "text-emerald-600" : "text-red-600"}>
                      Status: {user.accountStatus}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    value={user.role}
                    onChange={(event) =>
                      void updateUserRole(
                        user._id,
                        event.target.value as "user" | "verifiedSeller" | "admin",
                      )
                    }
                    className="h-8 rounded-lg border border-black/10 bg-white px-2 text-xs"
                  >
                    <option value="user">user</option>
                    <option value="verifiedSeller">verifiedSeller</option>
                    <option value="admin">admin</option>
                  </select>
                  <div className="flex gap-1">
                    <button onClick={() => void manualModeration(user._id, "warn", window.prompt("Warning reason") || undefined)} className="rounded bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-800">Warn</button>
                    <button onClick={() => void manualModeration(user._id, "add_strike", window.prompt("Strike reason") || undefined)} className="rounded bg-orange-100 px-2 py-1 text-xs font-bold text-orange-800">Strike</button>
                    {user.accountStatus !== "banned" ? (
                      <button onClick={() => void manualModeration(user._id, "ban", window.prompt("Ban reason") || undefined)} className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-800">Ban</button>
                    ) : (
                      <button onClick={() => void manualModeration(user._id, "unban")} className="rounded bg-gray-200 px-2 py-1 text-xs font-bold">Unban</button>
                    )}
                  </div>
                </div>
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
                  <VerifiedSellerBadge withText size="sm" />
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
        <div className="mt-4 space-y-4">
          {requests.map((request) => (
            <article key={request._id} className="rounded-2xl border border-black/10 bg-gray-50 p-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{request.storeName}</h3>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${request.status === 'pending' ? 'bg-amber-100 text-amber-800' : request.status === 'more_info_required' ? 'bg-orange-100 text-orange-800' : request.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {request.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">Owner: {request.legalName}</p>
                  <p className="text-xs text-gray-600 mt-1">Email: {getUserName(request.userId)}</p>
                  <p className="text-xs text-gray-600">Phone: {request.phone}</p>
                  <p className="text-xs text-gray-600">DOB: {new Date(request.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                  <div className="mt-2 text-xs text-gray-600">
                    <p className="font-semibold">Address:</p>
                    <p>{request.address}</p>
                    <p>{request.city}, {request.state} - {request.pincode}</p>
                  </div>
                  {(request.gstNumber || request.businessRegistrationNumber) && (
                    <div className="mt-2 text-xs text-gray-600">
                      <p className="font-semibold">Business Info:</p>
                      {request.gstNumber && <p>GST: {request.gstNumber}</p>}
                      {request.businessRegistrationNumber && <p>Reg No: {request.businessRegistrationNumber}</p>}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="bg-white p-3 rounded-xl border border-black/5 flex flex-wrap gap-2">
                    <p className="w-full text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Documents</p>
                    <a href={`/api/admin/document?publicId=${encodeURIComponent(request.idProofUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-100">
                      <span className="material-symbols-outlined text-[16px]">badge</span> ID Proof
                    </a>
                    {request.businessProofUrl && (
                      <a href={`/api/admin/document?publicId=${encodeURIComponent(request.businessProofUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-100">
                        <span className="material-symbols-outlined text-[16px]">storefront</span> Biz Proof
                      </a>
                    )}
                    {request.selfieUrl && (
                      <a href={`/api/admin/document?publicId=${encodeURIComponent(request.selfieUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-teal-100">
                        <span className="material-symbols-outlined text-[16px]">face</span> Selfie
                      </a>
                    )}
                  </div>
                  
                  <div className="mt-auto space-y-2">
                    <input
                      type="text"
                      placeholder="Admin notes (internal only)..."
                      value={adminNotes[request._id] || ""}
                      onChange={(e) => setAdminNotes({ ...adminNotes, [request._id]: e.target.value })}
                      className="w-full text-sm p-2 rounded-lg border border-black/10 bg-white"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void reviewRequest(request._id, "approve")}
                        className="flex-1 rounded-lg bg-[#e8fff0] px-3 py-2 text-xs font-semibold text-[#176a37] hover:bg-emerald-100 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void reviewRequest(request._id, "more_info_required")}
                        className="flex-1 rounded-lg bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition-colors"
                      >
                        More Info
                      </button>
                      <button
                        type="button"
                        onClick={() => void reviewRequest(request._id, "reject")}
                        className="flex-1 rounded-lg bg-[#fff1f1] px-3 py-2 text-xs font-semibold text-[#9d2222] hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-2xl font-black tracking-tight">Trust & Safety Reports</h2>
        <div className="mt-4 space-y-3">
          {reports.slice(0, 15).map((report) => {
            const reportedTarget = getReportedUserName(report.reportedUserId);
            const reporter = getReporterName(report.reporterId);
            const targetInfo = typeof report.reportedUserId === "object" && report.reportedUserId ? report.reportedUserId : null;

            return (
              <article key={report._id} className="rounded-2xl bg-[var(--color-surface-muted)] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold uppercase text-red-600">{report.reason.replace("_", " ")}</h3>
                  <span className="text-xs font-bold uppercase tracking-widest">{report.status}</span>
                </div>
                <p className="text-sm font-semibold text-[var(--color-foreground)] mt-1">
                  Type: {report.entityType} | Target: {reportedTarget}
                </p>
                <p className="text-xs text-[var(--color-foreground-muted)] mt-1">
                  Reporter: {reporter}
                </p>
                {targetInfo && (
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wider flex gap-2">
                    <span className="text-orange-600">Strikes: {targetInfo.strikeCount || 0}</span>
                    <span className={targetInfo.accountStatus === "active" ? "text-emerald-600" : "text-red-600"}>
                      Status: {targetInfo.accountStatus}
                    </span>
                  </div>
                )}
                {report.details ? (
                  <p className="mt-2 text-sm text-[var(--color-foreground-muted)] p-2 bg-white rounded-lg border border-black/5">{report.details}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {report.status !== "resolved" && report.status !== "dismissed" && (
                    <>
                      <button
                        type="button"
                        onClick={() => void updateReportStatus(report._id, "resolved", true, "warn")}
                        className="rounded-lg bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800"
                      >
                        Resolve & Warn
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateReportStatus(report._id, "resolved", true, "remove_content")}
                        className="rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-800"
                      >
                        Resolve & Remove Content (Strike)
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateReportStatus(report._id, "resolved", true, "ban")}
                        className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800"
                      >
                        Resolve & Ban
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateReportStatus(report._id, "dismissed")}
                        className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold"
                      >
                        Dismiss False Report
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
