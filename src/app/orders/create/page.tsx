import Link from "next/link";
import { CreateOrderForm } from "@/components/orders/CreateOrderForm";
import { env } from "@/lib/env";

export default function CreateOrderPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 flex max-w-2xl items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
        >
          ← Back to portal
        </Link>
        <p className="text-xs text-slate-500">
          API: <span className="font-mono">{env.apiBaseUrl}</span>
        </p>
      </div>
      <CreateOrderForm />
    </main>
  );
}
