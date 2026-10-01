import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Band, Frame } from "./chrome";
import { Enter } from "./reveal";

/**
 * The opening band of an interior page: the landing hero's ink ground at a
 * fraction of its height. Eyebrow, a one- or two-line headline (the second line
 * on the white→sky ramp), a lead, actions, and an optional slot below them for
 * something functional — a search field, a step indicator.
 *
 * Pair it with `SiteShell nav="overlay"`: the nav sits transparent over this band
 * and turns light at the sentinel on its foot (`data-nav-flip`).
 */
export function PageHero({
  id = "top",
  eyebrow,
  title,
  lead,
  actions,
  children,
  align = "center",
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string | readonly string[];
  lead?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  align?: "center" | "start";
  className?: string;
}) {
  const lines = typeof title === "string" ? [title] : title;
  const centred = align === "center";

  return (
    <Band id={id} tone="ink" className={cn("overflow-clip pb-20 pt-32 sm:pb-24 sm:pt-36 lg:pb-28 lg:pt-40", className)}>
      <div aria-hidden="true" className="dm-page-ground pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden="true" className="dm-grain dm-grain-faint pointer-events-none absolute inset-0 -z-10" />

      <Frame width="wide" className={cn("flex flex-col gap-6", centred ? "items-center text-center" : "items-start")}>
        {eyebrow ? (
          <Enter>
            <p className="label inline-flex items-center gap-2 rounded-pill border border-band-rule-strong px-3 py-1.5 text-band-fg">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-band-signal" />
              {eyebrow}
            </p>
          </Enter>
        ) : null}

        <Enter delay={0.07}>
          <h1
            className={cn(
              "max-w-[52rem] text-balance font-display text-display-2 font-medium tracking-[-0.035em] text-band-fg sm:text-[clamp(2.5rem,1.6rem+3vw,4rem)]",
            )}
          >
            {lines.map((line, i) => (
              <span
                key={line}
                className={cn(
                  "block",
                  i === 1 &&
                    "bg-[linear-gradient(90deg,#ffffff_12%,rgb(105_211_190)_62%,rgb(62_186_244)_98%)] bg-clip-text pb-[0.12em] text-transparent",
                )}
              >
                {line}
              </span>
            ))}
          </h1>
        </Enter>

        {lead ? (
          <Enter delay={0.14}>
            <div className={cn("max-w-[38rem] text-pretty text-body-sm leading-relaxed text-band-muted", centred && "mx-auto")}>
              {lead}
            </div>
          </Enter>
        ) : null}

        {actions ? (
          <Enter delay={0.21} className={cn("mt-1 flex flex-wrap items-center gap-3", centred && "justify-center")}>
            {actions}
          </Enter>
        ) : null}

        {children ? (
          <Enter delay={0.28} className="mt-4 w-full">
            {children}
          </Enter>
        ) : null}
      </Frame>

      {/* The nav turns light as this band's foot reaches it. */}
      <div aria-hidden="true" data-nav-flip="0" className="absolute inset-x-0 bottom-0 h-px" />
    </Band>
  );
}

/**
 * The header of a logged-in work screen: no band, no animation, just the page's
 * title, one line of context and its actions, aligned to the content column.
 */
export function AppPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow ? <p className="label text-band-signal">{eyebrow}</p> : null}
        <h1 className="font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-semibold leading-tight tracking-[-0.02em] text-band-fg">
          {title}
        </h1>
        {description ? <div className="max-w-[40rem] text-[0.9375rem] leading-relaxed text-band-muted">{description}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
