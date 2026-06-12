"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { BadgeCheck, PhoneCall, UserCircle2 } from "lucide-react";

import { getCitiesForState, stateOptions } from "@/lib/locations";

type Profile = {
  name: string;
  email: string;
  image?: string | null;
  role: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  bio?: string | null;
  isPhoneVerified?: boolean;
  userIntent?: string;
};

type Props = {
  initialProfile: Profile;
};

const phoneRegex = /^[0-9+][0-9\s-]{7,19}$/;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

async function uploadProfileImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("resourceType", "image");

  const response = await fetch("/api/uploads/pet-media", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | { secureUrl?: string; message?: string }
    | null;

  if (!response.ok || !data?.secureUrl) {
    throw new Error(data?.message ?? "Unable to upload image.");
  }

  return data.secureUrl;
}

export function ProfileWorkspace({ initialProfile }: Props) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState(initialProfile.name);
  const [profileEmail, setProfileEmail] = useState(initialProfile.email);
  const [profileImage, setProfileImage] = useState(initialProfile.image ?? "");
  const [profilePhone, setProfilePhone] = useState(initialProfile.phone ?? "");
  const [profileCity, setProfileCity] = useState(initialProfile.city ?? "");
  const [profileState, setProfileState] = useState(initialProfile.state ?? "");
  const [profileBio, setProfileBio] = useState(initialProfile.bio ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const initials = useMemo(() => getInitials(profile.name), [profile.name]);
  const cityOptions = useMemo(() => getCitiesForState(profileState), [profileState]);

  function validateProfile() {
    if (profileName.trim().length < 2) {
      return "Name must be at least 2 characters.";
    }

    if (!profileEmail.includes("@")) {
      return "Enter a valid email address.";
    }

    if (profilePhone && !phoneRegex.test(profilePhone)) {
      return "Enter a valid phone number.";
    }

    if (profileCity && profileCity.length > 80) {
      return "City must be 80 characters or less.";
    }

    if (profileState && profileState.length > 80) {
      return "State must be 80 characters or less.";
    }

    if (profileBio && profileBio.length > 280) {
      return "Bio must be 280 characters or less.";
    }

    if (newPassword && newPassword.length < 8) {
      return "New password must be at least 8 characters.";
    }

    return null;
  }

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const validationError = validateProfile();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSaving(true);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: profileName,
        email: profileEmail,
        image: profileImage || null,
        phone: profilePhone,
        city: profileCity,
        state: profileState,
        bio: profileBio,
        newPassword: newPassword || undefined,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | { profile?: Profile; message?: string }
      | null;

    if (!response.ok || !data?.profile) {
      setFormError(data?.message ?? "Unable to update profile.");
      setIsSaving(false);
      return;
    }

    setProfile(data.profile);
    setProfileName(data.profile.name);
    setProfileEmail(data.profile.email);
    setProfileImage(data.profile.image ?? "");
    setProfilePhone(data.profile.phone ?? "");
    setProfileCity(data.profile.city ?? "");
    setProfileState(data.profile.state ?? "");
    setProfileBio(data.profile.bio ?? "");
    setNewPassword("");
    setFormSuccess("Profile updated.");
    setIsSaving(false);
  }

  async function handleSendOtp() {
    setOtpError(null);
    setOtpNotice(null);

    if (!profilePhone || !phoneRegex.test(profilePhone)) {
      setOtpError("Add a valid phone number first.");
      return;
    }

    setIsSendingOtp(true);

    const response = await fetch("/api/otp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: profilePhone }),
    });

    const data = (await response.json().catch(() => null)) as
      | { message?: string; otp?: string }
      | null;

    if (!response.ok) {
      setOtpError(data?.message ?? "Unable to send OTP.");
      setIsSendingOtp(false);
      return;
    }

    const notice = data?.otp
      ? `OTP sent. Dev code: ${data.otp}`
      : data?.message ?? "OTP sent.";
    setOtpNotice(notice);
    setOtpCode("");
    setIsSendingOtp(false);
  }

  async function handleVerifyOtp() {
    setOtpError(null);
    setOtpNotice(null);

    if (!otpCode.trim()) {
      setOtpError("Enter the OTP sent to your phone.");
      return;
    }

    setIsVerifyingOtp(true);

    const response = await fetch("/api/otp/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp: otpCode.trim() }),
    });

    const data = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    if (!response.ok) {
      setOtpError(data?.message ?? "Unable to verify OTP.");
      setIsVerifyingOtp(false);
      return;
    }

    setProfile((current) => ({
      ...current,
      isPhoneVerified: true,
    }));
    setOtpNotice(data?.message ?? "Phone verified.");
    setOtpCode("");
    setIsVerifyingOtp(false);
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setIsUploadingImage(true);

    try {
      const uploadedUrl = await uploadProfileImage(file);
      setProfileImage(uploadedUrl);
      setFormSuccess("Profile photo uploaded.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">My Profile</h1>
            <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
              Review your account details, verification status, and contact information.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing((current) => !current)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-semibold"
          >
            {isEditing ? "Close Editor" : "Edit Profile"}
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl bg-[var(--color-surface-muted)] p-5">
            <div className="flex items-center gap-4">
              <div className="relative size-16 overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
                {profile.image ? (
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    fill
                    unoptimized
                    loader={({ src }) => src}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-base font-bold">
                    {initials || <UserCircle2 className="size-8 text-[var(--color-foreground-muted)]" />}
                  </div>
                )}
              </div>
              <div>
                <p className="text-lg font-bold">{profile.name}</p>
                <p className="text-sm text-[var(--color-foreground-muted)]">{profile.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-white px-2.5 py-1 font-semibold uppercase tracking-wide">
                    {profile.role}
                  </span>
                  {profile.isPhoneVerified ? (
                    <span className="rounded-full bg-[#e8fff0] px-2.5 py-1 font-semibold text-[#176a37]">
                      Phone Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#fff1f1] px-2.5 py-1 font-semibold text-[#9d2222]">
                      Phone Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-foreground-subtle)]">
                  Phone
                </dt>
                <dd className="font-semibold">{profile.phone || "Not added"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-foreground-subtle)]">
                  City
                </dt>
                <dd className="font-semibold">{profile.city || "Not added"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-foreground-subtle)]">
                  State
                </dt>
                <dd className="font-semibold">{profile.state || "Not added"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-foreground-subtle)]">
                  Bio
                </dt>
                <dd className="text-[var(--color-foreground-muted)]">
                  {profile.bio || "Share your pet journey to build trust."}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-foreground-subtle)]">
                  Intent
                </dt>
                <dd className="font-semibold">
                  {profile.userIntent === "seller"
                    ? "Seller posting pets"
                    : profile.userIntent === "rehome"
                      ? "Rehoming a pet"
                      : "Adopting a pet"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BadgeCheck className="size-4 text-[var(--color-primary)]" />
              Trust & Verification
            </div>
            <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
              Phone-verified sellers receive higher visibility and trust badges on listings.
            </p>

            {profile.isPhoneVerified ? (
              <div className="mt-4 rounded-2xl bg-[#e8fff0] p-4 text-sm font-semibold text-[#176a37]">
                Your phone number is verified. Listings will carry the verified badge.
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-black/5 bg-[var(--color-surface-muted)] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <PhoneCall className="size-4 text-[var(--color-primary)]" />
                  Verify your phone to post listings.
                </div>
                <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">
                  We will send a one-time code to confirm your number.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSendOtp()}
                    disabled={isSendingOtp}
                    className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--color-primary)] px-4 text-xs font-semibold text-[var(--color-primary-foreground)] disabled:opacity-60"
                  >
                    {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                  </button>
                  <input
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value)}
                    placeholder="Enter OTP"
                    className="h-9 w-32 rounded-full border border-black/10 bg-white px-3 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => void handleVerifyOtp()}
                    disabled={isVerifyingOtp}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 px-4 text-xs font-semibold disabled:opacity-60"
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify"}
                  </button>
                </div>
                {otpNotice ? (
                  <p className="mt-2 text-xs font-semibold text-emerald-700">{otpNotice}</p>
                ) : null}
                {otpError ? (
                  <p className="mt-2 text-xs font-semibold text-red-600">{otpError}</p>
                ) : null}
              </div>
            )}

            <div className="mt-4 rounded-2xl bg-[var(--color-surface-muted)] p-4 text-xs text-[var(--color-foreground-muted)]">
              Seller verification is managed from
              {" "}
              <Link href="/seller-verification" className="font-semibold text-[var(--color-primary)]">
                Seller Verification
              </Link>
              .
            </div>
          </div>
        </div>
      </section>

      {isEditing ? (
        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-black tracking-tight">Edit Profile Details</h2>
          <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
            Keep your details up to date so buyers can trust you.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleProfileSave}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Full Name
                <input
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
                  required
                />
              </label>
              <label className="block text-sm font-semibold">
                Email
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(event) => setProfileEmail(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Phone Number
                <input
                  value={profilePhone}
                  onChange={(event) => setProfilePhone(event.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
                />
              </label>
              <label className="block text-sm font-semibold">
                City
                <input
                  value={profileCity}
                  onChange={(event) => setProfileCity(event.target.value)}
                  placeholder="Mumbai"
                  list="profile-city-options"
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
                />
              </label>
            </div>

            <label className="block text-sm font-semibold">
              State
              <input
                value={profileState}
                onChange={(event) => setProfileState(event.target.value)}
                placeholder="Maharashtra"
                list="profile-state-options"
                className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
              />
            </label>

            <label className="block text-sm font-semibold">
              New Password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
              />
            </label>

            <label className="block text-sm font-semibold">
              Bio
              <textarea
                value={profileBio}
                onChange={(event) => setProfileBio(event.target.value)}
                placeholder="Share how you care for your pets or your rehoming story"
                className="mt-2 min-h-28 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <label className="block text-sm font-semibold">
                Profile Image URL
                <input
                  value={profileImage}
                  onChange={(event) => setProfileImage(event.target.value)}
                  placeholder="https://"
                  className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
                />
              </label>
              <label className="block text-sm font-semibold">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2 block w-full text-sm"
                />
              </label>
            </div>

            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
            {formSuccess ? <p className="text-sm text-emerald-700">{formSuccess}</p> : null}

            <button
              type="submit"
              disabled={isSaving || isUploadingImage}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-primary-foreground)] disabled:opacity-60"
            >
              {isSaving ? "Saving..." : isUploadingImage ? "Uploading..." : "Save Changes"}
            </button>
          </form>

          <datalist id="profile-state-options">
            {stateOptions.map((state) => (
              <option key={state} value={state} />
            ))}
          </datalist>
          <datalist id="profile-city-options">
            {cityOptions.map((cityValue) => (
              <option key={cityValue} value={cityValue} />
            ))}
          </datalist>
        </section>
      ) : null}
    </div>
  );
}
