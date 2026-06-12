"use client";

import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardTopbarProps = {
  title: string;
};

export function DashboardTopbar({
  title,
}: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:gap-6 sm:px-6">
      <h1 className={cn("text-xl font-extrabold tracking-tight text-slate-900")}>
        {title}
      </h1>
    </header>
  );
}
