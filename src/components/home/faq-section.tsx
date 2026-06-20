"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    question: "How do I know if a seller is verified?",
    answer: "We employ a strict verification process for our sellers. Look for the 'Verified Seller' badge on their profile and listings. This means we have verified their identity and contact details to ensure a safer experience."
  },
  {
    question: "Is it safe to adopt or buy a pet through PawHub?",
    answer: "PawHub prioritizes your safety. We highly recommend meeting the seller and the pet in person before making any payments. Never transfer money in advance. Read our safety guidelines for more tips."
  },
  {
    question: "Can I list my own pet for adoption or sale?",
    answer: "Yes! Once you create an account, you can list pets for adoption, rehoming, or sale. Our platform is completely free to use for both buyers and sellers."
  },
  {
    question: "How do I contact a pet owner?",
    answer: "You can easily contact the owner by clicking the 'Contact Seller' button on any pet's listing page. This will open a secure message thread directly in your PawHub dashboard."
  },
  {
    question: "Are there any fees for using PawHub?",
    answer: "No, PawHub is entirely free for basic use! There are no hidden charges to browse pets, contact owners, or list your pets."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-6 lg:px-8 max-w-5xl mx-auto w-full reveal">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center size-16 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-3xl mb-6">
          <HelpCircle className="size-8" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-[var(--color-on-surface)] mb-4 tracking-tight">
          Frequently Asked <span className="text-gradient">Questions</span>
        </h2>
        <p className="text-lg text-[var(--color-on-surface-variant)] max-w-2xl mx-auto">
          Everything you need to know about finding your perfect companion on PawHub.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          
          return (
            <div 
              key={index}
              className={`border-2 transition-all duration-300 rounded-[1.5rem] overflow-hidden ${
                isOpen 
                  ? 'border-[var(--color-primary)]/50 bg-[var(--color-surface-container-lowest)] card-shadow' 
                  : 'border-[var(--color-surface-container-high)] bg-white hover:border-[var(--color-primary)]/30'
              }`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full text-left px-6 py-6 md:px-8 flex items-center justify-between gap-4 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <span className={`text-lg font-bold transition-colors duration-200 pr-8 ${
                  isOpen ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface)]'
                }`}>
                  {faq.question}
                </span>
                <div className={`shrink-0 inline-flex items-center justify-center size-8 rounded-full transition-all duration-300 ${
                  isOpen ? 'bg-[var(--color-primary)] text-white rotate-180' : 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]'
                }`}>
                  <ChevronDown className="size-5" />
                </div>
              </button>
              
              <div 
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0 pb-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 md:px-8 text-[var(--color-on-surface-variant)] text-[16px] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
