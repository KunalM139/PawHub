const fs = require('fs');
const path = require('path');

const pagePath = path.resolve('src/app/(dashboard)/dashboard/profile/page.tsx');
const managerPath = path.resolve('src/components/dashboard/profile-manager.tsx');

const newPageCode = `import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { ProfileManager } from "@/components/dashboard/profile-manager";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";

export const metadata: Metadata = {
  title: "Profile | PawHub",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const profile = await UserModel.findById(session.user.id)
    .select("name email image role phone city state bio isPhoneVerified userType")
    .lean();

  if (!profile) return null;

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)]">
      <main className="max-w-[1000px] mx-auto p-4 md:p-8 flex flex-col gap-8">
        <header className="mb-2">
          <h1 className="text-[32px] leading-[1.2] font-semibold text-[var(--color-on-surface)] mb-2">My Profile</h1>
          <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)]">Manage your personal information and account settings</p>
        </header>

        <ProfileManager profile={{
          name: profile.name as string,
          email: profile.email as string,
          image: (profile.image as string) || null,
          phone: profile.phone as string | undefined,
          city: profile.city as string | undefined,
          state: profile.state as string | undefined,
          bio: profile.bio as string | undefined,
          role: profile.role as string,
          userType: profile.userType as string,
          isPhoneVerified: !!profile.isPhoneVerified,
        }} />
      </main>
    </div>
  );
}
`;

const newManagerCode = `"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

type ProfileData = {
  name: string;
  email: string;
  image: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  bio?: string | null;
  role: string;
  userType: string;
  isPhoneVerified: boolean;
};

type ProfileManagerProps = {
  profile: ProfileData;
};

export function ProfileManager({ profile }: ProfileManagerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    city: profile.city || "",
    state: profile.state || "",
    bio: profile.bio || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          city: form.city || null,
          state: form.state || null,
          bio: form.bio || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update profile");
      }

      setIsEditing(false);
      toast.success("Profile updated successfully");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfileImage = async (imageUrl: string | null) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
      });
      if (!res.ok) throw new Error("Failed to update profile image");
      toast.success(imageUrl ? "Profile photo updated" : "Profile photo removed");
      router.refresh();
    } catch (err) {
      toast.error("Failed to update profile image");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("resourceType", "image");

      const uploadRes = await fetch("/api/uploads/pet-media", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { secureUrl } = await uploadRes.json();

      await updateProfileImage(secureUrl);
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageRemove = () => {
    if (confirm("Are you sure you want to remove your profile photo?")) {
      updateProfileImage(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
  };

  const fields = [
    { label: "Name", value: profile.name, icon: "person" },
    { label: "Email", value: profile.email, icon: "mail" },
    {
      label: "Phone",
      value: profile.phone || "Not set",
      icon: "call",
      badge: profile.isPhoneVerified
        ? { label: "Verified", icon: "verified", bg: "bg-emerald-500/10", text: "text-emerald-600" }
        : { label: "Unverified", icon: "error", bg: "bg-amber-500/10", text: "text-amber-600" },
    },
    {
      label: "Location",
      value: [profile.city, profile.state].filter(Boolean).join(", ") || "Not set",
      icon: "location_on",
    },
    {
      label: "Role",
      value: profile.role === "verifiedSeller" ? "Verified Seller" : profile.role === "admin" ? "Admin" : "Pet Owner",
      icon: "shield",
      badge: profile.role === "verifiedSeller" 
        ? { label: "Trusted", icon: "verified_user", bg: "bg-[var(--color-primary)]/10", text: "text-[var(--color-primary)]" } 
        : null
    },
  ];

  return (
    <div className="space-y-8 font-outfit">
      {/* Profile Header Card */}
      <div className="bg-[var(--color-surface-container-lowest)] rounded-[1.5rem] border border-[var(--color-outline-variant)]/30 card-shadow p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent pointer-events-none rounded-[1.5rem]" />
        
        {/* Avatar Upload Section */}
        <div className="relative group/avatar shrink-0 z-10">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
          
          <div className="size-28 md:size-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-md relative bg-[var(--color-surface-container)]">
            {isUploading ? (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                <div className="size-8 border-4 border-white/20 border-t-white rounded-full animate-spin mb-2" />
                <span className="text-[12px] font-bold">Uploading...</span>
              </div>
            ) : null}
            
            {profile.image ? (
              <img src={profile.image} alt={profile.name} className="size-full object-cover" />
            ) : (
              <div className="size-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-[36px] font-black text-white">
                {getInitials(profile.name)}
              </div>
            )}

            {/* Hover overlay for changing photo */}
            {!isUploading && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white backdrop-blur-[2px] transition-all duration-300 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[32px] mb-1">photo_camera</span>
                <span className="text-[12px] font-bold tracking-wider uppercase">Change</span>
              </button>
            )}
          </div>
          
          {/* Quick Action Button */}
          {!isUploading && (
            profile.image ? (
              <button 
                onClick={handleImageRemove}
                title="Remove Photo"
                className="absolute -bottom-2 -right-2 size-10 rounded-full bg-white text-rose-500 shadow-md border border-slate-100 flex items-center justify-center hover:bg-rose-50 transition-colors z-20 hover:scale-110"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo"
                className="absolute -bottom-2 -right-2 size-10 rounded-full bg-[var(--color-primary)] text-white shadow-md border-2 border-white flex items-center justify-center hover:brightness-110 transition-colors z-20 hover:scale-110"
              >
                <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
              </button>
            )
          )}
        </div>

        {/* User Info Section */}
        <div className="flex-1 text-center md:text-left z-10">
          <h2 className="text-[28px] md:text-[32px] font-black text-[var(--color-on-surface)] leading-tight tracking-tight mb-2">
            {profile.name}
          </h2>
          <p className="text-[16px] text-[var(--color-on-surface-variant)] leading-relaxed max-w-2xl">
            {profile.bio ? profile.bio : "Add a short bio to let others know more about you."}
          </p>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="bg-[var(--color-surface-container-lowest)] rounded-[1.5rem] border border-[var(--color-outline-variant)]/30 card-shadow overflow-hidden">
        <div className="border-b border-[var(--color-outline-variant)]/30 px-6 py-5 flex items-center justify-between bg-[var(--color-surface-container-low)]/30">
          <h3 className="text-[18px] font-bold text-[var(--color-on-surface)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-primary)]">badge</span>
            Profile Information
          </h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-5 text-[14px] font-bold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)]/20 hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit Details
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--color-surface-container-high)] px-5 text-[14px] font-bold text-[var(--color-on-surface)] transition-all hover:brightness-95 hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Cancel
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-[14px] font-bold">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}
            
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block group">
                <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </label>
              
              <label className="block group">
                <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </label>
              
              <label className="block group">
                <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block group">
                  <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">City</span>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </label>
                <label className="block group">
                  <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">State</span>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="h-14 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </label>
              </div>
            </div>
            
            <label className="block group">
              <span className="block text-[12px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Bio</span>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="h-32 w-full rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] p-4 text-[16px] font-semibold text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 resize-none leading-relaxed"
                placeholder="Tell people a little bit about yourself..."
              />
            </label>
            
            <div className="flex justify-end pt-4 border-t border-[var(--color-outline-variant)]/30">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full btn-gradient px-8 text-[15px] font-bold text-white shadow-md transition-all hover:shadow-lg hover-scale disabled:opacity-50 disabled:grayscale"
              >
                {isSaving ? (
                  <>
                    <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2 sm:p-4">
            {fields.map((field, idx) => (
              <div key={field.label} className={\`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 rounded-2xl transition-colors hover:bg-[var(--color-surface-container)]/30 \${idx !== fields.length - 1 ? 'border-b border-[var(--color-outline-variant)]/10' : ''}\`}>
                <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
                  <span className="material-symbols-outlined text-[20px] text-[var(--color-primary)]" style={{ fontVariationSettings: "'FILL' 1" }}>{field.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">
                    {field.label}
                  </p>
                  <p className="text-[16px] font-bold text-[var(--color-on-surface)] leading-tight">
                    {field.value}
                  </p>
                </div>
                {"badge" in field && field.badge && (
                  <span
                    className={\`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest border border-white/50 \${field.badge.bg} \${field.badge.text}\`}
                  >
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{field.badge.icon}</span>
                    {field.badge.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync(pagePath, newPageCode, 'utf8');
fs.writeFileSync(managerPath, newManagerCode, 'utf8');

console.log("Successfully redesigned profile page and added photo upload functionality");
