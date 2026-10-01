import type { MouseEventHandler, ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

/**
 * The landing's one control shape. Every CTA goes through this for radius,
 * height and label weight, so re-skinned buttons never drift apart.
 *
 * `primary` (orange) is reserved for the two actions that ask for a commitment —
 * the nav's and the hero's. Every other lead action takes `ink`.
 */
export function control({
  variant = "primary",
  size = "md",
}: {
  variant?: "primary" | "secondary" | "ink";
  size?: "sm" | "md" | "lg";
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-pill font-medium",
    "transition-[transform,background-color,border-color,box-shadow] duration-200 ease-dm",
    size === "sm" && "h-9 px-4 text-[0.8125rem]",
    size === "md" && "h-11 px-5 text-[0.9375rem]",
    size === "lg" && "h-12 px-6 text-[0.9375rem] sm:h-[3.25rem] sm:px-7 sm:text-base",
    variant === "primary" &&
      "landing-cta-primary bg-band-accent text-band-on-accent hover:-translate-y-0.5 hover:bg-band-accent-hover active:translate-y-0",
    variant === "secondary" &&
      "landing-cta-secondary border-[0.5px] border-band-rule-strong text-band-fg hover:-translate-y-0.5 hover:bg-band-fg/5 active:translate-y-0",
    variant === "ink" &&
      "bg-band-fg text-band-ground hover:-translate-y-0.5 hover:bg-band-fg/90 active:translate-y-0",
  );
}

/**
 * Hash targets stay real `<a href="#...">`: routing one through `<Link>` turns
 * an in-page scroll into a navigation that re-renders at the top.
 */
export function SiteCta({
  to,
  variant,
  size,
  className,
  onClick,
  children,
  ...props
}: {
  to: string;
  variant?: "primary" | "secondary" | "ink";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
} & Record<`data-${string}`, string>) {
  const classes = cn(control({ variant, size }), className);

  if (to.startsWith("#")) {
    return (
      <a href={to} className={classes} onClick={onClick} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={classes} onClick={onClick} {...props}>
      {children}
    </Link>
  );
}
