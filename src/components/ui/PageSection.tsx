import type { ReactElement, ReactNode } from "react";

interface PageSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function PageSection({
  title,
  description,
  children,
  className = "",
}: PageSectionProps): ReactElement {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 ${className}`}
    >
      {title ? (
        <header className="mb-6 border-b border-slate-100 pb-5">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
