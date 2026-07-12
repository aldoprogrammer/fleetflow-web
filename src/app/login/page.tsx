import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginHero } from "@/components/auth/LoginHero";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F4F7FB] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <LoginHero />

      <section className="relative flex items-center justify-center px-6 py-10 lg:px-12 lg:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_55%)]" />
        <Suspense
          fallback={
            <div className="text-sm font-medium text-slate-500">Preparing secure session...</div>
          }
        >
          <LoginForm />
        </Suspense>
      </section>
    </div>
  );
}
