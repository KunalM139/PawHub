const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/(dashboard)/seller-dashboard/settings/page.tsx');

const newCode = `"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export default function SellerSettingsPage() {
  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    upiId: "",
    upiQrCode: "",
    storePolicies: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/user");
      const data = await res.json().catch(() => null);
      if (res.ok && data?.user) {
        setFormData({
          storeName: data.user.storeName || "",
          storeDescription: data.user.storeDescription || "",
          upiId: data.user.upiId || "",
          upiQrCode: data.user.upiQrCode || "",
          storePolicies: data.user.storePolicies || "",
        });
      }
      setIsLoading(false);
    }
    fetchUser();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccess(false);

    const res = await fetch("/api/seller/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      toast.success("Settings saved successfully!");
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to save settings");
    }
    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="size-12 rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] animate-spin" />
        <p className="text-[var(--color-on-surface-variant)] font-outfit text-[16px] font-semibold animate-pulse">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)] space-y-8 max-w-[1000px] mx-auto w-full pb-24">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] md:text-[36px] leading-[1.2] font-semibold text-[var(--color-on-surface)] tracking-tight">Store Settings</h1>
        <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)] max-w-2xl">
          Manage your business profile, payment methods, and policies to provide the best experience for your customers.
        </p>
      </header>

      <div className="bg-[var(--color-surface-container-lowest)] rounded-[2rem] p-6 md:p-10 card-shadow border border-[var(--color-outline-variant)]/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 rounded-bl-full -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 rounded-tr-full -z-10 pointer-events-none" />

        <div className="mb-10">
          <h2 className="text-[24px] md:text-[28px] font-bold text-[var(--color-on-surface)] tracking-tight mb-2">General Information</h2>
          <p className="text-[16px] text-[var(--color-on-surface-variant)]">Keep your store information up to date.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
          
          {/* Store Info Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-outline-variant)]/20">
              <div className="size-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shadow-sm">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>store</span>
              </div>
              <h3 className="text-[20px] font-bold text-[var(--color-on-surface)]">Store Identity</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[14px] font-bold tracking-wide text-[var(--color-outline)] uppercase mb-2">Store Name</label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  placeholder="e.g. Paw Palace, Furry Friends Shop"
                  className="w-full h-14 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 px-5 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:bg-[var(--color-surface-container-lowest)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 placeholder:text-[var(--color-outline-variant)] hover:border-[var(--color-outline-variant)]/60"
                />
              </div>

              <div>
                <label className="block text-[14px] font-bold tracking-wide text-[var(--color-outline)] uppercase mb-2">Store Description</label>
                <textarea
                  rows={4}
                  value={formData.storeDescription}
                  onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                  placeholder="Tell customers about your shop, experience, and what you specialize in..."
                  className="w-full rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 px-5 py-4 text-[16px] text-[var(--color-on-surface)] outline-none transition-all focus:bg-[var(--color-surface-container-lowest)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 placeholder:text-[var(--color-outline-variant)] hover:border-[var(--color-outline-variant)]/60 resize-y min-h-[120px]"
                />
              </div>
            </div>
          </section>

          {/* Payment Info Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-outline-variant)]/20">
              <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>credit_card</span>
              </div>
              <h3 className="text-[20px] font-bold text-[var(--color-on-surface)]">Payment & Payouts</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[14px] font-bold tracking-wide text-[var(--color-outline)] uppercase mb-1">Business UPI ID</label>
                <p className="text-[13px] text-[var(--color-on-surface-variant)] mb-3">Used for UPI on Delivery orders. Customers will use this UPI ID to pay you directly.</p>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] material-symbols-outlined text-[20px]">account_balance_wallet</span>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="e.g. yourname@okaxis"
                    className="w-full h-14 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 pl-12 pr-5 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:bg-[var(--color-surface-container-lowest)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 placeholder:text-[var(--color-outline-variant)] hover:border-[var(--color-outline-variant)]/60 font-mono"
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20">
                <label className="block text-[14px] font-bold tracking-wide text-[var(--color-outline)] uppercase mb-1">UPI QR Code (Optional)</label>
                <p className="text-[13px] text-[var(--color-on-surface-variant)] mb-5">Upload your UPI QR code image to let buyers pay by scanning during delivery.</p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {formData.upiQrCode ? (
                    <div className="relative group">
                      <div className="size-32 rounded-[1.5rem] bg-white p-3 shadow-sm border border-[var(--color-outline-variant)]/30 overflow-hidden relative transition-transform group-hover:scale-105 duration-300">
                        <img src={formData.upiQrCode} alt="UPI QR" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="text-white text-[12px] font-bold tracking-wider uppercase">Uploaded</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, upiQrCode: "" })}
                        className="absolute -top-3 -right-3 size-8 bg-white border border-rose-200 text-rose-500 rounded-full flex items-center justify-center shadow-md hover:bg-rose-50 hover:text-rose-600 hover:scale-110 transition-all z-10"
                        title="Remove QR Code"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  ) : (
                    <div className="size-32 rounded-[1.5rem] bg-[var(--color-surface-container)] border-2 border-dashed border-[var(--color-outline-variant)] flex flex-col items-center justify-center text-[var(--color-on-surface-variant)] gap-2">
                       <span className="material-symbols-outlined text-[32px] opacity-50">qr_code_scanner</span>
                    </div>
                  )}
                  
                  <div className="flex-1 w-full">
                    <label className="relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-primary-container)]/5 px-6 py-4 text-center font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-container)]/10 transition-colors border-dashed hover-scale">
                      <span className="material-symbols-outlined text-[20px]">upload_file</span>
                      <span>Choose QR Image File</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const uploadData = new FormData();
                          uploadData.append("file", file);
                          
                          const toastId = toast.loading("Uploading QR code...");
                          
                          try {
                            const uploadRes = await fetch("/api/uploads/upi-qr", {
                              method: "POST",
                              body: uploadData,
                            });
                            
                            const uploadJson = await uploadRes.json();
                            
                            if (uploadRes.ok) {
                              setFormData({ ...formData, upiQrCode: uploadJson.secureUrl });
                              toast.success("QR code uploaded successfully!", { id: toastId });
                            } else {
                              throw new Error(uploadJson.message || "Failed to upload");
                            }
                          } catch (err: any) {
                            toast.error(err.message, { id: toastId });
                          }
                        }}
                      />
                    </label>
                    <p className="text-[12px] text-[var(--color-outline)] mt-3 text-center sm:text-left">
                      Supports JPG, PNG and WEBP. Maximum file size 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Policies Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-outline-variant)]/20">
              <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              </div>
              <h3 className="text-[20px] font-bold text-[var(--color-on-surface)]">Store Policies</h3>
            </div>
            
            <div>
              <label className="block text-[14px] font-bold tracking-wide text-[var(--color-outline)] uppercase mb-2">Shipping & Return Policy</label>
              <textarea
                rows={5}
                value={formData.storePolicies}
                onChange={(e) => setFormData({ ...formData, storePolicies: e.target.value })}
                placeholder="Explain your shipping times, return policies, and guarantees..."
                className="w-full rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 px-5 py-4 text-[16px] text-[var(--color-on-surface)] outline-none transition-all focus:bg-[var(--color-surface-container-lowest)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 placeholder:text-[var(--color-outline-variant)] hover:border-[var(--color-outline-variant)]/60 resize-y min-h-[120px]"
              />
            </div>
          </section>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-6 border-t border-[var(--color-outline-variant)]/20 mt-12">
            {showSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-5 py-3 rounded-full text-[14px] font-bold tracking-wide shadow-sm animate-in zoom-in duration-300">
                <CheckCircle2 className="size-5" /> Settings Saved
              </div>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto h-14 px-10 rounded-full btn-gradient text-[var(--color-on-primary)] font-bold tracking-wide text-[16px] shadow-md hover:shadow-lg disabled:opacity-50 hover-scale flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="size-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(filePath, newCode, 'utf8');
console.log('Successfully updated Seller Settings page layout');
