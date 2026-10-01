import * as SliderPrimitive from "@radix-ui/react-slider";
import { useId, useState } from "react";

import { Band, BandHeader, Frame, HAIRLINE, Label, Reveal, WIDE_RAIL } from "@/components/site";
import { EARNINGS } from "./content";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Average weeks in a month, as the previous calculator used. */
const WEEKS_PER_MONTH = 4.33;
const WEEKS_PER_YEAR = 52;

/**
 * A slider in the site's colours. The shared `ui/slider` paints its track with
 * `bg-secondary`, which is now the commitment orange, so this one is local.
 * The root is 44px tall so the whole row is the tap target, not just the thumb.
 */
function RangeField({
  label,
  value,
  display,
  min,
  max,
  step,
  formatBound = String,
  onValueChange,
}: {
  label: string;
  value: number[];
  display: string;
  min: number;
  max: number;
  step: number;
  formatBound?: (n: number) => string;
  onValueChange: (value: number[]) => void;
}) {
  const labelId = useId();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <span id={labelId} className="text-[0.9375rem] font-medium text-band-fg">
          {label}
        </span>
        <span className="font-display text-[1.25rem] font-semibold tracking-[-0.01em] text-band-signal" data-numeric="">
          {display}
        </span>
      </div>
      <SliderPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        className="relative flex h-11 w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[rgb(15_112_93/0.12)]">
          <SliderPrimitive.Range className="absolute h-full bg-band-signal" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-labelledby={labelId}
          aria-valuetext={display}
          className="block size-6 rounded-full border-2 border-band-signal bg-white shadow-[0_2px_8px_rgb(9_67_56/0.18)]"
        />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-[0.75rem] text-band-faint" data-numeric="" aria-hidden="true">
        <span>{formatBound(min)}</span>
        <span>{formatBound(max)}</span>
      </div>
    </div>
  );
}

/**
 * An example, labelled as one: the visitor picks a price per session and a
 * number of sessions a week, and sees what that multiplies to. No rate tables,
 * no "typical" figures — the only numbers on screen are the ones they chose.
 */
export const EarningsCalculator = () => {
  const [price, setPrice] = useState<number[]>([EARNINGS.price.initial]);
  const [sessions, setSessions] = useState<number[]>([EARNINGS.sessions.initial]);

  const weekly = price[0] * sessions[0];
  const totals: Record<(typeof EARNINGS.results)[number]["key"], number> = {
    week: weekly,
    month: Math.round(weekly * WEEKS_PER_MONTH),
    year: weekly * WEEKS_PER_YEAR,
  };

  return (
    <Band id="earnings" tone="mist">
      <Frame width="wide" className={`flex flex-col gap-12 ${WIDE_RAIL}`}>
        <Reveal>
          <BandHeader eyebrow={EARNINGS.eyebrow} heading={EARNINGS.heading} lead={EARNINGS.lead} plainHeading />
        </Reveal>

        <div className="grid items-stretch gap-4 lg:grid-cols-2">
          <Reveal className="min-w-0">
            <div
              className="flex h-full flex-col gap-8 rounded-xl border bg-white p-6 shadow-[var(--card-shadow)] sm:p-8"
              style={{ borderColor: HAIRLINE }}
            >
              <h3 className="font-display text-[1.25rem] font-semibold tracking-[-0.01em] text-band-fg">{EARNINGS.panelTitle}</h3>
              <RangeField
                label={EARNINGS.price.label}
                value={price}
                display={usd.format(price[0])}
                min={EARNINGS.price.min}
                max={EARNINGS.price.max}
                step={EARNINGS.price.step}
                formatBound={(n) => usd.format(n)}
                onValueChange={setPrice}
              />
              <RangeField
                label={EARNINGS.sessions.label}
                value={sessions}
                display={`${sessions[0]} ${sessions[0] === 1 ? "session" : "sessions"}`}
                min={EARNINGS.sessions.min}
                max={EARNINGS.sessions.max}
                step={EARNINGS.sessions.step}
                onValueChange={setSessions}
              />
            </div>
          </Reveal>

          <Reveal delay={0.06} className="min-w-0">
            <div
              className="flex h-full flex-col gap-6 rounded-xl border bg-white p-6 shadow-[var(--card-shadow)] sm:p-8"
              style={{ borderColor: HAIRLINE }}
            >
              <Label>{EARNINGS.resultsLabel}</Label>
              <dl className="flex flex-col">
                {EARNINGS.results.map((result) => (
                  <div
                    key={result.key}
                    className="flex items-baseline justify-between gap-4 border-t py-4 first:border-t-0 first:pt-0"
                    style={{ borderColor: HAIRLINE }}
                  >
                    <dt className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[0.9375rem] font-medium text-band-fg">{result.label}</span>
                      <span className="text-[0.8125rem] text-band-faint">{result.caption}</span>
                    </dt>
                    <dd
                      className="shrink-0 font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-semibold tracking-[-0.02em] text-band-fg"
                      data-numeric=""
                    >
                      {usd.format(totals[result.key])}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-auto border-t pt-5 text-[0.8125rem] leading-relaxed text-band-muted" style={{ borderColor: HAIRLINE }}>
                {EARNINGS.footnote}
              </p>
              {/* One polite summary for screen readers, rather than three regions
                  announcing on every slider step. */}
              <p className="sr-only" aria-live="polite">
                {`Example: ${usd.format(totals.week)} per week, ${usd.format(totals.month)} per month, ${usd.format(totals.year)} per year.`}
              </p>
            </div>
          </Reveal>
        </div>
      </Frame>
    </Band>
  );
};
