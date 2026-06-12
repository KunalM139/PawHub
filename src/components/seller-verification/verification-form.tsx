"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

type VerificationRequest = {
  _id: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  createdAt: string;
};

type VerificationFormProps = {
  initialRequest: VerificationRequest | null;
  initialRole: "user" | "verifiedSeller" | "admin";
};

async function uploadVerificationFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads/verification-doc", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | {
        secureUrl?: string;
        message?: string;
      }
    | null;

  if (!response.ok || !data?.secureUrl) {
    throw new Error(data?.message ?? "Upload failed.");
  }

  return data.secureUrl;
}

export function VerificationForm({ initialRequest, initialRole }: VerificationFormProps) {
  const [request, setRequest] = useState<VerificationRequest | null>(initialRequest);
  const [legalName, setLegalName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [aboutBusiness, setAboutBusiness] = useState("");
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [businessProofFile, setBusinessProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isVerified = initialRole === "verifiedSeller" || initialRole === "admin";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!idProofFile) {
      setError("ID proof file is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const idProofUrl = await uploadVerificationFile(idProofFile);
      const businessProofUrl = businessProofFile
        ? await uploadVerificationFile(businessProofFile)
        : null;

      const response = await fetch("/api/verification-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          legalName,
          businessName: businessName || null,
          phone,
          city,
          state,
          idProofUrl,
          businessProofUrl,
          aboutBusiness: aboutBusiness || null,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            request?: VerificationRequest;
            message?: string;
          }
        | null;

      if (!response.ok || !data?.request) {
        setError(data?.message ?? "Unable to submit verification request.");
        setIsSubmitting(false);
        return;
      }

      setRequest(data.request);
      setSuccess("Verification request submitted successfully.");
      setLegalName("");
      setBusinessName("");
      setPhone("");
      setCity("");
      setState("");
      setAboutBusiness("");
      setIdProofFile(null);
      setBusinessProofFile(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit request.");
    }

    setIsSubmitting(false);
  }

  function onIdProofChange(event: ChangeEvent<HTMLInputElement>) {
    const [file] = Array.from(event.target.files ?? []);
    setIdProofFile(file ?? null);
  }

  function onBusinessProofChange(event: ChangeEvent<HTMLInputElement>) {
    const [file] = Array.from(event.target.files ?? []);
    setBusinessProofFile(file ?? null);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-2xl font-black tracking-tight">Verification Status</h2>

        {isVerified ? (
          <div className="mt-4 rounded-2xl bg-[#e8fff0] p-4 text-sm font-semibold text-[#176a37]">
            Your seller account is verified. Verified badge is active.
          </div>
        ) : request ? (
          <div className="mt-4 rounded-2xl bg-[var(--color-surface-muted)] p-4 text-sm">
            <p className="font-semibold uppercase tracking-wide">Status: {request.status}</p>
            {request.status === "rejected" && request.rejectionReason ? (
              <p className="mt-2 text-[var(--color-foreground-muted)]">
                Reason: {request.rejectionReason}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-foreground-muted)]">
            No verification request submitted yet.
          </p>
        )}
      </section>

      {!isVerified && request?.status === "pending" ? null : (
        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-black tracking-tight">Apply for Seller Verification</h2>
          <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
            Upload identity and business details to receive your verified seller badge.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Legal Name
                <input
                  value={legalName}
                  onChange={(event) => setLegalName(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
                  required
                />
              </label>

              <label className="block text-sm font-semibold">
                Business Name (optional)
                <input
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm font-semibold">
                Phone
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
                  required
                />
              </label>

              <label className="block text-sm font-semibold">
                City
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
                  required
                />
              </label>

              <label className="block text-sm font-semibold">
                State
                <input
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
                  required
                />
              </label>
            </div>

            <label className="block text-sm font-semibold">
              About Business (optional)
              <textarea
                value={aboutBusiness}
                onChange={(event) => setAboutBusiness(event.target.value)}
                className="mt-2 min-h-24 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                ID Proof (image or PDF)
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={onIdProofChange}
                  className="mt-2 block w-full text-sm"
                  required
                />
              </label>

              <label className="block text-sm font-semibold">
                Business Proof (optional)
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={onBusinessProofChange}
                  className="mt-2 block w-full text-sm"
                />
              </label>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-primary-foreground)] disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Verification"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
