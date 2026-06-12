"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useMemo, useState } from "react";
import { Heart, Home, Store } from "lucide-react";

import { getCitiesForState, stateOptions } from "@/lib/locations";

const phoneRegex = /^[0-9+][0-9\s-]{7,19}$/;

const intentOptions = [
  {
    value: "adopt",
    label: "Adopt a Pet",
    description: "Find your perfect furry companion from trusted sellers & shelters.",
    icon: Heart,
    gradient: "from-rose-500/10 to-pink-500/10",
    borderActive: "border-rose-400 ring-2 ring-rose-400/30",
    iconColor: "text-rose-500",
  },
  {
    value: "rehome",
    label: "Rehome a Pet",
    description: "Find a loving new home for your pet safely and responsibly.",
    icon: Home,
    gradient: "from-sky-500/10 to-blue-500/10",
    borderActive: "border-sky-400 ring-2 ring-sky-400/30",
    iconColor: "text-sky-500",
  },
  {
    value: "seller",
    label: "Sell Pets & Products",
    description: "Grow your pet business with India's most trusted marketplace.",
    icon: Store,
    gradient: "from-amber-500/10 to-orange-500/10",
    borderActive: "border-amber-400 ring-2 ring-amber-400/30",
    iconColor: "text-amber-600",
  },
];

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [city, setCity] = useState("");
  const [userIntent, setUserIntent] = useState("adopt");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOtpReady = useMemo(() => phoneRegex.test(phone), [phone]);
  const cityOptions = useMemo(() => getCitiesForState(stateValue), [stateValue]);

  async function handleSendOtp() {
    setError(null);
    setMessage(null);

    if (!isOtpReady) {
      setError("Enter a valid phone number before requesting OTP.");
      return;
    }

    setIsSendingOtp(true);

    const response = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    const data = (await response.json().catch(() => null)) as
      | { message?: string; otp?: string }
      | null;

    if (!response.ok) {
      setError(data?.message ?? "Unable to send OTP.");
      setIsSendingOtp(false);
      return;
    }

    const notice = data?.otp
      ? `OTP sent. Dev code: ${data.otp}`
      : data?.message ?? "OTP sent.";
    setMessage(notice);
    setIsPhoneVerified(false);
    setVerifiedPhone("");
    setOtp("");
    setIsSendingOtp(false);
  }

  async function handleVerifyOtp() {
    setError(null);
    setMessage(null);

    if (!isOtpReady) {
      setError("Enter a valid phone number first.");
      return;
    }

    if (!otp.trim()) {
      setError("Enter the OTP sent to your phone.");
      return;
    }

    setIsVerifyingOtp(true);

    const response = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, otp: otp.trim() }),
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Unable to verify OTP.");
      setIsVerifyingOtp(false);
      return;
    }

    setIsPhoneVerified(true);
    setVerifiedPhone(phone);
    setMessage(data?.message ?? "Phone verified.");
    setOtp("");
    setIsVerifyingOtp(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (!isPhoneVerified || verifiedPhone !== phone) {
      setError("Please verify your phone number before creating an account.");
      setIsLoading(false);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        email,
        password,
        state: stateValue,
        city,
        userIntent,
      }),
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    setIsLoading(false);

    if (!response.ok) {
      setError(data?.message ?? "Unable to register. Please try again.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.ok) {
      const callbackUrl = userIntent === "seller" ? "/seller-dashboard" : "/dashboard";
      router.replace(callbackUrl);
      setMessage("Account created. Welcome to PawHub.");
      return;
    }

    setMessage(data?.message ?? "Account created successfully. Please login.");
    setTimeout(() => {
      router.push("/login");
    }, 1200);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Intent Selection Cards */}
      <div>
        <p className="mb-3 text-sm font-semibold text-[var(--color-foreground)]">
          I want to
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {intentOptions.map((option) => {
            const isSelected = userIntent === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setUserIntent(option.value)}
                className={`group relative rounded-2xl border-2 bg-gradient-to-br p-4 text-left transition-all duration-200 ${option.gradient} ${
                  isSelected
                    ? option.borderActive
                    : "border-black/5 hover:border-black/15 hover:-translate-y-0.5"
                }`}
              >
                <div
                  className={`mb-2 inline-flex size-10 items-center justify-center rounded-xl bg-white/80 shadow-sm ${option.iconColor}`}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="text-sm font-bold text-[var(--color-foreground)]">
                  {option.label}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-foreground-muted)]">
                  {option.description}
                </p>
                {isSelected ? (
                  <div className="absolute right-3 top-3 size-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                    <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block text-sm font-semibold text-[var(--color-foreground)]">
        Full Name
        <input
          type="text"
          required
          minLength={2}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-ring)]"
          placeholder="Your name"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-[1.2fr_auto]">
        <label className="block text-sm font-semibold text-[var(--color-foreground)]">
          Phone Number
          <input
            type="tel"
            required
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              setIsPhoneVerified(false);
              setVerifiedPhone("");
            }}
            className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-ring)]"
            placeholder="+91 98765 43210"
          />
        </label>

        <button
          type="button"
          onClick={() => void handleSendOtp()}
          disabled={isSendingOtp || !isOtpReady}
          className="mt-7 inline-flex h-12 items-center justify-center rounded-xl border border-black/10 px-4 text-sm font-semibold disabled:opacity-60"
        >
          {isSendingOtp ? "Sending..." : "Send OTP"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1.2fr_auto]">
        <label className="block text-sm font-semibold text-[var(--color-foreground)]">
          OTP Code
          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-ring)]"
            placeholder="Enter the 6-digit OTP"
          />
        </label>

        <button
          type="button"
          onClick={() => void handleVerifyOtp()}
          disabled={isVerifyingOtp || !otp.trim()}
          className="mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-foreground)] disabled:opacity-60"
        >
          {isVerifyingOtp ? "Verifying..." : "Verify"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-[var(--color-foreground)]">
          State
          <LocationCombobox
            value={stateValue}
            onChange={(val) => setStateValue(val)}
            options={stateOptions}
            placeholder="State"
          />
        </label>

        <label className="block text-sm font-semibold text-[var(--color-foreground)]">
          City
          <LocationCombobox
            value={city}
            onChange={(val) => setCity(val)}
            options={cityOptions}
            placeholder="City"
          />
        </label>
      </div>

      <label className="block text-sm font-semibold text-[var(--color-foreground)]">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-ring)]"
          placeholder="you@example.com"
        />
      </label>

      <label className="block text-sm font-semibold text-[var(--color-foreground)]">
        Password
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-ring)]"
          placeholder="At least 8 characters"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <button
        type="submit"
        disabled={isLoading || !isPhoneVerified || verifiedPhone !== phone}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-foreground)] transition hover:brightness-110 disabled:opacity-60"
      >
        {isLoading ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-sm text-[var(--color-foreground-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-foreground)]">
          Sign in
        </Link>
      </p>

    </form>
  );
}

function LocationCombobox({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: string[]; 
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getClosestMatch = (input: string, list: string[]) => {
    if (!input.trim()) return input;
    const normalized = input.toLowerCase().trim();
    
    // 1. Exact match
    const exact = list.find(o => o.toLowerCase() === normalized);
    if (exact) return exact;
    
    // 2. Starts with / Contains match
    const contains = list.find(o => o.toLowerCase().includes(normalized));
    if (contains && normalized.length >= 3) return contains;
    
    // 3. Basic fuzzy (strip non-alpha)
    const stripped = normalized.replace(/[^a-z]/g, "");
    if (stripped.length >= 3) {
      const fuzzy = list.find(o => o.toLowerCase().replace(/[^a-z]/g, "") === stripped);
      if (fuzzy) return fuzzy;
    }
    
    return input;
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            setIsOpen(false);
            const match = getClosestMatch(value, options);
            if (match !== value) onChange(match);
          }}
          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 pr-10 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-ring)]"
          placeholder={placeholder}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          className="absolute right-2 top-1/2 mt-1 -translate-y-1/2 p-2 text-black/40 hover:text-black/80 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
      {isOpen && options.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          {options.map((opt) => (
            <div
              key={opt}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
