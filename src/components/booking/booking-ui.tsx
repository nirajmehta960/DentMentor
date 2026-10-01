import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { LABEL } from "@/components/mentors/mentor-display";
import { cn } from "@/lib/utils";

/**
 * Shared pieces of the booking dialog. The dialog is portalled out of the site
 * scope, so these use the app tokens — which match the paper band exactly.
 */

/** One step's heading: a numbered label, one clear title, one line of context. */
export function StepHeading({
  step,
  title,
  description,
  className,
}: {
  step: string;
  title: string;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <p className={cn(LABEL, "text-primary")}>{step}</p>
      <h3 className="text-balance font-display text-xl font-semibold tracking-[-0.02em] text-foreground sm:text-[1.375rem]">
        {title}
      </h3>
      {description ? <p className="text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
  );
}

/** The 52px hairline icon tile the landing uses. */
export function IconTile({
  icon: Icon,
  tone = "signal",
  className,
}: {
  icon: LucideIcon;
  tone?: "signal" | "muted" | "alert";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-[52px] shrink-0 place-items-center rounded-tile border-[1.5px] border-border bg-white",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        strokeWidth={1.75}
        className={cn(
          "size-6",
          tone === "signal" && "text-primary",
          tone === "muted" && "text-muted-foreground",
          tone === "alert" && "text-destructive",
        )}
      />
    </span>
  );
}

/** A centred empty, error or waiting state inside a step. */
export function StepState({
  icon,
  tone,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  tone?: "signal" | "muted" | "alert";
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
      <IconTile icon={icon} tone={tone} />
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-lg font-semibold tracking-[-0.01em] text-foreground">{title}</h3>
        {children ? <div className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">{children}</div> : null}
      </div>
      {action}
    </div>
  );
}
