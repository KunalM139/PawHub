import type { ReactNode } from "react";
import Image from "next/image";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <section className="min-h-[calc(100vh-80px)] flex">
      {/* Left side: Image */}
      <div className="hidden lg:block relative w-1/2 bg-purple-50">
        <Image
          src="/images/auth-pet.png"
          alt="Cute pet"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">Join the PawHub Family</h2>
          <p className="mt-2 text-lg font-medium opacity-90">Thousands of happy pets have found their forever homes. Yours is next.</p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20 xl:px-32 bg-white">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p>
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </section>
  );
}
