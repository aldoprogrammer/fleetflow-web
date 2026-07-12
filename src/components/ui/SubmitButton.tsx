"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

export function SubmitButton({
  loading = false,
  loadingLabel,
  children,
  disabled,
  className,
  type = "submit",
  ...props
}: SubmitButtonProps): ReactElement {
  const mergedClassName = [
    className,
    loading ? "inline-flex items-center justify-center gap-2" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={mergedClassName}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
