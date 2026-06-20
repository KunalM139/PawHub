import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PawHub",
  description: "Read PawHub's privacy policy regarding data collection and usage.",
};

export default function PrivacyPage() {
  return (
    <main className="font-outfit home-theme pb-24 pt-32 bg-[var(--color-surface)] text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)] overflow-hidden min-h-[60vh]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="glass-panel p-8 md:p-16 rounded-[2.5rem] card-shadow">
          <h1 className="text-4xl md:text-5xl font-black mb-8 text-[var(--color-on-surface)] tracking-tight">
            Privacy Policy
          </h1>
          <div className="prose prose-lg max-w-none text-[var(--color-on-surface-variant)] leading-relaxed">
            <p className="text-xl font-medium mb-8">
              Your privacy is critically important to us. PawHub respects your privacy regarding any information we may collect while operating our website. We only ask for personal information when we truly need it to provide a service to you.
            </p>
            <p>
              This is a placeholder page designed to complete the site's structure. In a full production environment, this page would contain detailed, legally binding privacy policy text.
            </p>
            <p className="mt-8 pt-8 border-t border-[var(--color-outline-variant)]/30 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
