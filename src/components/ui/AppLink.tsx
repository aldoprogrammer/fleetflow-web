"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import {
  type AnchorHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { useNavigationStore } from "@/stores/navigation-store";

type AppLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
  };

function resolveHref(href: LinkProps["href"]): string {
  if (typeof href === "string") {
    return href.split("#")[0] ?? href;
  }

  const pathname = href.pathname ?? "";
  const search = href.search ?? "";
  return `${pathname}${search}`;
}

export function AppLink({
  children,
  className,
  href,
  onClick,
  ...props
}: AppLinkProps): ReactElement {
  const pathname = usePathname();
  const setPendingHref = useNavigationStore((s) => s.setPendingHref);
  const targetHref = resolveHref(href);

  return (
    <Link
      {...props}
      href={href}
      prefetch
      className={className}
      onClick={(event) => {
        if (!event.defaultPrevented && targetHref && targetHref !== pathname) {
          setPendingHref(targetHref);
        }
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
