"use client";

import { useState, type FormEvent } from "react";

type ReportListingFormProps = {
  listingId: string;
};

export function ReportListingForm({ listingId }: ReportListingFormProps) {
  const [reason, setReason] = useState<
    "spam" | "fake_listing" | "scam" | "abuse" | "animal_welfare" | "other"
  >("fake_listing");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitReport(payload: { reason: string; details?: string | null }) {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listingId,
        reason: payload.reason,
        details: payload.details ?? null,
      }),
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Unable to submit report.");
      setIsSubmitting(false);
      return;
    }

    setSuccess("Report submitted to moderation queue.");
    setDetails("");
    setIsSubmitting(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitReport({ reason, details: details || null });
  }

  return (
    <form className="mt-4 space-y-3 rounded-2xl bg-[var(--color-surface-muted)] p-4" onSubmit={handleSubmit}>
      <h3 className="text-sm font-bold uppercase tracking-wide">Report Listing</h3>

      <label className="block text-sm font-semibold">
        Reason
        <select
          value={reason}
          onChange={(event) =>
            setReason(
              event.target.value as "spam" | "fake_listing" | "scam" | "abuse" | "animal_welfare" | "other",
            )
          }
          className="mt-2 h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm"
        >
          <option value="fake_listing">Fake Listing</option>
          <option value="spam">Spam</option>
          <option value="scam">Suspicious Activity</option>
          <option value="abuse">Abuse</option>
          <option value="animal_welfare">Animal Welfare Concern</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="block text-sm font-semibold">
        Details (optional)
        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          className="mt-2 min-h-20 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          maxLength={1000}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-black/10 bg-white px-4 text-sm font-semibold disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() =>
            void submitReport({
              reason: "scam",
              details: "Suspicious behavior reported by user.",
            })
          }
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#fff1f1] px-4 text-sm font-semibold text-[#9d2222] disabled:opacity-60"
        >
          Flag Suspicious Activity
        </button>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {success ? <p className="text-xs text-emerald-700">{success}</p> : null}
    </form>
  );
}
