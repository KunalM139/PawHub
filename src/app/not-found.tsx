import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/layout/navbar";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-[var(--color-background)]">
        <section className="flex min-h-[70vh] items-center justify-center py-20">
          <Container>
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-4xl text-orange-600">
                🐾
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Page Not Found</h1>
              <p className="mx-auto mt-4 max-w-md text-lg text-[var(--color-foreground-muted)]">
                Oops! Looks like this page wandered off. We couldn't find what you were looking for.
              </p>
              <div className="mt-8">
                <Link
                  href="/"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-primary)] px-8 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
