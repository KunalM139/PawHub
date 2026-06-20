import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-16 md:mb-32 reveal">
      <div className="relative rounded-[3rem] overflow-hidden bg-[var(--color-surface-container-high)] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-10 card-shadow border border-white hover:shadow-2xl transition-shadow duration-500">
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--color-secondary-fixed-dim)] via-[var(--color-primary-fixed)] to-[var(--color-surface-container-high)] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-xl text-center md:text-left">
          <h2 className="text-4xl md:text-6xl text-[var(--color-on-surface)] mb-6 font-black tracking-tight">Ready to find your new best friend?</h2>
          <p className="text-lg md:text-xl text-[var(--color-on-surface-variant)] mb-10">Join the PawHub community today and start your journey towards bringing home a loving companion.</p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            <Link href="/register" className="btn-gradient text-white rounded-full px-10 py-4 text-sm font-bold md:text-lg hover-scale inline-flex justify-center items-center">Join the Community</Link>
            <Link href="/about" className="bg-white text-[var(--color-on-surface)] border-2 border-white rounded-full px-10 py-4 text-sm font-bold md:text-lg hover:bg-[var(--color-surface-container-lowest)] transition-colors shadow-sm hover-scale inline-flex justify-center items-center">Learn More</Link>
          </div>
        </div>
        
        <div className="relative z-10 hidden md:block w-72 h-72">
          <div className="absolute inset-0 bg-white rounded-[3rem] opacity-40 blur-3xl rotate-12"></div>
          <HeartHandshake className="size-[200px] text-[var(--color-primary)] drop-shadow-2xl opacity-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-1" />
        </div>
      </div>
    </section>
  );
}
