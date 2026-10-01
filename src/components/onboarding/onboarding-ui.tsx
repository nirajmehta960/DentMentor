import { ArrowLeft, Check, Plus, X, type LucideIcon } from "lucide-react";
import { createContext, useContext, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { AppPageHeader, AppShell, DentMark, Frame, HAIRLINE, Panel, Wordmark } from "@/components/site";
import { cn } from "@/lib/utils";

/**
 * The chrome both onboarding flows share (mentor `/onboarding`, mentee
 * `/mentee-onboarding`): a minimal top bar, a numbered stepper in the style of
 * the landing's how-it-works rail, one centred panel per step, and a sticky
 * action footer. Presentation only — every step keeps its own state, validation
 * and handlers.
 *
 * Inside `[data-dm-site]` the kit sets `border-color` on every element, which
 * beats Tailwind border-colour utilities on source order. State-dependent edges
 * are therefore set through `style`, the way the kit applies `HAIRLINE`.
 */

/** A selected control's edge: brand teal at the strength that reads on white. */
export const SELECTED_EDGE = "rgb(15 112 93 / 0.55)";
/** The dashed edge of an upload zone — a touch stronger than a hairline, so the dashes read. */
export const DASHED_EDGE = "rgb(9 67 56 / 0.22)";
const SIGNAL = "rgb(15 112 93)";
/* The landing's how-it-works rail: the line and an unvisited circle's edge. */
const RAIL = "rgb(15 112 93 / 0.18)";
const RAIL_CIRCLE = "rgb(15 112 93 / 0.25)";

export type OnboardingStepMeta = {
  id: number;
  title: string;
  icon?: LucideIcon;
};

type FlowContextValue = { flowLabel: string; currentStep: number; totalSteps: number };
const FlowContext = createContext<FlowContextValue | null>(null);

/* ── SHELL ─────────────────────────────────────────────────────────────── */

export function OnboardingShell({
  flowLabel,
  steps,
  currentStep,
  exitAction,
  children,
}: {
  /** Shown as each step's eyebrow, e.g. "Mentor profile". */
  flowLabel: string;
  steps: readonly OnboardingStepMeta[];
  currentStep: number;
  /** Optional top-bar action (the mentor flow's sign out). */
  exitAction?: ReactNode;
  children: ReactNode;
}) {
  const totalSteps = steps.length;

  return (
    <AppShell nav={false}>
      <OnboardingTopBar currentStep={currentStep} totalSteps={totalSteps} exitAction={exitAction} />

      <Frame width="narrow" className="flex flex-col gap-8 pb-16 pt-8 sm:gap-10 sm:pb-24 sm:pt-12">
        <OnboardingStepper steps={steps} currentStep={currentStep} />

        <FlowContext.Provider value={{ flowLabel, currentStep, totalSteps }}>
          {/* No bottom padding: every step ends on `StepActions`, which carries its own. */}
          <Panel className="px-5 pt-7 sm:px-8 sm:pt-9 lg:px-10 lg:pt-10">{children}</Panel>
        </FlowContext.Provider>
      </Frame>
    </AppShell>
  );
}

function OnboardingTopBar({
  currentStep,
  totalSteps,
  exitAction,
}: {
  currentStep: number;
  totalSteps: number;
  exitAction?: ReactNode;
}) {
  return (
    <header
      data-band="paper"
      className="sticky top-0 z-40 border-b bg-band-ground/85 text-band-fg backdrop-blur-md"
      style={{ borderColor: HAIRLINE }}
    >
      <Frame width="wide" className="flex h-14 items-center justify-between gap-4 lg:h-16">
        <Link to="/" aria-label="DentMentor home" className="flex min-h-11 items-center gap-2.5 rounded-[0.375rem]">
          <DentMark />
          <Wordmark className="hidden min-[360px]:inline" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <p className="label whitespace-nowrap text-band-muted" data-numeric="">
            Step <span className="text-band-fg">{currentStep}</span> of {totalSteps}
          </p>
          {exitAction}
        </div>
      </Frame>
    </header>
  );
}

/* ── STEPPER ───────────────────────────────────────────────────────────── */

export function OnboardingStepper({
  steps,
  currentStep,
}: {
  steps: readonly OnboardingStepMeta[];
  currentStep: number;
}) {
  return (
    <div>
      <ol aria-label="Onboarding progress" className="flex items-start">
        {steps.map((step, i) => {
          const state = step.id < currentStep ? "done" : step.id === currentStep ? "current" : "upcoming";
          const isLast = i === steps.length - 1;

          return (
            <li
              key={step.id}
              aria-current={state === "current" ? "step" : undefined}
              className="relative flex min-w-0 flex-1 flex-col items-center gap-2.5 text-center"
            >
              {/* The rail to the next circle: filled once this step is behind you. */}
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[calc(50%+1.5rem)] right-[calc(-50%+1.5rem)] top-[1.0625rem] h-0.5 rounded-full sm:top-[1.1875rem]"
                  style={{ backgroundColor: state === "done" ? SIGNAL : RAIL }}
                />
              ) : null}

              <span
                aria-hidden="true"
                className={cn(
                  "relative grid size-9 place-items-center rounded-full border-2 transition-colors duration-300 ease-dm sm:size-10",
                  state === "done" && "bg-band-signal text-white",
                  state === "current" && "bg-white text-band-signal ring-4 ring-[rgb(15_112_93/0.1)]",
                  state === "upcoming" && "bg-white text-band-faint",
                )}
                style={{ borderColor: state === "upcoming" ? RAIL_CIRCLE : SIGNAL }}
              >
                {state === "done" ? (
                  <Check className="size-4" strokeWidth={2.5} />
                ) : (
                  <span className="stat">{String(step.id).padStart(2, "0")}</span>
                )}
              </span>

              <span
                className={cn(
                  "sr-only sm:not-sr-only sm:max-w-[8rem] sm:text-[0.75rem] sm:leading-snug",
                  state === "current" && "font-medium text-band-fg",
                  state === "done" && "text-band-muted",
                  state === "upcoming" && "text-band-faint",
                )}
              >
                {step.title}
                <span className="sr-only">
                  {state === "done" ? " (completed)" : state === "current" ? " (current step)" : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ── STEP CONTENT ──────────────────────────────────────────────────────── */

/** An icon in the kit's 48px hairline tile. */
export function IconTile({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("grid size-12 shrink-0 place-items-center rounded-tile border-[1.5px] bg-white", className)}
      style={{ borderColor: HAIRLINE }}
    >
      <Icon className="size-[1.375rem] text-band-signal" strokeWidth={1.75} />
    </span>
  );
}

/** The step's title row — the page's one <h1>, with the flow as its eyebrow. */
export function StepHeader({
  icon,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
}) {
  const flow = useContext(FlowContext);
  return (
    <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-start">
      {icon ? <IconTile icon={icon} /> : null}
      <AppPageHeader eyebrow={flow?.flowLabel} title={title} description={description} className="min-w-0 flex-1" />
    </div>
  );
}

/** A group of fields. Sections after the first are separated by a hairline. */
export function FormSection({
  title,
  titleId,
  description,
  optional = false,
  required = false,
  children,
  className,
}: {
  title?: string;
  /** Lets a radio or checkbox group name itself with `aria-labelledby`. */
  titleId?: string;
  description?: ReactNode;
  optional?: boolean;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-5 border-t pt-8 first:border-t-0 first:pt-0", className)}>
      {title ? (
        <div className="flex flex-col gap-1">
          <h2 className="flex flex-wrap items-baseline gap-x-2 text-[1.0625rem] font-semibold tracking-[-0.01em] text-band-fg">
            <span id={titleId}>
              {title}
              {required ? <RequiredMark /> : null}
            </span>
            {optional ? <span className="label text-band-faint">Optional</span> : null}
          </h2>
          {description ? <p className="text-[0.875rem] leading-relaxed text-band-muted">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** The required-field marker, kept visible but out of the accessible name's way. */
export function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-band-signal">
      *
    </span>
  );
}

/** Small supporting text under a field. */
export function FieldHint({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <p id={id} className={cn("text-[0.8125rem] leading-relaxed text-band-muted", className)}>
      {children}
    </p>
  );
}

/**
 * A radio or checkbox laid out as a card. `htmlFor` must point at the control's
 * id, as the original markup did; the card is the label, so the whole surface is
 * the hit area.
 */
export function ChoiceCard({
  htmlFor,
  selected,
  control,
  title,
  description,
  className,
}: {
  htmlFor: string;
  selected: boolean;
  control: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border bg-white px-4 py-3.5 transition-colors duration-200 ease-dm",
        selected ? "bg-[rgb(15_112_93/0.04)]" : "hover:bg-band-ground",
        className,
      )}
      style={{ borderColor: selected ? SELECTED_EDGE : HAIRLINE }}
    >
      <span className="mt-0.5 flex shrink-0">{control}</span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[0.9375rem] font-medium leading-snug text-band-fg">{title}</span>
        {description ? <span className="text-[0.8125rem] leading-relaxed text-band-muted">{description}</span> : null}
      </span>
    </label>
  );
}

/** A chosen value with a remove control. The 28px button carries a 44px hit area. */
export function RemovableTag({
  children,
  onRemove,
  removeLabel,
}: {
  children: ReactNode;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <li className="inline-flex max-w-full items-center gap-0.5 rounded-pill bg-[rgb(15_112_93/0.08)] py-1 pl-3 pr-1 text-[0.8125rem] font-medium text-band-signal">
      <span className="min-w-0 truncate">{children}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="relative grid size-7 shrink-0 place-items-center rounded-full transition-colors hover:bg-[rgb(15_112_93/0.12)] after:absolute after:-inset-2 after:content-['']"
      >
        <X className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
      </button>
    </li>
  );
}

export function TagList({ children, label }: { children: ReactNode; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {children}
    </ul>
  );
}

/** A one-tap "add this option" pill. */
export function AddChip({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-2 rounded-pill border bg-white px-4 text-left text-[0.875rem] font-medium text-band-fg transition-colors duration-200 ease-dm hover:bg-band-ground"
      style={{ borderColor: HAIRLINE }}
    >
      <Plus className="size-4 shrink-0 text-band-signal" strokeWidth={2} aria-hidden="true" />
      {children}
    </button>
  );
}

/* ── ACTIONS ───────────────────────────────────────────────────────────── */

/**
 * The step's action bar. Sticky to the viewport's foot while the step scrolls,
 * resting on the panel's bottom edge once you reach it. `onBack` renders the
 * outline Back button; `children` are the forward actions, right-aligned.
 */
export function StepActions({
  onBack,
  backLabel = "Back",
  children,
}: {
  onBack?: () => void;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-5 mt-10 flex items-center justify-between gap-3 rounded-b-panel border-t bg-band-raised/95 px-5 pt-4 backdrop-blur-md",
        "pb-[max(1rem,env(safe-area-inset-bottom))] sm:-mx-8 sm:px-8 sm:pb-5 sm:pt-5 lg:-mx-10 lg:px-10",
      )}
    >
      {onBack ? (
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="shrink-0 px-4 sm:px-6">
          <ArrowLeft aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{backLabel}</span>
        </Button>
      ) : (
        <span aria-hidden="true" />
      )}
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">{children}</div>
    </div>
  );
}
