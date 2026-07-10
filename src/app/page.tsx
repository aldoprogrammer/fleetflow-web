import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
        FleetFlow
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Operations Portal
      </h1>
      <p className="max-w-lg text-sm leading-relaxed text-slate-600">
        Create dispatch orders, monitor fulfillment, and coordinate courier
        assignments from a single dashboard.
      </p>
      <Link
        href="/orders/create"
        className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        Create order
      </Link>
    </main>
  );
}
