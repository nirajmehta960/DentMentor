import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Band, Enter, Frame, HAIRLINE, Panel } from "@/components/site";
import { cn } from "@/lib/utils";

/**
 * The booking result pages (/booking/success, /booking/cancel): one centred
 * panel on a mist ground, under the solid nav. Render inside `SiteShell`.
 */
export function ResultBand({ children }: { children: ReactNode }) {
  return (
    <Band
      id="booking-result"
      tone="mist"
      className="flex min-h-[calc(100svh-3.5rem)] items-center pb-20 pt-28 sm:pb-24 sm:pt-32 lg:pb-28 lg:pt-36"
    >
      <Frame width="narrow">
        <Enter>{children}</Enter>
      </Frame>
    </Band>
  );
}

export function ResultPanel({
  icon: Icon,
  tone = "signal",
  spin = false,
  title,
  lead,
  children,
  actions,
  footnote,
}: {
  icon: LucideIcon;
  tone?: "signal" | "muted" | "warn";
  spin?: boolean;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  footnote?: ReactNode;
}) {
  return (
    <Panel className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 px-5 py-10 text-center sm:px-10 sm:py-12">
      <div className="flex flex-col items-center gap-5">
        <span
          className="grid size-[52px] place-items-center rounded-tile border-[1.5px] bg-white"
          style={{ borderColor: HAIRLINE }}
        >
          <Icon
            aria-hidden="true"
            strokeWidth={1.75}
            className={cn(
              "size-6",
              tone === "signal" && "text-band-signal",
              tone === "muted" && "text-band-faint",
              tone === "warn" && "text-secondary",
              spin && "animate-spin",
            )}
          />
        </span>
        <div className="flex flex-col gap-3">
          <h1 className="text-balance font-display text-display-3 font-medium tracking-[-0.03em] text-band-fg">{title}</h1>
          {lead ? <div className="mx-auto max-w-[30rem] text-pretty text-body-sm leading-relaxed text-band-muted">{lead}</div> : null}
        </div>
      </div>

      {children}

      {actions ? (
        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          {actions}
        </div>
      ) : null}

      {footnote ? <p className="stat text-band-faint">{footnote}</p> : null}
    </Panel>
  );
}

/** A label/value list for the session's details. */
export function DetailList({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="w-full overflow-hidden rounded-xl border bg-white text-left" style={{ borderColor: HAIRLINE }}>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={cn("flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-baseline sm:gap-6 sm:px-5", i > 0 && "border-t")}
          style={i > 0 ? { borderColor: HAIRLINE } : undefined}
        >
          <dt className="label shrink-0 text-band-faint sm:w-20">{row.label}</dt>
          <dd className="min-w-0 text-[0.9375rem] font-medium text-band-fg" data-numeric="">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** "What happens next" — each line must be something the product actually does. */
export function NextSteps({ items }: { items: { icon: LucideIcon; title: string; body: string }[] }) {
  return (
    <div className="flex w-full flex-col gap-4 text-left">
      <p className="label text-band-signal">What happens next</p>
      <ul className="flex flex-col gap-4">
        {items.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex items-start gap-3.5">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-tile border-[1.5px] bg-white"
              style={{ borderColor: HAIRLINE }}
            >
              <Icon className="size-[1.125rem] text-band-signal" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="flex flex-col gap-0.5 pt-0.5">
              <span className="text-[0.9375rem] font-semibold text-band-fg">{title}</span>
              <span className="text-sm leading-relaxed text-band-muted">{body}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
