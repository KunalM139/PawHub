const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/(dashboard)/seller-dashboard/verification/page.tsx');

const newCode = `import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  XCircle,
  ChevronRight
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { VerificationRequestModel } from "@/server/models/verification-request";

export const metadata: Metadata = {
  title: "Verification | Seller Dashboard",
  robots: { index: false, follow: false },
};

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; icon: typeof CheckCircle2; description: string }
> = {
  pending: {
    label: "Pending Review",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    icon: Clock,
    description: "Your verification request is under review. Our team will verify your documents within 2-3 business days.",
  },
  approved: {
    label: "Verified",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    icon: CheckCircle2,
    description: "Congratulations! You are a verified seller on PawHub. Your listings now display the verified badge.",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-500/10",
    text: "text-rose-600",
    icon: XCircle,
    description: "Your verification request was rejected. Please review the requirements and reapply.",
  },
};

export default async function VerificationPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const [profile, verificationRequest] = await Promise.all([
    UserModel.findById(session.user.id).select("role").lean(),
    VerificationRequestModel.findOne({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const isVerified = profile?.role === "verifiedSeller";
  const requestStatus = (verificationRequest?.status as string) ?? null;
  const config = requestStatus ? statusConfig[requestStatus] : null;

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)] space-y-8 max-w-[1000px] mx-auto w-full pb-24">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] md:text-[36px] leading-[1.2] font-semibold text-[var(--color-on-surface)] tracking-tight">Verification</h1>
        <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)] max-w-2xl">
          Build trust with buyers by verifying your business identity and showcasing a verified badge.
        </p>
      </header>

      {/* Main Status Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-[var(--color-surface-container-lowest)] p-8 md:p-10 card-shadow border border-[var(--color-outline-variant)]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent rounded-bl-full -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div
            className={\`inline-flex size-20 shrink-0 items-center justify-center rounded-[1.5rem] shadow-sm \${
              isVerified
                ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
                : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]"
            }\`}
          >
            {isVerified ? (
               <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            ) : (
               <span className="material-symbols-outlined text-[40px]">shield_person</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-[24px] font-bold text-[var(--color-on-surface)] mb-2">
              {isVerified ? "You are a Verified Seller!" : "Seller Verification"}
            </h2>
            <p className="text-[16px] text-[var(--color-on-surface-variant)] max-w-xl leading-relaxed">
              {isVerified
                ? "Thank you for building trust in the PawHub community. Your premium badge is active across all your listings."
                : "Get verified to earn trust and prominently display a verified badge on your pet listings and store profile."}
            </p>
          </div>
        </div>
      </div>

      {/* Application Status (If Applied) */}
      {config && (
        <div className="rounded-[2rem] border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] p-8 card-shadow relative overflow-hidden">
          <h3 className="text-[20px] font-bold text-[var(--color-on-surface)] mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-primary)]">assignment_turned_in</span>
            Application Status
          </h3>
          
          <div className={\`flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-[1.5rem] border border-[var(--color-outline-variant)]/10 p-6 \${config.bg}\`}>
            <div className={\`inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm \${config.text}\`}>
              <config.icon className="size-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={\`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest bg-white shadow-sm \${config.text}\`}>
                  {config.label}
                </span>
                {verificationRequest?.createdAt && (
                  <span className="text-[12px] font-semibold text-[var(--color-on-surface-variant)]/70">
                    Applied on {new Date(verificationRequest.createdAt as string).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
              <p className={\`mt-2 text-[15px] font-medium leading-relaxed \${config.text}\`}>
                {config.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-[2rem] border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] p-8 md:p-10 card-shadow">
        <h3 className="text-[20px] font-bold text-[var(--color-on-surface)] mb-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--color-primary)]">format_list_numbered</span>
          Verification Process
        </h3>
        
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[var(--color-primary)]/20 before:to-transparent">
          {[
            {
              step: 1,
              title: "Submit Application",
              desc: "Upload your business documents, license, and ID proof.",
              done: !!verificationRequest,
              icon: "upload_file"
            },
            {
              step: 2,
              title: "Document Review",
              desc: "Our verification team manually reviews your submitted documents.",
              done: requestStatus === "approved",
              icon: "policy"
            },
            {
              step: 3,
              title: "Verification Complete",
              desc: "Receive your verified seller badge on your profile.",
              done: isVerified,
              icon: "verified"
            },
          ].map((item, index) => (
            <div key={item.step} className="relative flex items-start md:justify-center">
              {/* Desktop timeline spacer */}
              <div className="hidden md:block w-[45%] text-right pr-12">
                {(index % 2 === 0) && (
                  <div className="pt-2">
                    <h4 className={\`text-[18px] font-bold \${item.done ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface)]'}\`}>{item.title}</h4>
                    <p className="mt-1 text-[15px] text-[var(--color-on-surface-variant)]">{item.desc}</p>
                  </div>
                )}
              </div>
              
              <div className={\`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-4 border-[var(--color-surface-container-lowest)] shadow-sm transition-colors duration-500 \${
                  item.done
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]"
                }\`}
              >
                {item.done ? (
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                ) : (
                  <span className="text-[14px] font-bold">{item.step}</span>
                )}
              </div>
              
              <div className="md:w-[45%] pl-6 md:pl-12 pt-1.5 md:pt-2">
                {/* Mobile text or odd desktop text */}
                <div className={(index % 2 === 0) ? "md:hidden" : "block"}>
                  <h4 className={\`text-[18px] font-bold \${item.done ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface)]'}\`}>{item.title}</h4>
                  <p className="mt-1 text-[15px] text-[var(--color-on-surface-variant)]">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      {!isVerified && (
        <div className="flex justify-center pt-6">
          <Link
            href="/seller-verification"
            className="group relative inline-flex h-14 items-center justify-center gap-3 rounded-full btn-gradient px-10 text-[16px] font-bold text-white shadow-lg hover:shadow-xl hover-scale transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="material-symbols-outlined text-[24px]">contact_page</span>
            {verificationRequest ? "Reapply for Verification" : "Apply for Verification"}
            <ChevronRight className="size-5 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(filePath, newCode, 'utf8');
console.log('Successfully redesigned verification page');
