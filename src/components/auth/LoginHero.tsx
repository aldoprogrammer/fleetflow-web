import {
  Activity,
  MapPin,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import type { ReactElement } from "react";

const METRICS = [
  { label: "Active couriers", value: "148", icon: Truck },
  { label: "SLA compliance", value: "96.4%", icon: Activity },
  { label: "Live dispatches", value: "37", icon: Zap },
  { label: "Cities covered", value: "12", icon: MapPin },
];

export function LoginHero(): ReactElement {
  return (
    <section className="relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-[#0B1220] px-8 py-10 text-white lg:min-h-screen lg:px-14 lg:py-12">
      <div className="login-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="login-orb login-orb-a pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="login-orb login-orb-b pointer-events-none absolute bottom-10 right-0 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />

      <header className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-900/40">
            <Truck className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">FleetFlow</p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
              Enterprise Logistics OS
            </p>
          </div>
        </div>
      </header>

      <div className="relative z-10 mt-10 lg:mt-0">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-emerald-300 backdrop-blur-sm">
          <ShieldCheck className="h-3.5 w-3.5" />
          RBAC-secured operations portal
        </p>
        <h1 className="mt-6 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white lg:text-5xl lg:leading-[1.1]">
          Command center for high-velocity logistics
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-300 lg:text-base">
          Orchestrate dispatch, monitor fulfillment in real time, and govern fleet
          performance from one enterprise workspace.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <article
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
              >
                <Icon className="h-4 w-4 text-emerald-400" />
                <p className="mt-3 text-xl font-semibold text-white">{metric.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                  {metric.label}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      <footer className="relative z-10 mt-10 hidden text-xs text-slate-500 lg:block">
        Trusted by operations teams across Southeast Asia · SOC2-ready architecture
      </footer>
    </section>
  );
}
