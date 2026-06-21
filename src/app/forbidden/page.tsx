import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/layout/navbar";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-[var(--color-background)]">
        <section className="flex min-h-[70vh] items-center justify-center py-20">
          <Container>
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 text-4xl text-yellow-600">
                🛑
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Access Denied</h1>
              <p className="mx-auto mt-4 max-w-md text-lg text-[var(--color-foreground-muted)]">
                You do not have the required permissions to view this page or perform this action.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link
                  href="/"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-200 px-8 text-sm font-bold text-gray-900 transition-transform hover:bg-gray-300 active:scale-95"
                >
                  Return Home
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-primary)] px-8 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
