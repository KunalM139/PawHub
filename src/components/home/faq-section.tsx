"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How do I adopt a pet through PawHub?",
    answer: "Simply browse our active listings, and when you find a pet you love, click 'Request to Adopt'. Once the owner approves your request, you can chat with them directly to arrange the adoption process."
  },
  {
    question: "Are the sellers on PawHub verified?",
    answer: "Yes, we have a strict seller verification process. Sellers submit identity documents which our team manually reviews. Look for the 'Verified' badge on their profiles."
  },
  {
    question: "Is there a fee to adopt a pet?",
    answer: "Pets listed under 'Adoption' or 'Rehome' by individual owners are completely free. However, if you are purchasing a specific breed from a commercial seller, the price will be listed on their post."
  },
  {
    question: "What should I do if a seller seems suspicious?",
    answer: "If you encounter a suspicious listing or a seller asking for advance payments without proper proof, use the 'Report Listing' feature on the pet's page immediately. Our moderation team will investigate."
  },
  {
    question: "Can I list my own pet for rehoming?",
    answer: "Absolutely. If you are unable to care for your pet and want to find them a loving family, you can create a Pet Owner account and post a free 'Rehome' listing."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 lg:py-24 bg-white">
      <Container className="max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything you need to know about adopting or buying a pet on PawHub.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={cn(
                  "rounded-2xl border transition-all duration-200 overflow-hidden",
                  isOpen ? "border-purple-200 bg-white shadow-md" : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-slate-900 text-lg">{faq.question}</span>
                  <div className={cn(
                    "ml-4 flex size-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200",
                    isOpen ? "bg-purple-100 text-purple-600 rotate-180" : "bg-slate-200 text-slate-500"
                  )}>
                    <ChevronDown className="size-5" />
                  </div>
                </button>
                <div 
                  className={cn(
                    "px-6 pb-6 text-slate-600 transition-all duration-300",
                    isOpen ? "block opacity-100" : "hidden opacity-0"
                  )}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
