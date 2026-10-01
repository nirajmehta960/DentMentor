import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HAIRLINE, Panel } from "@/components/site";
import type { Mentor } from "@/hooks/useMentors";
import { cn } from "@/lib/utils";

/**
 * The mentee dashboard's work-screen pieces. The site kit has the shells, the
 * page header and `Panel`, but nothing at dashboard density — stat tiles, panel
 * headers, empty states, status pills — so they live here, built only from kit
 * tokens. Every one of them must render inside `AppShell`.
 */

/** The soft teal wash behind active rail items, empty-state tiles and signal pills. */
export const TEAL_TINT = "bg-[rgb(15_112_93/0.08)]";

/** Below `sm`, quiet controls grow to a 44px tap target. */
export const TAP = "max-sm:h-11";

export function IconTile({
  icon: Icon,
  tone = "hairline",
  className,
}: {
  icon: LucideIcon;
  tone?: "hairline" | "tint";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-tile",
        tone === "hairline" ? "border bg-white" : TEAL_TINT,
        className,
      )}
      style={tone === "hairline" ? { borderColor: HAIRLINE } : undefined}
    >
      <Icon className="size-[1.125rem] text-band-signal" strokeWidth={1.75} />
    </span>
  );
}

/** A white hairline panel with its rows flush to the edges. */
export function DashboardPanel({
  className,
  children,
  "aria-labelledby": labelledBy,
}: {
  className?: string;
  children: ReactNode;
  "aria-labelledby"?: string;
}) {
  return (
    <Panel
      role={labelledBy ? "region" : undefined}
      aria-labelledby={labelledBy}
      className={cn("flex min-w-0 flex-col overflow-hidden", className)}
    >
      {children}
    </Panel>
  );
}

export function PanelHeader({
  id,
  title,
  description,
  action,
  children,
}: {
  id?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b px-4 py-4 sm:px-6" style={{ borderColor: HAIRLINE }}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id={id} className="text-[1rem] font-semibold leading-snug tracking-[-0.01em] text-band-fg">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-band-muted">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

/** One row of a hairline list. The first row carries no top rule. */
export const LIST_ROW = "border-t first:border-t-0 px-4 py-4 sm:px-6";
export const ROW_RULE = { borderColor: HAIRLINE } as const;

/** A teal icon tile, one sentence, one action. */
export function EmptyState({ icon, message, action }: { icon: LucideIcon; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
      <IconTile icon={icon} tone="tint" className="size-12" />
      <p className="max-w-[22rem] text-[0.9375rem] leading-relaxed text-band-muted">{message}</p>
      {action}
    </div>
  );
}

export function StatusPill({
  tone = "signal",
  className,
  children,
}: {
  tone?: "signal" | "neutral";
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-pill px-2.5 py-0.5 text-[0.75rem] font-medium leading-5",
        tone === "signal" ? cn(TEAL_TINT, "text-band-signal") : "bg-band-fg/[0.05] text-band-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A figure the hooks actually returned, set in tabular numerals. */
export function StatTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Panel className="flex min-w-0 flex-col gap-5 p-4 sm:p-5">
      <IconTile icon={icon} />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-display text-[1.75rem] font-semibold leading-none tracking-[-0.02em] text-band-fg tabular-nums">
          {value}
        </p>
        <p className="text-[0.875rem] font-medium leading-snug text-band-fg">{label}</p>
        {hint ? <p className="text-[0.8125rem] leading-snug text-band-muted">{hint}</p> : null}
      </div>
    </Panel>
  );
}

export function StatTileSkeleton() {
  return (
    <Panel className="flex flex-col gap-5 p-4 sm:p-5" aria-hidden="true">
      <span className="size-10 rounded-tile bg-band-fg/[0.05] motion-safe:animate-pulse" />
      <div className="flex flex-col gap-2">
        <span className="h-7 w-12 rounded-md bg-band-fg/[0.06] motion-safe:animate-pulse" />
        <span className="h-3.5 w-3/4 rounded-pill bg-band-fg/[0.04] motion-safe:animate-pulse" />
      </div>
    </Panel>
  );
}

/** Loading rows shaped like the hairline list they stand in for. */
export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={cn(LIST_ROW, "flex items-center gap-4")} style={ROW_RULE}>
          <span className="size-10 shrink-0 rounded-tile bg-band-fg/[0.05] motion-safe:animate-pulse" />
          <div className="flex flex-1 flex-col gap-2">
            <span className="h-3.5 w-2/5 rounded-pill bg-band-fg/[0.06] motion-safe:animate-pulse" />
            <span className="h-3 w-3/5 rounded-pill bg-band-fg/[0.04] motion-safe:animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "M"
  );
}

/**
 * `useMentors` substitutes this stock photo for any mentor without a picture.
 * It is a stranger's face, so it is never shown as if it were the mentor.
 */
const STOCK_PORTRAIT = "images.unsplash.com/photo-1559839734-2b71ea197ec2";

export function PersonAvatar({
  name,
  src,
  initials,
  className,
  fallbackClassName,
}: {
  name: string;
  src?: string | null;
  /** Overrides the initials derived from `name`. */
  initials?: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const usable = src && !src.includes(STOCK_PORTRAIT) ? src : undefined;
  return (
    <Avatar className={cn("size-10", className)}>
      <AvatarImage src={usable} alt="" className="object-cover" />
      <AvatarFallback
        className={cn(TEAL_TINT, "text-[0.8125rem] font-semibold text-band-signal", fallbackClassName)}
      >
        {initials || initialsOf(name)}
      </AvatarFallback>
    </Avatar>
  );
}

/*
 * Honest display helpers. The data hooks are shared and stay untouched; these
 * only decide what of their output is shown.
 *
 * Mentors are U.S. dental students and graduates, so a blanket "Dr." the hooks
 * prepend is a credential claim nobody checked — it is dropped for display.
 */
export function plainName(name?: string | null) {
  return (name ?? "").replace(/^Dr\.\s+/, "");
}

export function plainSentence(text: string) {
  return text.replace(/ with Dr\. /, " with ");
}

/** `useMentors` writes "Dental School" when a mentor gave none. */
export function mentorSchool(mentor: Mentor) {
  return mentor.school && mentor.school !== "Dental School" ? mentor.school : null;
}

/** The mentor's own listed specializations — not the "General Dentistry" default. */
export function mentorSpecialties(mentor: Mentor, count = 2) {
  return (mentor.areasOfExpertise ?? []).filter(Boolean).slice(0, count);
}

/**
 * The lowest price among the mentor's real active services. `price` on the hook
 * falls back to a made-up $100/hr, so it is never used.
 */
export function startingPrice(mentor: Mentor) {
  const prices = (mentor.mentorServices ?? [])
    .map((service) => Number(service.price))
    .filter((price) => Number.isFinite(price) && price >= 0);
  return prices.length ? Math.min(...prices) : null;
}
