"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { CheckCircle2, ChevronRight, ChevronLeft, UploadCloud, Info, Clock } from "lucide-react";

type VerificationRequest = {
  _id: string;
  status: "pending" | "more_info_required" | "approved" | "rejected";
  rejectionReason?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  legalName?: string;
  storeName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  aboutBusiness?: string;
  gstNumber?: string;
  businessRegistrationNumber?: string;
  businessName?: string;
};

type VerificationFormProps = {
  initialRequest: VerificationRequest | null;
  initialRole: "user" | "verifiedSeller" | "admin";
  initialStoreName?: string;
};

async function uploadVerificationFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads/verification-doc", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as { publicId?: string; message?: string } | null;

  if (!response.ok || !data?.publicId) {
    throw new Error(data?.message ?? "Upload failed.");
  }

  return data.publicId;
}

export function VerificationForm({ initialRequest, initialRole, initialStoreName }: VerificationFormProps) {
  const [request, setRequest] = useState<VerificationRequest | null>(initialRequest);
  
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form State
  const [legalName, setLegalName] = useState(request?.legalName || "");
  const [dateOfBirth, setDateOfBirth] = useState(request?.dateOfBirth ? new Date(request.dateOfBirth).toISOString().split('T')[0] : "");
  const [storeName, setStoreName] = useState(request?.storeName || initialStoreName || "");
  const [phone, setPhone] = useState(request?.phone || "");
  const [address, setAddress] = useState(request?.address || "");
  const [city, setCity] = useState(request?.city || "");
  const [state, setState] = useState(request?.state || "");
  const [pincode, setPincode] = useState(request?.pincode || "");
  const [businessName, setBusinessName] = useState(request?.businessName || "");
  const [aboutBusiness, setAboutBusiness] = useState(request?.aboutBusiness || "");
  const [gstNumber, setGstNumber] = useState(request?.gstNumber || "");
  const [businessRegNumber, setBusinessRegNumber] = useState(request?.businessRegistrationNumber || "");
  
  // Files
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [businessProofFile, setBusinessProofFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isVerified = initialRole === "verifiedSeller" || initialRole === "admin";
  const isPending = request?.status === "pending";

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== totalSteps) {
      nextStep();
      return;
    }

    setError(null);
    setSuccess(null);

    // If it's a new request, ID proof is required. If resubmitting, they might not re-upload if we support it.
    // For MVP: Force re-upload on resubmission for simplicity.
    if (!idProofFile) {
      setError("ID proof file is strictly required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const idProofUrl = await uploadVerificationFile(idProofFile);
      const businessProofUrl = businessProofFile ? await uploadVerificationFile(businessProofFile) : null;
      const selfieUrl = selfieFile ? await uploadVerificationFile(selfieFile) : null;

      const response = await fetch("/api/verification-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName,
          dateOfBirth,
          storeName,
          phone,
          address,
          city,
          state,
          pincode,
          businessName: businessName || null,
          aboutBusiness: aboutBusiness || null,
          gstNumber: gstNumber || null,
          businessRegistrationNumber: businessRegNumber || null,
          idProofUrl,
          businessProofUrl,
          selfieUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit verification request.");
      }

      setRequest(data.request);
      setSuccess("Verification request submitted successfully.");
    } catch (submitError: any) {
      setError(submitError.message);
    }

    setIsSubmitting(false);
  }

  const renderStepIndicators = () => (
    <div className="flex items-center justify-between mb-8 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--color-outline-variant)]/30 -z-10 rounded-full"></div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--color-primary)] transition-all duration-300 -z-10 rounded-full" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}></div>
      
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] transition-all duration-300 ${s < step ? 'bg-[var(--color-primary)] text-white' : s === step ? 'bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-primary-container)]' : 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]'}`}>
          {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
        </div>
      ))}
    </div>
  );

  if (isVerified) {
    return (
      <div className="bg-[var(--color-surface-container-lowest)] rounded-[3rem] p-[32px] card-shadow">
        <div className="mt-4 rounded-[2rem] bg-emerald-50 p-6 border border-emerald-100 flex flex-col items-center justify-center text-center gap-3">
          <span className="material-symbols-outlined text-[64px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <h2 className="text-[24px] font-bold text-emerald-800">Verified Seller Account</h2>
          <p className="text-[16px] text-emerald-700 max-w-lg">
            Your identity has been fully verified. Your verified badge is currently active across PawHub.
          </p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="bg-[var(--color-surface-container-lowest)] rounded-[3rem] p-[32px] card-shadow">
        <div className="mt-4 rounded-[2rem] bg-amber-50 p-6 border border-amber-200 flex flex-col items-center justify-center text-center gap-3">
          <Clock className="w-16 h-16 text-amber-500 mb-2" />
          <h2 className="text-[24px] font-bold text-amber-800">Verification Under Review</h2>
          <p className="text-[16px] text-amber-700 max-w-lg">
            Our team is reviewing your documents. This process usually takes 2-3 business days. We will notify you once a decision is made.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface-container-lowest)] rounded-[3rem] p-[32px] card-shadow relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"></div>
      
      {request && (request.status === "rejected" || request.status === "more_info_required") && (
        <div className={`mb-8 rounded-[1.5rem] p-5 flex items-start gap-4 ${request.status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
          <Info className={`w-6 h-6 mt-0.5 ${request.status === 'rejected' ? 'text-red-600' : 'text-orange-600'}`} />
          <div>
            <h3 className={`font-bold text-[18px] ${request.status === 'rejected' ? 'text-red-800' : 'text-orange-800'}`}>
              {request.status === 'rejected' ? 'Verification Rejected' : 'More Information Required'}
            </h3>
            <p className={`mt-1 text-[15px] ${request.status === 'rejected' ? 'text-red-700' : 'text-orange-700'}`}>
              Admin Note: {request.adminNotes || request.rejectionReason}
            </p>
            <p className={`mt-2 text-[14px] font-medium ${request.status === 'rejected' ? 'text-red-600' : 'text-orange-600'}`}>
              Please update your information below and resubmit.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h2 className="text-[32px] leading-[1.2] font-bold text-[var(--color-on-surface)] mb-2">Seller Application</h2>
        <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)]">
          Complete the following steps to submit your profile for verification.
        </p>
      </div>

      {renderStepIndicators()}

      <form onSubmit={handleSubmit} className="mt-8 min-h-[300px] flex flex-col">
        {/* STEP 1: Personal */}
        {step === 1 && (
          <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2 text-[var(--color-on-surface)]"><span className="material-symbols-outlined text-[var(--color-primary)]">person</span> Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-semibold text-[var(--color-on-surface)] mb-2">Legal Full Name</label>
                <input required value={legalName} onChange={(e) => setLegalName(e.target.value)} className="w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="As it appears on your Government ID" />
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-[var(--color-on-surface)] mb-2">Date of Birth</label>
                <input required type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Store */}
        {step === 2 && (
          <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
             <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2 text-[var(--color-on-surface)]"><span className="material-symbols-outlined text-[var(--color-primary)]">storefront</span> Store Identity</h3>
             <div>
                <label className="block text-[14px] font-semibold text-[var(--color-on-surface)] mb-2">Store Name</label>
                <input required value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="e.g. Royal Paws Kennels" />
                <p className="text-xs text-[var(--color-outline)] mt-2 flex items-center gap-1"><Info className="w-3 h-3" /> Must be unique across PawHub. Cannot be changed after approval.</p>
             </div>
          </div>
        )}

        {/* STEP 3: Contact */}
        {step === 3 && (
          <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
             <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2 text-[var(--color-on-surface)]"><span className="material-symbols-outlined text-[var(--color-primary)]">contact_mail</span> Contact & Address</h3>
             <div className="grid md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-[14px] font-semibold text-[var(--color-on-surface)] mb-2">Phone Number</label>
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="+91 9876543210" />
               </div>
               <div>
                  <label className="block text-[14px] font-semibold text-[var(--color-on-surface)] mb-2">Complete Address</label>
                  <input required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="Flat, Building, Street" />
               </div>
             </div>
             <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-[14px] font-semibold text-[var(--color-on-surface)] mb-2">City</label>
                  <input required value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[var(--color-on-surface)] mb-2">State</label>
                  <input required value={state} onChange={(e) => setState(e.target.value)} className="w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="Maharashtra" />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[var(--color-on-surface)] mb-2">Pincode</label>
                  <input required value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="400001" />
                </div>
             </div>
          </div>
        )}

        {/* STEP 4: Business (Optional) */}
        {step === 4 && (
          <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
             <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2 text-[var(--color-on-surface)]"><span className="material-symbols-outlined text-[var(--color-primary)]">business_center</span> Business Details <span className="text-sm text-[var(--color-outline)] font-normal">(Optional)</span></h3>
             <div className="grid md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-[14px] font-semibold text-[var(--color-on-surface)] mb-2">Registered Business Name</label>
                  <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="Leave blank if individual" />
               </div>
               <div>
                  <label className="block text-[14px] font-semibold text-[var(--color-on-surface)] mb-2">GST Number</label>
                  <input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className="w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="22AAAAA0000A1Z5" />
               </div>
             </div>
             <div>
                <label className="block text-[14px] font-semibold text-[var(--color-on-surface)] mb-2">Business Registration / KCI Number</label>
                <input value={businessRegNumber} onChange={(e) => setBusinessRegNumber(e.target.value)} className="w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="Registration ID" />
             </div>
             <div>
                <label className="block text-[14px] font-semibold text-[var(--color-on-surface)] mb-2">About Your Business / Breeding Practices</label>
                <textarea value={aboutBusiness} onChange={(e) => setAboutBusiness(e.target.value)} className="w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 min-h-[100px] focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="Briefly describe your experience and standards..."></textarea>
             </div>
          </div>
        )}

        {/* STEP 5: Documents */}
        {step === 5 && (
          <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
             <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2 text-[var(--color-on-surface)]"><span className="material-symbols-outlined text-[var(--color-primary)]">badge</span> Identity Verification</h3>
             <p className="text-sm text-[var(--color-on-surface-variant)] mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100 flex gap-2"><Info className="w-5 h-5 text-blue-500 shrink-0"/> Uploads are highly secured and stored privately. Only authorized admins will review them.</p>
             
             <div className="grid md:grid-cols-3 gap-6">
                {/* ID Proof Dropzone */}
                <div className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group transition-all duration-300 ${idProofFile ? 'border-[var(--color-primary)] bg-[var(--color-primary-container)]/10' : 'border-[var(--color-outline-variant)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'}`}>
                  <input required id="idProof" type="file" accept="image/*,application/pdf" onChange={(e) => setIdProofFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <UploadCloud className={`w-10 h-10 mb-3 ${idProofFile ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)]'}`} />
                  <h3 className="text-[14px] font-bold line-clamp-1">{idProofFile ? idProofFile.name : "Government ID Proof *"}</h3>
                  <p className="text-[12px] text-[var(--color-outline)] mt-1">Aadhaar, PAN, or Driving Licence</p>
                </div>

                {/* Business Proof Dropzone */}
                <div className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group transition-all duration-300 ${businessProofFile ? 'border-[var(--color-primary)] bg-[var(--color-primary-container)]/10' : 'border-[var(--color-outline-variant)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'}`}>
                  <input id="bizProof" type="file" accept="image/*,application/pdf" onChange={(e) => setBusinessProofFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <UploadCloud className={`w-10 h-10 mb-3 ${businessProofFile ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)]'}`} />
                  <h3 className="text-[14px] font-bold line-clamp-1">{businessProofFile ? businessProofFile.name : "Business Proof (Optional)"}</h3>
                  <p className="text-[12px] text-[var(--color-outline)] mt-1">GST / Reg Certificate</p>
                </div>

                {/* Selfie Dropzone */}
                <div className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group transition-all duration-300 ${selfieFile ? 'border-[var(--color-primary)] bg-[var(--color-primary-container)]/10' : 'border-[var(--color-outline-variant)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'}`}>
                  <input id="selfie" type="file" accept="image/*" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <UploadCloud className={`w-10 h-10 mb-3 ${selfieFile ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)]'}`} />
                  <h3 className="text-[14px] font-bold line-clamp-1">{selfieFile ? selfieFile.name : "Selfie with ID (Optional)"}</h3>
                  <p className="text-[12px] text-[var(--color-outline)] mt-1">Hold ID next to your face</p>
                </div>
             </div>

             {error && <p className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mt-4">{error}</p>}
             {success && <p className="text-sm font-bold text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100 mt-4">{success}</p>}
          </div>
        )}

        {/* Form Controls */}
        <div className="mt-12 flex items-center justify-between border-t border-[var(--color-outline-variant)]/20 pt-6">
          <button type="button" onClick={prevStep} disabled={step === 1 || isSubmitting} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors disabled:opacity-0 disabled:pointer-events-none">
             <ChevronLeft className="w-5 h-5" /> Back
          </button>
          
          <button type="submit" disabled={isSubmitting} className="btn-gradient flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white transition-all disabled:opacity-70 group hover-scale shadow-lg shadow-[var(--color-primary)]/20">
             {isSubmitting ? "Uploading Securely..." : step === totalSteps ? "Submit Application" : "Next Step"}
             {!isSubmitting && step !== totalSteps && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
             {!isSubmitting && step === totalSteps && <CheckCircle2 className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}
