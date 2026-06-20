import { ShieldCheck, Lock, HeadphonesIcon, Stethoscope } from "lucide-react";

export function TrustFeatures() {
  return (
    <section className="bg-[var(--color-surface-container-low)] py-16 md:py-32 my-16 md:my-32 rounded-[3rem] mx-4 md:mx-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 reveal">
          <h2 className="text-4xl md:text-6xl text-[var(--color-on-surface)] mb-6 font-extrabold tracking-tight">Why Choose PawHub</h2>
          <p className="text-lg md:text-xl text-[var(--color-on-surface-variant)] max-w-2xl mx-auto">We prioritize safety, ethics, and a seamless experience for both pets and their future families.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="bg-white rounded-3xl p-8 card-shadow border-2 border-transparent hover:border-[var(--color-primary)]/10 transition-all duration-300 reveal" style={{ transitionDelay: "0.1s" }}>
            <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center text-[var(--color-primary)] mb-6 shadow-inner transition-transform hover:scale-110 duration-300">
              <ShieldCheck className="size-8" />
            </div>
            <h3 className="text-2xl text-[var(--color-on-surface)] mb-4 font-bold">Verified Sellers</h3>
            <p className="text-base text-[var(--color-on-surface-variant)]">Every breeder and re-homer goes through a strict verification process to ensure ethical practices.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 card-shadow border-2 border-transparent hover:border-[var(--color-secondary)]/10 transition-all duration-300 reveal" style={{ transitionDelay: "0.2s" }}>
            <div className="w-16 h-16 bg-[var(--color-secondary)]/10 rounded-2xl flex items-center justify-center text-[var(--color-secondary)] mb-6 shadow-inner transition-transform hover:scale-110 duration-300">
              <Lock className="size-8" />
            </div>
            <h3 className="text-2xl text-[var(--color-on-surface)] mb-4 font-bold">Secure Payments</h3>
            <p className="text-base text-[var(--color-on-surface-variant)]">Your transactions are protected. We hold funds securely until you meet your new pet.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 card-shadow border-2 border-transparent hover:border-[var(--color-tertiary-container)]/10 transition-all duration-300 reveal" style={{ transitionDelay: "0.3s" }}>
            <div className="w-16 h-16 bg-[var(--color-tertiary-fixed)] rounded-2xl flex items-center justify-center text-[var(--color-tertiary-container)] mb-6 shadow-inner transition-transform hover:scale-110 duration-300">
              <HeadphonesIcon className="size-8" />
            </div>
            <h3 className="text-2xl text-[var(--color-on-surface)] mb-4 font-bold">24/7 Support</h3>
            <p className="text-base text-[var(--color-on-surface-variant)]">Our dedicated team is always here to assist you through every step of your adoption journey.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 card-shadow border-2 border-transparent hover:border-[var(--color-primary-container)]/10 transition-all duration-300 reveal" style={{ transitionDelay: "0.4s" }}>
            <div className="w-16 h-16 bg-[var(--color-primary-fixed)] rounded-2xl flex items-center justify-center text-[var(--color-primary-container)] mb-6 shadow-inner transition-transform hover:scale-110 duration-300">
              <Stethoscope className="size-8" />
            </div>
            <h3 className="text-2xl text-[var(--color-on-surface)] mb-4 font-bold">Health Guarantee</h3>
            <p className="text-base text-[var(--color-on-surface-variant)]">All pets come with initial health checks and a clear medical history for peace of mind.</p>
          </div>

        </div>
      </div>
    </section>
  );
}
