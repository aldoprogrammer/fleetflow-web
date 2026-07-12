import type { HTMLAttributes, ReactElement } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className = "", ...props }: SkeletonProps): ReactElement {
  return (
    <div
      className={`skeleton-shimmer rounded-lg ${className}`}
      aria-hidden
      {...props}
    />
  );
}
