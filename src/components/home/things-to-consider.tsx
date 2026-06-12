import { Container } from "@/components/ui/container";
import { Home, Users, Activity, Sun, Wallet, BookOpen } from "lucide-react";

const considerations = [
  {
    title: "Living Space",
    description: "Match the pet to your home. Active breeds might need a yard, while smaller pets or cats thrive in cozy apartments.",
    icon: Home,
  },
  {
    title: "Family Dynamics",
    description: "Consider who lives with you. Some breeds are notoriously gentle with toddlers, while others prefer quieter environments.",
    icon: Users,
  },
  {
    title: "Energy Levels",
    description: "Are you a couch potato or a marathon runner? Pick a companion whose daily exercise needs match your own lifestyle.",
    icon: Activity,
  },
  {
    title: "Climate Comfort",
    description: "Thick-coated breeds struggle in hot Indian summers. Choose a pet suited for your local weather conditions.",
    icon: Sun,
  },
  {
    title: "Financial Commitment",
    description: "Beyond the initial adoption fee, consider ongoing costs for high-quality food, vaccinations, grooming, and vet visits.",
    icon: Wallet,
  },
  {
    title: "Time & Training",
    description: "Puppies and kittens require significant time for house-training and socialization. Ensure your schedule accommodates them.",
    icon: BookOpen,
  },
];

export function ThingsToConsider() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <Container>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Things to Consider Before Bringing a Pet Home
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A pet is a lifelong commitment. Make sure you're ready by evaluating these key lifestyle factors.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {considerations.map((item, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-md"
            >
              {/* Subtle watermark icon */}
              <item.icon className="absolute -bottom-6 -right-6 size-32 text-slate-50 opacity-50 rotate-12" />
              
              <div className="relative z-10">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 mb-6">
                  <item.icon className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
