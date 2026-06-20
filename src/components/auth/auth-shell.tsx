import type { ReactNode } from "react";
import Image from "next/image";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <section className="min-h-[100dvh] flex font-outfit home-theme">
      {/* Left side: Image */}
      <div className="hidden lg:block relative w-1/2 bg-[var(--color-surface-container)]">
        <Image
          src="/images/auth-pet.png"
          alt="Cute pet"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-on-surface)]/60 via-transparent to-transparent" />
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <h2 className="font-serif text-[42px] font-extrabold tracking-tight leading-[1.1] drop-shadow-md">Join the PawHub Family</h2>
          <p className="mt-3 text-[18px] font-medium text-white/90 drop-shadow-sm max-w-md">Thousands of happy pets have found their forever homes. Yours is next.</p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20 xl:px-32 bg-[var(--color-surface)]">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-serif text-[38px] font-black tracking-tight text-[var(--color-on-surface)] leading-tight">{title}</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-on-surface-variant)]">{subtitle}</p>
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </section>
  );
}
