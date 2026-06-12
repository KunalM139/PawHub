"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Mail, MapPin, Phone, Shield, User, XCircle, Pencil, X, Save } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

type ProfileData = {
  name: string;
  email: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const fields = [
    { label: "Name", value: profile.name, icon: User },
    { label: "Email", value: profile.email, icon: Mail },
    {
      label: "Phone",
      value: profile.phone || "Not set",
      icon: Phone,
      badge: profile.isPhoneVerified
        ? { label: "Verified", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
        : { label: "Unverified", color: "text-amber-700 bg-amber-50 border-amber-200" },
    },
    {
      label: "Location",
      value: [profile.city, profile.state].filter(Boolean).join(", ") || "Not set",
      icon: MapPin,
    },
    {
      label: "Role",
      value: profile.role === "verifiedSeller" ? "Verified Seller" : profile.role === "admin" ? "Admin" : "User",
      icon: Shield,
    },
  ];

  return (
    <DashboardCard
      title="Profile Information"
      action={
        !isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-orange-50 px-4 text-xs font-bold text-orange-600 transition hover:bg-orange-100"
          >
            <Pencil className="size-3" />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-100 px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
          >
            <X className="size-3" />
            Cancel
          </button>
        )
      }
    >
      {isEditing ? (
        <div className="space-y-4 p-2">
          {error && <p className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
              Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
              Phone
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                City
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                State
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </label>
            </div>
          </div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
            Bio
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="mt-2 h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
            />
          </label>
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-orange-500 px-6 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:opacity-50"
            >
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.label} className="flex items-center gap-4 py-4">
                <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50">
                  <Icon className="size-4 text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {field.label}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {field.value}
                  </p>
                </div>
                {"badge" in field && field.badge && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${field.badge.color}`}
                  >
                    {field.badge.label === "Verified" ? (
                      <CheckCircle2 className="size-3" />
                    ) : (
                      <XCircle className="size-3" />
                    )}
                    {field.badge.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
