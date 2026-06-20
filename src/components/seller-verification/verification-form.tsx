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
    <div className="flex flex-col gap-8">
      {/* Verification Status Card */}
      <div className="bg-[var(--color-surface-container-lowest)] rounded-[3rem] p-[32px] card-shadow hover-scale">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-[var(--color-outline)]">info</span>
          <h2 className="text-[24px] font-semibold leading-[1.3] text-[var(--color-on-surface)]">Verification Status</h2>
        </div>

        {isVerified ? (
          <div className="mt-4 rounded-[2rem] bg-emerald-50 p-4 border border-emerald-100 flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-600">verified</span>
            <p className="text-[16px] font-semibold text-emerald-800">
              Your seller account is verified. Verified badge is active.
            </p>
          </div>
        ) : request ? (
          <div className="mt-4 rounded-[2rem] bg-[var(--color-surface-container-low)] p-4 border border-[var(--color-outline-variant)]">
            <p className="font-semibold uppercase tracking-wide text-[16px] text-[var(--color-on-surface-variant)] flex items-center gap-2">
              Status: <span className={`px-2 py-0.5 rounded-full text-[14px] ${request.status === 'pending' ? 'bg-amber-100 text-amber-800' : request.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>{request.status}</span>
            </p>
            {request.status === "rejected" && request.rejectionReason ? (
              <p className="mt-2 text-[16px] text-[var(--color-error)]">
                Reason: {request.rejectionReason}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-[16px] leading-[1.6] text-[var(--color-outline)] italic ml-9">
            No verification request submitted yet.
          </p>
        )}
      </div>

      {/* Application Form Card */}
      {!isVerified && request?.status === "pending" ? null : (
        <div className="bg-[var(--color-surface-container-lowest)] rounded-[3rem] p-[32px] card-shadow relative overflow-hidden">
          {/* Decorative accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"></div>
          
          <div className="mb-8">
            <h2 className="text-[32px] leading-[1.2] font-semibold text-[var(--color-on-surface)] mb-2">Apply for Seller Verification</h2>
            <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)]">
              Upload identity and business details to receive your verified seller badge. All information is securely stored.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] mb-2" htmlFor="legalName">Legal Name</label>
                <input
                  id="legalName"
                  required
                  value={legalName}
                  onChange={(event) => setLegalName(event.target.value)}
                  className="w-full bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)] px-4 py-3 text-[16px] text-[var(--color-on-surface)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] mb-2" htmlFor="businessName">
                  Business Name <span className="text-[var(--color-outline)] font-normal">(optional)</span>
                </label>
                <input
                  id="businessName"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  className="w-full bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)] px-4 py-3 text-[16px] text-[var(--color-on-surface)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors outline-none"
                  placeholder="Paws & Co."
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] mb-2" htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  required
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)] px-4 py-3 text-[16px] text-[var(--color-on-surface)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors outline-none"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] mb-2" htmlFor="city">City</label>
                <input
                  id="city"
                  required
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)] px-4 py-3 text-[16px] text-[var(--color-on-surface)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors outline-none"
                  placeholder="Seattle"
                />
              </div>
              <div>
                <label className="block text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] mb-2" htmlFor="state">State</label>
                <input
                  id="state"
                  required
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  className="w-full bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)] px-4 py-3 text-[16px] text-[var(--color-on-surface)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors outline-none"
                  placeholder="WA"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] mb-2" htmlFor="about">
                About Business <span className="text-[var(--color-outline)] font-normal">(optional)</span>
              </label>
              <textarea
                id="about"
                value={aboutBusiness}
                onChange={(event) => setAboutBusiness(event.target.value)}
                className="w-full bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)] px-4 py-3 text-[16px] text-[var(--color-on-surface)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors outline-none resize-y min-h-[120px]"
                placeholder="Tell us briefly about your breeding practices or pet services..."
              ></textarea>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ID Proof Dropzone */}
              <div className={`file-dropzone border-2 border-dashed rounded-[1rem] p-6 flex flex-col items-center justify-center text-center cursor-pointer h-48 relative overflow-hidden group transition-all duration-300 ${idProofFile ? 'border-[var(--color-primary)] bg-[var(--color-primary-container)]/10' : 'border-[var(--color-outline-variant)] bg-[var(--color-surface)] hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]'}`}>
                <input
                  id="idProof"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={onIdProofChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required
                />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${idProofFile ? 'bg-[var(--color-primary-container)]' : 'bg-[var(--color-surface-container-high)] group-hover:bg-[var(--color-primary-container)]'}`}>
                  <span className={`material-symbols-outlined transition-colors ${idProofFile ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)]'}`} style={{ fontVariationSettings: idProofFile ? "'FILL' 1" : "'FILL' 0" }}>
                    {idProofFile ? 'check_circle' : 'badge'}
                  </span>
                </div>
                <h3 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] mb-1 line-clamp-1">{idProofFile ? idProofFile.name : "ID Proof (image or PDF)"}</h3>
                <p className="text-[13px] text-[var(--color-outline)]">{idProofFile ? "File selected" : "Drag & drop or click to upload"}</p>
              </div>

              {/* Business Proof Dropzone */}
              <div className={`file-dropzone border-2 border-dashed rounded-[1rem] p-6 flex flex-col items-center justify-center text-center cursor-pointer h-48 relative overflow-hidden group transition-all duration-300 ${businessProofFile ? 'border-[var(--color-primary)] bg-[var(--color-primary-container)]/10' : 'border-[var(--color-outline-variant)] bg-[var(--color-surface)] hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]'}`}>
                <input
                  id="businessProof"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={onBusinessProofChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${businessProofFile ? 'bg-[var(--color-primary-container)]' : 'bg-[var(--color-surface-container-high)] group-hover:bg-[var(--color-primary-container)]'}`}>
                  <span className={`material-symbols-outlined transition-colors ${businessProofFile ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)]'}`} style={{ fontVariationSettings: businessProofFile ? "'FILL' 1" : "'FILL' 0" }}>
                    {businessProofFile ? 'check_circle' : 'storefront'}
                  </span>
                </div>
                <h3 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface)] mb-1 line-clamp-1">
                  {businessProofFile ? businessProofFile.name : <><span className="text-[var(--color-on-surface)]">Business Proof</span> <span className="text-[var(--color-outline)] font-normal tracking-normal">(optional)</span></>}
                </h3>
                <p className="text-[13px] text-[var(--color-outline)]">{businessProofFile ? "File selected" : "Drag & drop or click to upload"}</p>
              </div>
            </div>

            {error ? <p className="text-[14px] font-semibold text-[var(--color-error)] mt-2">{error}</p> : null}
            {success ? <p className="text-[14px] font-semibold text-emerald-700 mt-2">{success}</p> : null}

            {/* CTA */}
            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gradient text-[var(--color-on-primary)] text-[14px] leading-[1.2] tracking-[0.05em] font-semibold px-8 py-4 rounded-full flex items-center gap-2 transition-all duration-300 disabled:opacity-60 disabled:hover:transform-none group"
              >
                {isSubmitting ? "Submitting..." : "Submit Verification"}
                {!isSubmitting && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
