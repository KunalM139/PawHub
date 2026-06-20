const fs = require('fs');
const path = require('path');

const pages = {
  about: {
    title: "About PawHub",
    content: "PawHub is India's premier online marketplace for buying, adopting, and rehoming pets. Our mission is to connect loving families with ethical breeders and owners to ensure every pet finds a happy home."
  },
  contact: {
    title: "Contact Us",
    content: "Have questions? We're here to help. Reach out to us at support@pawhub.in or call us at +91 1800-PAWHUB-123. Our team is available Monday through Friday, 9 AM to 6 PM IST."
  },
  privacy: {
    title: "Privacy Policy",
    content: "Your privacy is critically important to us. PawHub respects your privacy regarding any information we may collect while operating our website. We only ask for personal information when we truly need it to provide a service to you."
  },
  terms: {
    title: "Terms of Service",
    content: "By accessing PawHub, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using this site."
  }
};

Object.entries(pages).forEach(([slug, data]) => {
  const dirPath = path.resolve(\`src/app/(main)/\${slug}\`);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const code = \`import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "\${data.title} | PawHub",
  description: "\${data.content.substring(0, 150)}...",
};

export default function \${slug.charAt(0).toUpperCase() + slug.slice(1)}Page() {
  return (
    <main className="font-outfit home-theme pb-24 pt-32 bg-[var(--color-surface)] text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)] overflow-hidden min-h-[60vh]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="glass-panel p-8 md:p-16 rounded-[2.5rem] card-shadow">
          <h1 className="text-4xl md:text-5xl font-black mb-8 text-[var(--color-on-surface)] tracking-tight">
            \${data.title}
          </h1>
          <div className="prose prose-lg max-w-none text-[var(--color-on-surface-variant)] leading-relaxed">
            <p className="text-xl font-medium mb-8">
              \${data.content}
            </p>
            <p>
              This is a placeholder page designed to complete the site's structure. In a full production environment, this page would contain detailed, legally binding, or extensive informational text specific to PawHub's operations and guidelines.
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
\`;

  fs.writeFileSync(path.join(dirPath, 'page.tsx'), code, 'utf8');
});

console.log("Successfully created static placeholder pages for About, Contact, Privacy, and Terms.");
