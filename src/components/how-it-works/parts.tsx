import { Check, Plus, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { HAIRLINE, Reveal } from "@/components/site";
import { cn } from "@/lib/utils";

/**
 * Local building blocks shared by the marketing pages (how it works, about,
 * become a mentor). They follow the landing's construction exactly — the same
 * hairline, tile and rail — but the landing's own versions are wired to its
 * copy, so these take their content as props. Candidates for the site kit.
 *
 * Like every kit component they must render inside a `SiteShell`: colours come
 * from the band they sit in.
 */

/** An icon in the landing's hairline tile: 52px by default, 44px for dense lists. */
export function IconTile({ icon: Icon, size = "md", className }: { icon: LucideIcon; size?: "sm" | "md"; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-tile border-[1.5px] bg-white",
        size === "md" ? "size-[52px]" : "size-11",
        className,
      )}
      style={{ borderColor: HAIRLINE }}
    >
      <Icon className={cn("text-band-signal", size === "md" ? "size-6" : "size-5")} strokeWidth={1.75} />
    </span>
  );
}

/**
 * The landing's feature card. `raised` gives it a white fill and the soft teal
 * shadow, for tint and mist grounds where the translucent paper card would sink.
 */
export function FeatureCard({
  icon,
  title,
  body,
  raised = false,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  body?: ReactNode;
  raised?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-8 rounded-xl border p-6",
        raised ? "bg-white shadow-[var(--card-shadow)]" : "bg-white/70",
        className,
      )}
      style={{ borderColor: HAIRLINE }}
    >
      {icon ? <IconTile icon={icon} /> : null}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[1.125rem] font-medium leading-[1.25] tracking-[-0.01em] text-band-fg sm:text-[1.25rem]">{title}</h3>
        {body ? <p className="text-[0.9375rem] leading-[1.6] text-band-muted">{body}</p> : null}
        {children}
      </div>
    </div>
  );
}

/** A short list of facts, each on a teal check. */
export function CheckList({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-band-muted">
          <span
            aria-hidden="true"
            className="mt-[0.2rem] grid size-5 shrink-0 place-items-center rounded-full bg-[rgb(15_112_93/0.1)]"
          >
            <Check className="size-3 text-band-signal" strokeWidth={2.5} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export type RailStep = {
  readonly title: string;
  readonly body: string;
  readonly points?: readonly string[];
};

/**
 * The landing's vertical rail: numbered markers on a hairline spine, one card
 * per step. Each step reveals on its own, so never wrap this in a `Reveal`.
 */
export function StepRail({
  steps,
  label = "Step",
  className,
}: {
  steps: readonly RailStep[];
  label?: string;
  className?: string;
}) {
  return (
    <ol className={cn("relative flex flex-col gap-3 pl-12", className)}>
      <span aria-hidden="true" className="absolute bottom-10 left-[1.1875rem] top-4 w-px bg-[rgb(15_112_93/0.18)]" />

      {steps.map((step, i) => {
        const n = String(i + 1).padStart(2, "0");
        return (
          <Reveal as="li" key={step.title} delay={Math.min(i, 3) * 0.04} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-12 top-3 grid size-10 place-items-center rounded-full border-2 border-[rgb(15_112_93/0.25)] bg-white text-band-signal"
            >
              <span className="stat">{n}</span>
            </span>

            <div
              className="flex flex-col gap-1.5 rounded-[1.25rem] border bg-white p-5 shadow-[var(--card-shadow)]"
              style={{ borderColor: HAIRLINE }}
            >
              <p className="stat text-band-signal">
                {label} {n}
              </p>
              <h3 className="font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-band-fg">{step.title}</h3>
              <p className="text-[0.875rem] leading-relaxed text-band-muted">{step.body}</p>
              {step.points?.length ? <CheckList items={step.points} className="mt-2 gap-2 [&_li]:text-[0.875rem]" /> : null}
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}

export type FaqEntry = {
  readonly slug: string;
  readonly question: string;
  readonly answer: string;
};

/**
 * A local copy of the landing FAQ's accordion (`.dm-faq-panel` in site.css does
 * the height and visibility). One open at a time, the first open on arrival.
 * `idPrefix` keeps ids unique if two lists ever share a page.
 */
export function FaqList({ items, idPrefix = "faq" }: { items: readonly FaqEntry[]; idPrefix?: string }) {
  const [openSlug, setOpenSlug] = useState<string | null>(items[0]?.slug ?? null);

  return (
    <ul className="border-b" style={{ borderColor: HAIRLINE }}>
      {items.map((item, i) => {
        const open = openSlug === item.slug;
        const questionId = `${idPrefix}-${item.slug}-q`;
        const answerId = `${idPrefix}-${item.slug}-a`;

        return (
          <li key={item.slug} className="border-t" style={{ borderColor: HAIRLINE }}>
            <Reveal delay={Math.min(i, 2) * 0.05}>
              <h3>
                <button
                  type="button"
                  id={questionId}
                  aria-expanded={open}
                  aria-controls={answerId}
                  onClick={() => setOpenSlug(open ? null : item.slug)}
                  className="group flex min-h-11 w-full items-start justify-between gap-6 rounded-[0.25rem] py-6 text-left sm:gap-10"
                >
                  <span className="text-[1.0625rem] font-medium leading-[1.45] tracking-[-0.011em] text-band-fg sm:text-[1.1875rem]">
                    {item.question}
                  </span>
                  <Plus
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className={cn(
                      "mt-1 size-5 shrink-0 transition-[transform,color] duration-300 ease-dm",
                      open ? "rotate-45 text-band-signal" : "text-band-faint group-hover:text-band-fg",
                    )}
                  />
                </button>
              </h3>

              <div id={answerId} role="region" aria-labelledby={questionId} data-open={open ? "" : undefined} className="dm-faq-panel">
                <div className="overflow-hidden">
                  <p className="max-w-[44rem] pb-7 pr-6 text-[0.9375rem] leading-[1.7] text-band-muted sm:pr-14">{item.answer}</p>
                </div>
              </div>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The glass treatment the landing hero gives its secondary action, for a
 * `secondary` SiteCta sitting on a `PageHero`'s ink ground.
 */
export const HERO_GLASS = "border-white/20 bg-white/5 text-white backdrop-blur-md hover:border-white/40 hover:bg-white/10";
