import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// From chrome.tsx directly, not the kit index: ProfileImageCropper imports this
// file and is itself imported by ProfileDropdown, which the kit's nav imports, so
// going through the index would close a module cycle and read HAIRLINE before init.
import { HAIRLINE, Panel } from "@/components/site/chrome";
import { cn } from "@/lib/utils";

/**
 * The mentor dashboard's work-screen pieces, built on the site kit.
 *
 * Two families, and the split matters:
 *
 *   Page pieces (WorkPanel, PanelHeader, StatTile, EmptyState, Segmented,
 *   SkeletonRows) use `band-*` utilities, so they must render inside the
 *   dashboard's `AppShell`.
 *
 *   Portal-safe pieces (IconTile, StatusPill, MetaLabel) use fixed colours or the
 *   app theme tokens, because dialogs, popovers and menus portal to <body>,
 *   outside `[data-dm-site]`, where no band token resolves.
 */

/** Inline hairline, because `[data-dm-site] *` outranks a border-colour utility. */
export const hairline: CSSProperties = { borderColor: HAIRLINE };

/** Hairline row dividers. The divide selector outranks the kit's border reset. */
export const DIVIDED = "divide-y divide-[#E3ECEA]";

/** A white hairline panel on the mist ground. */
export function WorkPanel({ className, style, ...props }: ComponentPropsWithoutRef<"div">) {
  return <Panel className={cn("overflow-hidden", className)} style={{ ...hairline, ...style }} {...props} />;
}

/** A panel's title row: optional icon tile, one title, one line of context, actions. */
export function PanelHeader({
  icon,
  title,
  description,
  actions,
  className,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-4 border-b px-5 py-4 sm:px-6", className)} style={hairline}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {icon ? <IconTile icon={icon} /> : null}
          <div className="min-w-0">
            <h2 className="truncate font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-band-fg">
              {title}
            </h2>
            {description ? <p className="text-[0.8125rem] leading-relaxed text-band-muted">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

/** A 40px hairline tile holding one brand-teal icon. Portal-safe. */
export function IconTile({
  icon: Icon,
  size = "md",
  className,
}: {
  icon: LucideIcon;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-tile border-[1.5px] bg-white",
        size === "md" ? "size-10" : "size-[52px]",
        className,
      )}
      style={hairline}
    >
      <Icon className={cn("text-primary", size === "md" ? "size-[18px]" : "size-6")} strokeWidth={1.75} />
    </span>
  );
}

/** A small tracked uppercase label that works in portals, where `.label` doesn't exist. */
export function MetaLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[0.6875rem] font-semibold uppercase leading-[1.4] tracking-[0.14em] text-muted-foreground", className)}>
      {children}
    </p>
  );
}

type Tone = "teal" | "amber" | "muted" | "ink";

const TONES: Record<Tone, string> = {
  teal: "bg-[rgb(15_112_93/0.08)] text-[rgb(15_112_93)] ring-[rgb(15_112_93/0.18)]",
  amber: "bg-[rgb(245_158_11/0.12)] text-[rgb(146_64_14)] ring-[rgb(217_119_6/0.24)]",
  muted: "bg-[rgb(9_67_56/0.04)] text-[rgb(65_98_91)] ring-[rgb(9_67_56/0.1)]",
  ink: "bg-[rgb(9_67_56/0.07)] text-[rgb(9_67_56)] ring-[rgb(9_67_56/0.12)]",
};

/** Session, request and payment statuses mapped onto the four soft tones. */
export function statusTone(status: string | null | undefined): Tone {
  switch ((status ?? "").toLowerCase()) {
    case "scheduled":
    case "confirmed":
    case "available":
    case "paid":
    case "succeeded":
      return "teal";
    case "pending":
    case "requested":
    case "processing":
      return "amber";
    case "booked":
    case "completed":
      return "ink";
    default:
      return "muted";
  }
}

/** A soft status pill. Fixed colours, so it reads the same in a dialog. */
export function StatusPill({
  status,
  tone,
  children,
  className,
}: {
  status?: string | null;
  tone?: Tone;
  children?: ReactNode;
  className?: string;
}) {
  const resolved = tone ?? statusTone(status);
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-pill px-2.5 text-[0.75rem] font-medium capitalize ring-1 ring-inset",
        TONES[resolved],
        className,
      )}
    >
      {children ?? status}
    </span>
  );
}

/** One figure: label, a tabular number, and a line saying what it counts. */
export function StatTile({
  icon,
  label,
  value,
  hint,
  loading = false,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  loading?: boolean;
}) {
  return (
    <WorkPanel className="flex flex-col gap-5 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="label text-band-muted">{label}</p>
        <IconTile icon={icon} />
      </div>
      <div className="flex flex-col gap-1">
        {loading ? (
          <span aria-hidden="true" className="h-8 w-20 rounded-md bg-band-fg/[0.06] motion-safe:animate-pulse" />
        ) : (
          <span className="font-display text-[1.75rem] font-semibold leading-none tracking-[-0.02em] text-band-fg tabular-nums">
            {value}
          </span>
        )}
        {hint ? <span className="text-[0.8125rem] text-band-muted">{hint}</span> : null}
      </div>
    </WorkPanel>
  );
}

/** Teal icon tile, one sentence, one action. */
export function EmptyState({
  icon,
  children,
  action,
  className,
}: {
  icon: LucideIcon;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-4 px-6 py-12 text-center", className)}>
      <IconTile icon={icon} size="lg" />
      <p className="max-w-[22rem] text-pretty text-[0.9375rem] leading-relaxed text-band-muted">{children}</p>
      {action ? <div className="flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

/** Placeholder rows while a list loads. */
export function SkeletonRows({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex flex-col gap-3 p-5 sm:p-6", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="size-10 shrink-0 rounded-tile bg-band-fg/[0.05] motion-safe:animate-pulse" />
          <span className="flex flex-1 flex-col gap-2">
            <span className="h-3.5 w-2/3 rounded bg-band-fg/[0.06] motion-safe:animate-pulse" />
            <span className="h-3 w-1/3 rounded bg-band-fg/[0.04] motion-safe:animate-pulse" />
          </span>
        </div>
      ))}
    </div>
  );
}

/** A pill filter group. `aria-pressed` buttons, so each choice is a toggle. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex max-w-full gap-1 overflow-x-auto rounded-pill bg-band-fg/[0.05] p-1 scrollbar-hide", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative inline-flex h-9 shrink-0 items-center rounded-pill px-3.5 text-[0.8125rem] font-medium transition-colors",
              // 36px visual, 44px hit area (the group's p-1 leaves room for it).
              "after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
              active ? "bg-white text-band-fg shadow-[var(--card-shadow)]" : "text-band-muted hover:text-band-fg",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** A calendar-leaf date: month over day, tabular. */
export function DateLeaf({ date, className }: { date: Date; className?: string }) {
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-12 shrink-0 flex-col items-center justify-center rounded-tile border-[1.5px] bg-white leading-none",
        className,
      )}
      style={hairline}
    >
      <span className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-primary">{month}</span>
      <span className="mt-1 text-[1.0625rem] font-semibold text-foreground tabular-nums">{date.getDate()}</span>
    </span>
  );
}

/** Dollars, without trailing zeros on whole amounts. */
export function formatUsd(amount: number | null | undefined) {
  const value = Number(amount) || 0;
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
