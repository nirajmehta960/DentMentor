import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The landing's structural kit. `Band` sets `data-band`, which resolves every
 * `band-*` colour inside it (see site.css) — components never name a colour.
 */

export type BandTone = "ink" | "paper" | "mist" | "tint";

export function Band({
  id,
  tone,
  ruled = false,
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"section"> & {
  id: string;
  tone: BandTone;
  ruled?: boolean;
}) {
  return (
    <section
      id={id}
      data-band={tone}
      className={cn(
        "relative isolate bg-band-ground text-band-fg",
        "py-20 sm:py-28 lg:py-32",
        ruled && "border-t border-band-rule",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function Frame({
  width = "default",
  className,
  ...props
}: ComponentPropsWithoutRef<"div"> & { width?: "default" | "wide" | "narrow" }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full px-5 sm:px-8 lg:px-12",
        width === "narrow" && "max-w-3xl",
        width === "default" && "max-w-6xl",
        width === "wide" && "max-w-[84rem]",
        className,
      )}
      {...props}
    />
  );
}

/** The hairline every card grid on the page shares, so they read as one kind of card. */
export const HAIRLINE = "#E3ECEA";

/** The rail every wide band uses, so section edges line up down the page. */
export const WIDE_RAIL = "max-w-[90rem] px-5 sm:px-10 lg:px-20";

export function Label({
  children,
  className,
  as: Component = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
}) {
  return <Component className={cn("label text-band-signal", className)}>{children}</Component>;
}

/**
 * Ink running into the band's signal across the line. Both stops are tokens, so
 * the ramp follows its band. `pb` keeps descenders inside the clip box.
 */
export const HEADING_GRADIENT =
  "bg-[linear-gradient(90deg,rgb(var(--band-fg))_8%,rgb(var(--band-signal))_88%)] bg-clip-text pb-[0.12em] text-transparent";

/**
 * A band opening. `heading` may be two lines — one <h2> with a break, never two
 * headings for one thought. The second line takes the ramp unless `plainHeading`.
 */
export function BandHeader({
  eyebrow,
  heading,
  lead,
  leadClassName,
  headingClassName,
  plainHeading = false,
  align = "start",
  className,
  children,
}: {
  eyebrow?: string;
  heading: string | readonly string[];
  lead?: string;
  leadClassName?: string;
  headingClassName?: string;
  plainHeading?: boolean;
  align?: "start" | "center";
  className?: string;
  children?: ReactNode;
}) {
  const lines = typeof heading === "string" ? [heading] : heading;
  return (
    <div className={cn("flex flex-col gap-5", align === "center" && "items-center text-center", className)}>
      {eyebrow ? <Label>{eyebrow}</Label> : null}
      <h2
        className={cn(
          "max-w-[46rem] text-balance font-display tracking-[-0.03em] text-band-fg",
          headingClassName ?? "text-display-2 font-medium",
        )}
      >
        {lines.map((line, i) => (
          <span key={line} className={cn("block", i > 0 && !plainHeading && HEADING_GRADIENT)}>
            {line}
          </span>
        ))}
      </h2>
      {lead ? (
        <p className={cn("max-w-[38rem] leading-relaxed", leadClassName ?? "text-body-sm text-band-muted")}>
          {lead}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/**
 * The soft colour wash behind a section's content. One barely-there blob with an
 * eased seven-stop falloff; hard-stop radials read as discrete blooms instead.
 * Sits low so its densest part falls across the cards rather than the heading.
 */
export function CardGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-1/2 top-[66%] -z-10 aspect-[480/299] w-[min(1600px,84%)] -translate-x-1/2 -translate-y-1/2",
        "bg-[radial-gradient(closest-side,rgb(21_157_130/0.12)_0%,rgb(21_157_130/0.095)_18%,rgb(21_157_130/0.066)_34%,rgb(21_157_130/0.04)_50%,rgb(21_157_130/0.019)_66%,rgb(21_157_130/0.006)_82%,rgb(21_157_130/0)_100%)]",
        className,
      )}
    />
  );
}

export function Panel({
  variant = "raised",
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"div"> & { variant?: "raised" | "outline" }) {
  return (
    <div
      className={cn(
        "rounded-panel border border-band-rule-faint",
        variant === "raised" && "bg-band-raised shadow-[var(--card-shadow)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
