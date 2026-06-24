import { ShieldCheck } from "lucide-react";

type VerifiedSellerBadgeProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
};

export function VerifiedSellerBadge({ className = "", size = "md", withText = false }: VerifiedSellerBadgeProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      className={`inline-flex items-center gap-1 text-[#176a37] bg-[#e8fff0] rounded-full px-2 py-0.5 border border-[#176a37]/20 ${className}`}
      title="Verified Seller - PawHub Trusted"
    >
      <ShieldCheck className={`${sizeClasses[size]} fill-current text-white`} strokeWidth={1.5} />
      {withText && <span className={`font-bold tracking-tight ${textClasses[size]}`}>Verified Seller</span>}
    </div>
  );
}
